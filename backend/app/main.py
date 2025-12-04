from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from .auth import authenticate_user, create_access_token, get_current_user
from .mayan_client import upload_document, list_documents, get_document
from .ai_client import summarize_text
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

class Login(BaseModel):
    email: str
    password: str

@app.post("/api/login")
def login(data: Login):
    user = authenticate_user(data.email, data.password)
    if not user:
        raise HTTPException(401, "Invalid credentials")
    token = create_access_token({"sub": user.email, "role": user.role})
    return {"access_token": token, "role": user.role}

@app.post("/api/documents/upload")
def upload(file: UploadFile = File(...), current_user=Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin only")
    content = file.file.read()
    res = upload_document(file.filename, content)
    return res

@app.get("/api/documents")
def documents(current_user=Depends(get_current_user)):
    return list_documents()

@app.get("/api/documents/{doc_id}")
def document_detail(doc_id: int, current_user=Depends(get_current_user)):
    doc = get_document(doc_id)
    summary = summarize_text(doc.get("content_text"))
    return {"document": doc, "summary": summary}
