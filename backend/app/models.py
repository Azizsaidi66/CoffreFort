from datetime import datetime, timedelta
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Interval
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)             # admin, staff, guest
    active = Column(Boolean, default=True)

    temporary_access = relationship(
        "TemporaryAccess",
        back_populates="user",
        cascade="all, delete-orphan"
    )


class TemporaryAccess(Base):
    __tablename__ = "temporary_access"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    document_id = Column(Integer, nullable=False)      # Mayan document ID
    granted_at = Column(DateTime, default=datetime.utcnow)
    duration = Column(Interval, nullable=False)        # e.g. timedelta(hours=1)

    user = relationship("User", back_populates="temporary_access")

    @property
    def expires_at(self):
        return self.granted_at + self.duration

    def is_expired(self):
        return datetime.utcnow() > self.expires_at
