// app.js

// Base URL of backend
const API_URL = "http://localhost:8001/api";

// Login form
const loginForm = document.querySelector(".login-form");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, role })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("token", data.access_token);
                window.location.href = "dashboard.html";
            } else {
                alert(data.detail || "Login failed");
            }
        } catch (err) {
            console.error(err);
        }
    });
}

// Upload documents (admin page)
const uploadInput = document.querySelector(".upload-input");
if (uploadInput) {
    const uploadArea = document.querySelector(".upload-area");
    uploadArea.addEventListener("click", () => uploadInput.click());
    uploadInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/documents/upload`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });
        const data = await res.json();
        if (res.ok) alert("Upload successful!");
        else alert("Upload failed");
    });
}

// Fetch documents for dashboard
async function loadDocuments() {
    const docContainer = document.querySelector(".documents-grid");
    if (!docContainer) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/documents`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    docContainer.innerHTML = "";
    data.results.forEach((doc) => {
        const div = document.createElement("div");
        div.classList.add("document-card");
        div.innerHTML = `
            <div class="document-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
            </div>
            <h4>${doc.label}</h4>
            <p>ID: ${doc.id}</p>
            <button onclick="viewSummary('${doc.id}')">Voir le résumé IA</button>
        `;
        docContainer.appendChild(div);
    });
}

async function viewSummary(id) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    alert("Résumé IA:\n" + data.summary.raw || data.summary);
}

document.addEventListener("DOMContentLoaded", () => loadDocuments());