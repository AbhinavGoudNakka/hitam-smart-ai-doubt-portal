const API = "https://hitam-ai-backend-m3ka.onrender.com";

// ======================================
// STUDENT REGISTRATION
// ======================================

async function registerStudent() {

    const student = {
        roll_no: document.getElementById("roll").value,
        name: document.getElementById("name").value,
        department: document.getElementById("department").value,
        year: document.getElementById("year").value,
        section: document.getElementById("section").value,
        // Optional - students sign in with Roll Number only
        password: document.getElementById("password").value || null
    };

    try {

        const response = await fetch(API + "/students/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(student)
        });

        const data = await response.json();

        if (response.ok) {

            alert("Registration Successful!");

            window.location.href = "login.html";

        } else {

            alert(data.detail || "Registration Failed");

        }

    } catch (error) {

        console.error(error);

        alert("Cannot connect to backend.");

    }
}
