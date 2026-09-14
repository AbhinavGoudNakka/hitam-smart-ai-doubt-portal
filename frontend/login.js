const API = "http://127.0.0.1:8000";

async function login() {

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value;

    let url = "";
    let body = {};

    if (role === "student") {
        url = API + "/students/login";
        body = {
            roll_no: username,
            password: password
        };
    }

    else if (role === "faculty") {
        url = API + "/faculty/login";
        body = {
            faculty_id: username,
            password: password
        };
    }

    else {
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