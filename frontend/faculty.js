const API = "https://hitam-ai-backend-m3ka.onrender.com";

// ==============================
// Load Faculty Dashboard
// ==============================

async function loadFaculty() {

    const response = await fetch(API + "/doubts");
    const doubts = await response.json();

    // ---------- Faculty Name ----------

    const loggedInFaculty = getFaculty();

    const facultyName =
        (loggedInFaculty && loggedInFaculty.name) ||
        "Faculty";

    const welcome = document.getElementById("facultyWelcome");

    if (welcome) {
        welcome.innerHTML = `Welcome, <b>${facultyName}</b>`;
    }

    // ---------- Statistics ----------

    const total = doubts.length;

    const pending = doubts.filter(
        d => d.status !== "Verified"
    ).length;

    const verified = doubts.filter(
        d => d.status === "Verified"
    ).length;

    document.getElementById("totalDoubts").innerHTML = total;
    document.getElementById("pendingDoubts").innerHTML = pending;
    document.getElementById("verifiedDoubts").innerHTML = verified;

    // ---------- Table ----------

    let html = "";

    doubts.reverse().forEach(d => {

        html += `
<tr>

<td>${d.id}</td>

<td>${d.student_name}</td>

<td>${d.category}</td>

<td>${d.question}</td>

<td>${d.answer || "-"}</td>

<td>

<textarea
id="reply${d.id}"
rows="4"
style="width:100%;padding:8px;border-radius:8px;">

${d.faculty_answer || ""}

</textarea>

</td>

<td>

<span class="${d.status === "Verified"
    ? "status-verified"
    : "status-pending"}">

${d.status}

</span>

</td>

<td>

<button
onclick="verifyDoubt(${d.id})">

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

    const answer =
        document.getElementById("reply" + id).value;

    const loggedInFaculty = getFaculty();

    const facultyId =
        (loggedInFaculty && loggedInFaculty.faculty_id) ||
        "FAC001";

    const response = await fetch(API + "/doubts/" + id, {

        method: "PUT",

        headers: {

            "Content-Type":"application/json"

        },

        body: JSON.stringify({

            faculty_answer: answer,

            faculty_id: facultyId

        })

    });

    if(response.ok){

        alert("✅ Doubt Verified Successfully");

        loadFaculty();

    }

    else{

        alert("❌ Verification Failed");

    }

}

// ==============================
// Search
// ==============================

function searchDoubts(){

    const input =
    document.getElementById("search")
    .value.toLowerCase();

    const rows =
    document.querySelectorAll("#doubtTable tr");

    rows.forEach(row=>{

        row.style.display =
        row.innerText.toLowerCase().includes(input)
        ? ""
        : "none";

    });

}

// ==============================
// Auto Refresh
// ==============================

setInterval(loadFaculty,10000);

// ==============================
// Initial Load
// ==============================

loadFaculty();