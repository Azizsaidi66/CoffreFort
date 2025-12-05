const API_URL = "http://localhost:8001";

// ============ AUTH ============
function getToken() {
    return localStorage.getItem("token");
}

function getUserEmail() {
    return localStorage.getItem("user_email");
}

function getUserRole() {
    return localStorage.getItem("user_role");
}

async function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_role");
    window.location.href = "login.html";
}

// ============ DOCUMENTS ============
async function loadDocuments() {
    const token = getToken();
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/documents`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            }
        });

        if (response.status === 401) {
            logout();
            return;
        }

        const documents = await response.json();
        return documents;
    } catch (error) {
        console.error("Failed to load documents:", error);
        return [];
    }
}

async function uploadDocument(title, description, file) {
    const token = getToken();
    if (!token) {
        alert("Veuillez vous connecter d'abord");
        return null;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);

    try {
        const response = await fetch(`${API_URL}/documents/upload`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            return await response.json();
        } else {
            const error = await response.json();
            alert(error.detail || "Erreur lors du téléchargement");
            return null;
        }
    } catch (error) {
        console.error("Upload error:", error);
        alert("Erreur de connexion au serveur");
        return null;
    }
}

// ============ AI ANALYSIS ============
async function analyzeDocument(documentId, text) {
    const token = getToken();
    if (!token) {
        alert("Veuillez vous connecter d'abord");
        return null;
    }

    const formData = new FormData();
    formData.append("document_id", documentId);
    formData.append("text", text);

    try {
        const response = await fetch(`${API_URL}/documents/analyze`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            return await response.json();
        } else {
            console.error("Analysis failed:", await response.json());
            return null;
        }
    } catch (error) {
        console.error("Analysis error:", error);
        return null;
    }
}

// ============ ACCESS CHECK ============
async function checkAccess() {
    const token = getToken();
    if (!token) return false;

    try {
        const response = await fetch(`${API_URL}/check-access`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        return data.allowed;
    } catch (error) {
        console.error("Access check failed:", error);
        return false;
    }
}

// ============ USER MANAGEMENT (ADMIN) ============
async function loadUsers() {
    const token = getToken();
    if (!token) return [];

    try {
        const response = await fetch(`${API_URL}/users`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            return await response.json();
        }
        return [];
    } catch (error) {
        console.error("Failed to load users:", error);
        return [];
    }
}

async function createUser(email, password, fullName, role) {
    const token = getToken();
    if (!token) return null;

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("full_name", fullName);
    formData.append("role", role);

    try {
        const response = await fetch(`${API_URL}/users`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            return await response.json();
        } else {
            const error = await response.json();
            alert(error.detail || "Erreur lors de la création");
            return null;
        }
    } catch (error) {
        console.error("Create user error:", error);
        return null;
    }
}

async function deleteUser(userId) {
    const token = getToken();
    if (!token) return false;

    try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        return response.ok;
    } catch (error) {
        console.error("Delete user error:", error);
        return false;
    }
}

// ============ ACCESS WINDOWS ============
async function setAccessWindow(userId, startTime, endTime) {
    const token = getToken();
    if (!token) return false;

    const params = new URLSearchParams({
        user_id: userId,
        start_time: startTime,
        end_time: endTime
    });

    try {
        const response = await fetch(`${API_URL}/access-windows?${params}`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        });
        return response.ok;
    } catch (error) {
        console.error("Set access window error:", error);
        return false;
    }
}

// ============ PAGE INITIALIZATION ============
document.addEventListener("DOMContentLoaded", async () => {
    const token = getToken();
    
    // Update user display
    const userEmail = getUserEmail();
    const userRole = getUserRole();
    
    if (userEmail) {
        const userInfoElements = document.querySelectorAll(".user-info span");
        userInfoElements.forEach(el => {
            if (el.textContent.includes("@") || el.textContent === "Jean Dupont") {
                el.textContent = userEmail;
            }
        });
    }

    // Add logout functionality
    const logoutButtons = document.querySelectorAll(".menu-item.logout");
    logoutButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            logout();
        });
    });

    // Load documents on documents page
    if (window.location.pathname.includes("documents.html")) {
        const documents = await loadDocuments();
        if (documents && documents.length > 0) {
            console.log("Documents loaded:", documents);
        }
    }

    // Load users on admin page
    if (window.location.pathname.includes("admin.html")) {
        if (userRole !== "admin") {
            alert("Accès administrateur requis");
            window.location.href = "dashboard.html";
            return;
        }
        
        const users = await loadUsers();
        console.log("Users loaded:", users);
    }
});