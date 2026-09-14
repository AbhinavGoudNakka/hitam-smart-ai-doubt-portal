const API = "https://hitam-ai-backend-m3ka.onrender.com";

let chart = null;

// ===============================
// Load Admin Dashboard
// ===============================

async function loadAdmin() {

    // Load Statistics
    const statsResponse = await fetch(API + "/admin/stats");
    const stats = await statsResponse.json();

    document.getElementById("adminStudents").innerHTML = stats.students;
    document.getElementById("adminDoubts").innerHTML = stats.total_doubts;
    document.getElementById("adminPending").innerHTML = stats.pending;
    document.getElementById("adminVerified").innerHTML = stats.verified;

    // Load Doubts
    const doubtsResponse = await fetch(API + "/doubts");
    const doubts = await doubtsResponse.json();

    let html = "";

    doubts.reverse().forEach(d => {

        html += `

<div class="doubt-card">

<h3>👨 ${d.student_name}</h3>

<p><b>Roll No :</b> ${d.roll_no}</p>

<p><b>Subject :</b> ${d.category}</p>

<p><b>Question :</b><br>${d.question}</p>

<p><b>🤖 AI Answer :</b><br>${d.answer}</p>

<p><b>👨‍🏫 Faculty Answer :</b><br>${d.faculty_answer}</p>

<p><b>Status :</b>
<span style="color:${d.status==="Verified"?"green":"orange"};">
${d.status}
</span>
</p>

${
d.verified_at
?
`<p><b>Verified At :</b> ${d.verified_at}</p>`
:
""
}

<button
onclick="deleteDoubt(${d.id})"
style="background:red;color:white;padding:8px 15px;border:none;border-radius:5px;cursor:pointer;">
Delete
</button>

<hr>

</div>

`;

    });

    document.getElementById("doubts").innerHTML = html;

    // ===============================
    // Chart
    // ===============================

    const ctx = document.getElementById("adminChart");

    if(chart){
        chart.destroy();
    }

    chart = new Chart(ctx, {

        type: "doughnut",

        data: {

            labels: [
                "Pending",
                "Verified"
            ],

            datasets: [

                {

                    data: [
                        stats.pending,
                        stats.verified
                    ],

                    backgroundColor: [
                        "#ff9800",
                        "#4caf50"
                    ]

                }

            ]

        },

        options: {

            responsive:true,

            plugins:{
                legend:{
                    position:"bottom"
                }
            }

        }

    });

}

// ===============================
// Search Doubts
// ===============================

function searchDoubts(){

    let input=document.getElementById("search").value.toLowerCase();

    let cards=document.querySelectorAll(".doubt-card");

    cards.forEach(card=>{

        if(card.innerText.toLowerCase().includes(input)){
            card.style.display="block";
        }else{
            card.style.display="none";
        }

    });

}

// ===============================
// Delete Doubt
// ===============================

async function deleteDoubt(id){

    if(!confirm("Delete this doubt?")){
        return;
    }

    await fetch(API + "/doubts/" + id,{
        method:"DELETE"
    });

    alert("Doubt Deleted Successfully");

    loadAdmin();

}

// ===============================
// Load Faculty
// ===============================

async function loadFaculty() {

    const response = await fetch(API + "/faculty");
    const faculty = await response.json();

    let html = "";

    faculty.forEach(f => {

        let action = "";

        if (f.status === "Pending") {

            action = `
<button onclick="approveFaculty('${f.faculty_id}')">
✅ Approve
</button>

<button onclick="rejectFaculty('${f.faculty_id}')">
❌ Reject
</button>
`;

        } else if (f.status === "Approved") {

            action = `<span style="color:green;font-weight:bold;">Approved</span>`;

        } else {

            action = `<span style="color:red;font-weight:bold;">Rejected</span>`;

        }

        html += `
<tr>

<td>${f.faculty_id}</td>

<td>${f.name}</td>

<td>${f.department}</td>

<td>${f.email}</td>

<td>${f.status}</td>

<td>${action}</td>

</tr>
`;

    });

    document.getElementById("facultyTable").innerHTML = html;

}

// ===============================
// Approve Faculty
// ===============================

async function approveFaculty(id) {

    await fetch(API + "/faculty/approve/" + id, {
        method: "PUT"
    });

    alert("Faculty Approved Successfully");

    loadFaculty();

}

// ===============================
// Reject Faculty
// ===============================

async function rejectFaculty(id) {

    await fetch(API + "/faculty/reject/" + id, {
        method: "PUT"
    });

    alert("Faculty Rejected Successfully");

    loadFaculty();

}

// ===============================
// Auto Refresh Dashboard
// ===============================

setInterval(() => {

    loadAdmin();
    loadFaculty();

}, 10000);

// ===============================
// Initial Load
// ===============================

loadAdmin();
loadFaculty();