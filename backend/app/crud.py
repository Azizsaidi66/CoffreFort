from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from passlib.context import CryptContext
from datetime import datetime
from .models import Base, User, TemporaryAccess
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://mayan:mayanpass@postgres:5432/mayan")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def init_db_if_needed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    if db.query(User).filter_by(email="admin@example.com").first() is None:
        admin = User(
            email="admin@example.com",
            password_hash=pwd_context.hash("adminpass"),
            role="admin"
        )
        db.add(admin)
        db.commit()
    if db.query(User).filter_by(email="user@example.com").first() is None:
        user = User(
            email="user@example.com",
            password_hash=pwd_context.hash("userpass"),
            role="user"
        )
        db.add(user)
        db.commit()
    db.close()

def get_user_by_email(email):
    db = SessionLocal()
    u = db.query(User).filter_by(email=email).first()
    db.close()
    return u

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def grant_temporary_access(email, document_id, duration_seconds):
    db = SessionLocal()
    user = db.query(User).filter_by(email=email).firs_