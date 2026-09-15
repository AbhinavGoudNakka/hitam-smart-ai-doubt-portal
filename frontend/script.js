const API = "http://127.0.0.1:8000";

// ======================================
// LOAD ADMIN DASHBOARD
// ======================================

async function loadAdmin() {

    try {

        // -----------------------------
        // Load Statistics
        // -----------------------------
        const statsResponse = await fetch(API + "/admin/stats");
        const stats = await statsResponse.json();

        console.log("Stats:", stats);

        document.getElementById("adminStudents").innerHTML = stats.students;
        document.getElementById("adminDoubts").innerHTML = stats.total_doubts;
        document.getElementById("adminPending").innerHTML = stats.pending;
        document.getElementById("adminVerified").innerHTML = stats.verified;

        // -----------------------------
        // Load Doubts
        // -----------------------------
        const doubtsResponse = await fetch(API + "/doubts");
        const doubts = await doubtsResponse.json();

        console.log("Doubts:", doubts);

        let html = "";

        if (doubts.length === 0) {

            html = `
                <h3 style="text-align:center;color:gray;">
                    No doubts available.
                </h3>
            `;

        } else {

            doubts.reverse().forEach(d => {

                html += `
                <div class="doubt-card">

                    <h3>${d.student_name}</h3>

                    <p><b>Roll No:</b> ${d.roll_no}</p>

                    <p><b>Subject:</b> ${d.category}</p>

                    <p><b>Question:</b><br>${d.question}</p>

                    <p><b>AI Answer:</b><br>${d.answer}</p>

                    <p><b>Faculty Answer:</b><br>${d.faculty_answer}</p>

                    <p><b>Status:</b> ${d.status}</p>

                    <hr>

                </div>
                `;

            });

        }

        document.getElementById("doubts").innerHTML = html;

    } catch (error) {

        console.error("Dashboard Error:", error);
        alert("Error loading dashboard. Check Console (F12).");

    }

}

// ======================================
// SEARCH DOUBTS
// ======================================

function searchDoubts() {

    let input = document.getElementById("search").value.toLowerCase();

    let cards = document.querySelectorAll(".doubt-card");

    cards.forEach(card => {

        if (card.innerText.toLowerCase().includes(input)) {

            card.style.display = "block";

        } else {

            card.style.display = "none";

        }

    });

}

// ======================================
// LOAD FACULTY
// ======================================

async function loadFaculty() {

    try {

        const response = await fetch(API + "/faculty");
        const faculty = await response.json();

        let html = "";

        faculty.forEach(f => {

            html += `
            <tr>

                <td>${f.faculty_id}</td>
                <td>${f.name}</td>
                <td>${f.department}</td>
                <td>${f.email}</td>
                <td>${f.status}</td>

                <td>

                    <button onclick="approveFaculty('${f.faculty_id}')">
                        ✅ Approve
                    </button>

                    <button onclick="rejectFaculty('${f.faculty_id}')">
                        ❌ Reject
                    </button>

                </td>

            </tr>
            `;

        });

        document.getElementById("facultyTable").innerHTML = html;

    } catch (error) {

        console.error("Faculty Error:", error);

    }

}

// ======================================
// APPROVE FACULTY
// ======================================

async function approveFaculty(id) {

    await fetch(API + "/faculty/approve/" + id, {
        method: "PUT"
    });

    alert("Faculty Approved Successfully");

    loadFaculty();

}

// ======================================
// REJECT FACULTY
// ======================================

async function rejectFaculty(id) {

    await fetch(API + "/faculty/reject/" + id, {
        method: "PUT"
    });

    alert("Faculty Rejected");

    loadFaculty();

}

// ======================================
// INITIAL LOAD
// ======================================

// Load Admin Page Only
if (document.getElementById("adminStudents")) {
    loadAdmin();
}

// Load Faculty Page Only
if (document.getElementById("facultyTable")) {
    loadFaculty();
}async function registerStudent() {

    const student = {
        roll_no: document.getElementById("roll").value,
        name: document.getElementById("name").value,
        department: document.getElementById("department").value,
        year: document.getElementById("year").value,
        section: document.getElementById("section").value,
        password: document.getElementById("password").value
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