from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, SessionLocal
from . import models, schemas, crud

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HITAM Smart AI Doubt Resolution Portal",
    version="2.0"
)

# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "https://hitam-smart-ai-doubt-portal.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# CORS TEST
# =====================================================

@app.get("/cors-test")
def cors_test():
    return {
        "origins": [
            "http://127.0.0.1:5500",
            "http://localhost:5500",
            "https://hitam-smart-ai-doubt-portal.vercel.app"
        ]
    }


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =====================================================
# HOME
# =====================================================

@app.get("/")
def home():
    return {"message": "Welcome to HITAM Smart AI Portal 🚀"}


# =====================================================
# STUDENT
# =====================================================

@app.post("/students/register", response_model=schemas.StudentResponse)
def register_student(
    student: schemas.StudentCreate,
    db: Session = Depends(get_db)
):
    return crud.create_student(db, student)


@app.post("/students/login-id")
def login_student_by_id(
    student: schemas.StudentIdLogin,
    db: Session = Depends(get_db)
):
    """
    Simplified student sign-in: Roll Number only, no password.
    Students are identified, not authenticated - see design doc.
    """

    user = crud.login_student_by_id(db, student.roll_no)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Roll Number not found. Please check and try again."
        )

    return {
        "message": "Login Successful",
        "student": {
            "roll_no": user.roll_no,
            "name": user.name,
            "department": user.department,
            "year": user.year,
            "section": user.section
        }
    }


@app.post("/students/login")
def login_student(
    student: schemas.StudentLogin,
    db: Session = Depends(get_db)
):

    user = crud.login_student(
        db,
        student.roll_no,
        student.password
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid Roll Number or Password"
        )

    return {
        "message": "Login Successful",
        "student": {
            "roll_no": user.roll_no,
            "name": user.name,
            "department": user.department,
            "year": user.year,
            "section": user.section
        }
    }


@app.get("/students", response_model=list[schemas.StudentResponse])
def get_students(
    db: Session = Depends(get_db)
):
    return db.query(models.Student).all()


# =====================================================
# DOUBTS
# =====================================================

@app.post("/doubts", response_model=schemas.DoubtResponse)
def create_doubt(
    doubt: schemas.DoubtCreate,
    db: Session = Depends(get_db)
):
    return crud.create_doubt(db, doubt)


@app.get("/doubts", response_model=list[schemas.DoubtResponse])
def get_doubts(
    db: Session = Depends(get_db)
):
    return crud.get_doubts(db)


@app.put("/doubts/{doubt_id}")
def answer_doubt(
    doubt_id: int,
    answer: schemas.FacultyAnswer,
    db: Session = Depends(get_db)
):
    return crud.answer_doubt(
        db,
        doubt_id,
        answer.faculty_answer,
        answer.faculty_id
    )


@app.delete("/doubts/{doubt_id}")
def delete_doubt(
    doubt_id: int,
    db: Session = Depends(get_db)
):
    return crud.delete_doubt(db, doubt_id)


# =====================================================
# ADMIN DASHBOARD
# =====================================================

@app.get("/admin/stats")
def admin_stats(
    db: Session = Depends(get_db)
):

    students = db.query(models.Student).count()

    doubts = db.query(models.Doubt).all()

    faculty = db.query(models.Faculty).count()

    admins = db.query(models.Admin).count()

    total = len(doubts)

    pending = sum(
        1 for d in doubts
        if d.status == "Pending"
    )

    verified = sum(
        1 for d in doubts
        if d.status == "Verified"
    )

    pending_faculty = db.query(models.Faculty).filter(
        models.Faculty.status == "Pending"
    ).count()

    return {
        "students": students,
        "faculty": faculty,
        "admins": admins,
        "pending_faculty": pending_faculty,
        "total_doubts": total,
        "pending": pending,
        "verified": verified
    }


# =====================================================
# FACULTY
# =====================================================

@app.post("/faculty/register", response_model=schemas.FacultyResponse)
def register_faculty(
    faculty: schemas.FacultyCreate,
    db: Session = Depends(get_db)
):
    return crud.create_faculty(db, faculty)


@app.post("/faculty/login")
def login_faculty(
    faculty: schemas.FacultyLogin,
    db: Session = Depends(get_db)
):

    user = crud.login_faculty(
        db,
        faculty.faculty_id,
        faculty.password
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid Faculty ID or Password"
        )

    return {
        "message": "Faculty Login Successful",
        "faculty": {
            "faculty_id": user.faculty_id,
            "name": user.name,
            "department": user.department,
            "email": user.email
        }
    }


@app.get("/faculty")
def faculty_list(
    db: Session = Depends(get_db)
):
    return crud.get_all_faculty(db)


@app.put("/faculty/approve/{faculty_id}")
def approve_faculty(
    faculty_id: str,
    db: Session = Depends(get_db)
):
    return crud.approve_faculty(db, faculty_id)


@app.put("/faculty/reject/{faculty_id}")
def reject_faculty(
    faculty_id: str,
    db: Session = Depends(get_db)
):
    return crud.reject_faculty(db, faculty_id)


# =====================================================
# ADMIN
# =====================================================

@app.post("/admin/register", response_model=schemas.AdminResponse)
def register_admin(
    admin: schemas.AdminCreate,
    db: Session = Depends(get_db)
):
    print("========== ADMIN DATA ==========")
    print(admin)
    print(admin.model_dump())
    print("================================")

    return crud.create_admin(db, admin)


@app.post("/admin/login")
def login_admin(
    admin: schemas.AdminLogin,
    db: Session = Depends(get_db)
):

    user = crud.login_admin(
        db,
        admin.username,
        admin.password
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid Username or Password"
        )

    return {
        "message": "Admin Login Successful",
        "admin": {
            "username": user.username,
            "name": user.name,
            "email": user.email,
            "status": user.status
        }
    }
# =====================================================
# PENDING FACULTY REQUESTS
# =====================================================

@app.get("/faculty/pending")
def get_pending_faculty(
    db: Session = Depends(get_db)
):
    return db.query(models.Faculty).filter(
        models.Faculty.status == "Pending"
    ).all()# =====================================================
# APPROVED FACULTY
# =====================================================

@app.get("/faculty/approved")
def get_approved_faculty(
    db: Session = Depends(get_db)
):
    return db.query(models.Faculty).filter(
        models.Faculty.status == "Approved"
    ).all()


# =====================================================
# REJECTED FACULTY
# =====================================================

@app.get("/faculty/rejected")
def get_rejected_faculty(
    db: Session = Depends(get_db)
):
    return db.query(models.Faculty).filter(
        models.Faculty.status == "Rejected"
    ).all()
# =====================================================
# ADMIN - STUDENT DETAILS
# =====================================================

@app.get("/admin/students")
def admin_students(
    db: Session = Depends(get_db)
):
    return db.query(models.Student).all()


# =====================================================
# ADMIN - FACULTY DETAILS
# =====================================================

@app.get("/admin/faculty")
def admin_faculty(
    db: Session = Depends(get_db)
):
    return db.query(models.Faculty).all()


# =====================================================
# ADMIN - ADMIN DETAILS
# =====================================================

@app.get("/admin/admins")
def admin_admins(
    db: Session = Depends(get_db)
):
    return db.query(models.Admin).all()