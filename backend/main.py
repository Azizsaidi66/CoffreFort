# backend/main.py
import os
import uuid
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware

STORAGE_DIR = os.path.join(os.path.dirname(__file__), "..", "storage", "documents")
os.makedirs(STORAGE_DIR, exist_ok=True)

app = FastAPI(title="Coffre-Fort Backend - Simple Upload")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "backend running"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Reçoit un fichier multipart/form-data (champ 'file'),
    le sauvegarde dans storage/documents et retourne métadonnées.
    """
    try:
        ext = os.path.splitext(file.filename)[1]
        safe_name = f"{uuid.uuid4().hex}{ext}"
        save_path = os.path.join(STORAGE_DIR, safe_name)

        with open(save_path, "wb") as f:
            content = await file.read()
            f.write(content)

        return JSONResponse({
            "status": "ok",
            "original_filename": file.filename,
            "stored_filename": safe_name,
            "download_url": f"/files/{safe_name}"
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents")
def list_documents():
    """
    Retourne la liste des fichiers stockés (filename + size + url).
    """
    files = []
    for name in sorted(os.listdir(STORAGE_DIR), reverse=True):
        path = os.path.join(STORAGE_DIR, name)
        if os.path.isfile(path):
            files.append({
                "stored_filename": name,
                "size_bytes": os.path.getsize(path),
                "download_url": f"/files/{name}"
            })
    return {"documents": files}

@app.get("/files/{filename}")
def download_file(filename: str):
    """
    Télécharge un fichier stocké. Vérifie qu'on reste dans le dossier STORAGE_DIR.
    """
    # éviter path traversal
    if ".." in filename or filename.startswith("/"):
        raise HTTPException(status_code=400, detail="Invalid filename")
    path = os.path.join(STORAGE_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path, filename=filename)
