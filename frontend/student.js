const API = "https://hitam-ai-backend-m3ka.onrender.com";

// ============================
// LOAD STUDENT DETAILS
// ============================

const student = getStudent();

if (!student) {
    window.location.href = "login.html";
}

document.getElementById("welcomeName").innerHTML =
    '<i class="fa-solid fa-circle-user"></i> Welcome, ' + student.name;

document.getElementById("welcomeRoll").innerHTML =
    student.roll_no;

document.getElementById("welcomeDept").innerHTML =
    student.department;

document.getElementById("welcomeYear").innerHTML =
    student.year;

document.getElementById("welcomeSection").innerHTML =
    student.section;


// ============================
// SUBMIT DOUBT
// ============================

async function submitDoubt() {

    const category = document.getElementById("category").value.trim();

    const question = document.getElementById("question").value.trim();

    if(category==="" || question===""){

        alert("Please fill all fields");

        return;

    }

    const doubt={

        roll_no:student.roll_no,

        student_name:student.name,

        category:category,

        question:question

    };

    try{

        const response=await fetch(API+"/doubts",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(doubt)

        });

        const data=await response.json();

        if(response.ok){

            alert("✅ Doubt Submitted Successfully");

            document.getElementById("category").value="";

            document.getElementById("question").value="";

            loadDoubts();

        }else{

            alert(data.detail);

        }

    }catch(error){

        console.log(error);

        alert("Cannot connect to backend");

    }

}


// ============================
// LOAD MY DOUBTS
// ============================

async function loadDoubts(){

    try{

        const response=await fetch(API+"/doubts");

        const doubts=await response.json();

        const myDoubts=doubts.filter(
            d=>d.roll_no===student.roll_no
        );

        // ---------- Stats ----------

        const total = myDoubts.length;

        const pending = myDoubts.filter(
            d => d.status !== "Verified"
        ).length;

        const verified = myDoubts.filter(
            d => d.status === "Verified"
        ).length;

        document.getElementById("totalDoubts").innerHTML = total;
        document.getElementById("pendingDoubts").innerHTML = pending;
        document.getElementById("verifiedDoubts").innerHTML = verified;

        // ---------- Cards ----------

        let html="";

        if(myDoubts.length===0){

            html="<h3 style='text-align:center;color:gray;'>No doubts submitted yet.</h3>";

        }else{

            myDoubts.reverse().forEach(d=>{

                const statusClass =
                    d.status === "Verified"
                        ? "status-verified"
                        : "status-pending";

                html+=`
<div class="student-doubt-card">

<h3><i class="fa-solid fa-book"></i> ${d.category}</h3>

<p><b>Question:</b><br>${d.question}</p>

<p><b>🤖 AI Answer:</b><br>${d.answer||"Waiting..."}</p>

<p><b>👨‍🏫 Faculty Answer:</b><br>${d.faculty_answer||"Waiting for Faculty..."}</p>

<p><b>Status:</b> <span class="${statusClass}">${d.status}</span></p>

</div>
`;

            });

        }

        document.getElementById("doubtList").innerHTML=html;

    }catch(error){

        console.log(error);

    }

}


// ============================
// SEARCH MY DOUBTS
// ============================

function searchDoubts(){

    const input =
        document.getElementById("search")
        .value.toLowerCase();

    const cards =
        document.querySelectorAll(".student-doubt-card");

    cards.forEach(card=>{

        card.style.display =
            card.innerText.toLowerCase().includes(input)
                ? ""
                : "none";

    });

}


// ============================
// AUTO REFRESH
// ============================

setInterval(loadDoubts, 10000);

loadDoubts();
