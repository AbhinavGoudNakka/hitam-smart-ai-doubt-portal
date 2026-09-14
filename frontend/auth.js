// ==============================
// LOGIN SESSION
// ==============================

function saveStudent(user){

    localStorage.setItem(
        "student",
        JSON.stringify(user)
    );

}

function saveFaculty(user){

    localStorage.setItem(
        "faculty",
        JSON.stringify(user)
    );

}

function saveAdmin(user){

    localStorage.setItem(
        "admin",
        JSON.stringify(user)
    );

}


// ==============================
// GET CURRENT USER
// ==============================

function getStudent(){

    return JSON.parse(
        localStorage.getItem("student")
    );

}

function getFaculty(){

    return JSON.parse(
        localStorage.getItem("faculty")
    );

}

function getAdmin(){

    return JSON.parse(
        localStorage.getItem("admin")
    );

}


// ==============================
// PAGE PROTECTION
// ==============================

function protectStudent(){

    if(!getStudent()){

        alert("Please login first.");

        window.location.href="login.html";

    }

}

function protectFaculty(){

    if(!getFaculty()){

        alert("Please login first.");

        window.location.href="login.html";
    }

}

function protectAdmin(){

    if(!getAdmin()){

        alert("Please login first.");

        window.location.href="login.html";

    }

}


// ==============================
// LOGOUT
// ==============================

function logout(){

    localStorage.removeItem("student");

    localStorage.removeItem("faculty");

    localStorage.removeItem("admin");

    alert("Logged Out Successfully");

   window.location.href="login.html";

}