import os
import requests

MAYAN_BASE = os.getenv("MAYAN_BASE_URL", "http://mayan:8000")
MAYAN_ADMIN_USERNAME = os.getenv("MAYAN_ADMIN_USERNAME", "admin")
MAYAN_ADMIN_PASSWORD = os.getenv("MAYAN_ADMIN_PASSWORD", "adminpass")

session = requests.Session()
# Get auth token from Mayan
def mayan_login():
    url = f"{MAYAN_BASE}/api/v4/auth/token/"
    r = session.post(url, json={"username": MAYAN_ADMIN_USERNAME, "password": MAYAN_ADMIN_PASSWORD})
    if r.ok:
        token = r.json()["access"]
        session.headers.update({"Authorization": f"Bearer {token}"})
    else:
        raise Exception("Cannot login to Mayan", r.text)

mayan_login()

def upload_document(file_name, file_bytes):
    files = {"file": (file_name, file_bytes)}
    url = f"{MAYAN_BASE}/api/documents/documents/"
    r = session.post(url, files=files)
    if r.ok:
        return r.json()
    return {"error": r.text}

def list_documents():
    url = f"{MAYAN_BASE}/api/documents/documents/"
    r = session.get(url)
    if r.ok:
        return r.json()
    return []

def get_document(doc_id):
    url = f"{MAYAN_BASE}/api/documents/documents/{doc_id}/versions/"
    r = session.get(url)
    if r.ok and r.json()["results"]:
        content_url = r.json()["results"][0]["download_url"]
        content = requests.get(content_url).content.decode("utf-8")
        return {"id": doc_id, "content_text": content}
    return {"id": doc_id, "content_text": ""}