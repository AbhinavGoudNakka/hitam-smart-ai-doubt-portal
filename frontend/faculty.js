const API = "http://127.0.0.1:8000";

// ==============================
// Load All Doubts
// ==============================

async function loadFaculty() {

    const response = await fetch(API + "/doubts");
    const doubts = await response.json();

    let html = "";

    doubts.forEach(d => {

        html += `
        <tr>

            <td>${d.id}</td>

            <td>${d.student_name}</td>

            <td>${d.category}</td>

            <td>${d.question}</td>

            <td>${d.answer}</td>

            <td>

                <textarea
                    id="reply${d.id}"
                    rows="4"
                    style="width:100%;"
                >${d.faculty_answer}</textarea>

            </td>

            <td>

                <button onclick="verifyDoubt(${d.id})">
                    ✅ Verify
                </button>

            </td>

        </tr>
        `;

    });

    document.getElementById("doubtTable").innerHTML = html;
}


// ==============================
// Verify Doubt
// ==============================


async function verifyDoubt(id) {

    const answer = document.getElementById("reply" + id).value;

    const response = await fetch(API + "/doubts/" + id, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            faculty_answer: answer,
            faculty_id: "FAC001"
        })
    });

    if (response.ok) {
        alert("✅ Faculty reply submitted successfully.");
        loadFaculty();
    } else {
        alert("❌ Failed to submit reply.");
    }
}
// ==============================
// Search
// ==============================

function searchDoubts() {

    const input =
        document.getElementById("search").value.toLowerCase();

    const rows =
        document.querySelectorAll("#doubtTable tr");

    rows.forEach(row => {

        if (row.innerText.toLowerCase().includes(input)) {

            row.style.display = "";

        } else {

            row.style.display = "none";

        }

    });

}


// ==============================

loadFaculty();