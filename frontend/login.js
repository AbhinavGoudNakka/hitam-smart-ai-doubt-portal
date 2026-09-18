const API = "https://hitam-ai-backend-m3ka.onrender.com";


// =========================================================
// ROLE SWITCH
// ---------------------------------------------------------
// Students sign in with their Roll Number only - no password
// is collected or stored for students. Faculty and Admin keep
// password sign-in because those accounts can change data.
// =========================================================

function roleChanged() {

    const role = document.getElementById("role").value;

    const username = document.getElementById("username");
    const password = document.getElementById("password");
    const hint = document.getElementById("loginHint");

    if (role === "student") {

        username.placeholder = "Roll Number";
        password.style.display = "none";
        password.value = "";
        hint.innerHTML = "Students: just enter your Roll Number. No password needed.";

    }

    else if (role === "faculty") {

        username.placeholder = "Faculty ID";
        password.style.display = "block";
        hint.innerHTML = "Faculty accounts must be approved by an admin before first login.";

    }

    else {

        username.placeholder = "Admin Username";
        password.style.display = "block";
        hint.innerHTML = "Administrator access only.";

    }

    username.focus();

}


// Apply the correct form layout as soon as the page loads
document.addEventListener("DOMContentLoaded", roleChanged);


// =========================================================
// LOGIN
// =========================================================

async function login() {

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value;

    let url = "";
    let body = {};

    if (role === "student") {

        if (username === "") {
            alert("Please enter your Roll Number");
            return;
        }

        // Password-less student sign-in
        url = API + "/students/login-id";
        body = {
            roll_no: username
        };

    }

    else if (role === "faculty") {

        if (username === "" || password === "") {
            alert("Please enter Faculty ID and Password");
            return;
        }

        url = API + "/faculty/login";
        body = {
            faculty_id: username,
            password: password
        };

    }

    else {

        if (username === "" || password === "") {
            alert("Please enter Username and Password");
            return;
        }

        url = API + "/admin/login";
        body = {
            username: username,
            password: password
        };

    }

    try {

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.detail || "Login Failed");
            return;
        }

        localStorage.setItem("userRole", role);

        if (role === "student") {
            saveStudent(result.student);
            window.location.href = "student.html";
        }

        else if (role === "faculty") {
            saveFaculty(result.faculty);
            window.location.href = "faculty.html";
        }

        else {
            saveAdmin(result.admin);
            window.location.href = "admin.html";
        }

    }

    catch (err) {
        console.error(err);
        alert("Cannot connect to backend.");
    }

}
