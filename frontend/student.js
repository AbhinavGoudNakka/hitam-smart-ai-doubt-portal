const API = "http://127.0.0.1:8000";

// ============================
// LOAD STUDENT DETAILS
// ============================

const student = JSON.parse(localStorage.getItem("student"));

if (!student) {
    window.location.href = "login.html";
}

document.getElementById("welcomeName").innerHTML =
    "👋 Welcome, " + student.name;

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

    const category = document.getElementById("category").value;

    const question = document.getElementById("question").value;

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

        let html="";

        const myDoubts=doubts.filter(
            d=>d.roll_no===student.roll_no
        );

        if(myDoubts.length===0){

            html="<h3>No doubts submitted.</h3>";

        }else{

            myDoubts.reverse().forEach(d=>{

                html+=`

                <div class="dashboard-card">

                <h3>${d.category}</h3>

                <p><b>Question:</b><br>${d.question}</p>

                <p><b>AI Answer:</b><br>${d.answer||"Waiting..."}</p>

                <p><b>Faculty Answer:</b><br>${d.faculty_answer||"Waiting..."}</p>

                <p><b>Status:</b> ${d.status}</p>

                </div>

                <br>

                `;

            });

        }

        document.getElementById("doubtList").innerHTML=html;

    }catch(error){

        console.log(error);

    }

}

loadDoubts();