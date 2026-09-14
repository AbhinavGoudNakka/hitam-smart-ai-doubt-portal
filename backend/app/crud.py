from .ai import generate_ai_answer
from sqlalchemy.orm import Session
from . import models, schemas
from .auth import hash_password, verify_password


# =====================================================
# STUDENT FUNCTIONS
# =====================================================

def create_student(db: Session, student: schemas.StudentCreate):

    existing = db.query(models.Student).filter(
        models.Student.roll_no == student.roll_no
    ).first()

    if existing:
        return existing

    new_student = models.Student(
        roll_no=student.roll_no,
        name=student.name,
        department=student.department,
        year=student.year,
        section=student.section,
        password=hash_password(student.password)
    )

    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    return new_student


def login_student(db: Session, roll_no: str, password: str):

    student = db.query(models.Student).filter(
        models.Student.roll_no == roll_no
    ).first()

    if not student:
        return None

    if verify_password(password, student.password):
        return student

    return None


# =====================================================
# FACULTY FUNCTIONS
# =====================================================

def create_faculty(db: Session, faculty: schemas.FacultyCreate):

    existing = db.query(models.Faculty).filter(
        models.Faculty.faculty_id == faculty.faculty_id
    ).first()

    if existing:
        return existing

    new_faculty = models.Faculty(
        faculty_id=faculty.faculty_id,
        name=faculty.name,
        department=faculty.department,
        email=faculty.email,
        password=hash_password(faculty.password),
        status="Pending"
    )

    db.add(new_faculty)
    db.commit()
    db.refresh(new_faculty)

    return new_faculty


def login_faculty(db: Session, faculty_id: str, password: str):

    faculty = db.query(models.Faculty).filter(
        models.Faculty.faculty_id == faculty_id
    ).first()

    if not faculty:
        return None

    if faculty.status != "Approved":
        return None

    if verify_password(password, faculty.password):
        return faculty

    return None


def approve_faculty(db: Session, faculty_id: str):

    faculty = db.query(models.Faculty).filter(
        models.Faculty.faculty_id == faculty_id
    ).first()

    if faculty:
        faculty.status = "Approved"
        db.commit()
        db.refresh(faculty)

    return faculty


def reject_faculty(db: Session, faculty_id: str):

    faculty = db.query(models.Faculty).filter(
        models.Faculty.faculty_id == faculty_id
    ).first()

    if faculty:
        faculty.status = "Rejected"
        db.commit()
        db.refresh(faculty)

    return faculty


def get_all_faculty(db: Session):

    return db.query(models.Faculty).all()


# =====================================================
# ADMIN FUNCTIONS
# =====================================================

def create_admin(db: Session, admin: schemas.AdminCreate):

    existing = db.query(models.Admin).filter(
        models.Admin.username == admin.username
    ).first()

    if existing:
        return existing

    new_admin = models.Admin(
        username=admin.username,
        name=admin.name,
        email=admin.email,
        password=hash_password(admin.password),
        status="Active",
        created_by="System"
    )

    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    return new_admin


def login_admin(db: Session, username: str, password: str):

    admin = db.query(models.Admin).filter(
        models.Admin.username == username
    ).first()

    if not admin:
        return None

    if verify_password(password, admin.password):
        return admin

    return None
# =====================================================
# DOUBT FUNCTIONS
# =====================================================

def create_doubt(db: Session, doubt: schemas.DoubtCreate):

    ai_answer = f"AI Response for: {doubt.question}"

    new_doubt = models.Doubt(
        roll_no=doubt.roll_no,
        student_name=doubt.student_name,
        category=doubt.category,
        question=doubt.question,
        answer=ai_answer,
        faculty_answer="Waiting for Faculty...",
        faculty_id="",
        status="Pending"
    )

    db.add(new_doubt)
    db.commit()
    db.refresh(new_doubt)

    return new_doubt


def get_doubts(db: Session):

    return db.query(models.Doubt).all()


def answer_doubt(db: Session, doubt_id: int, answer: str):

    doubt = db.query(models.Doubt).filter(
        models.Doubt.id == doubt_id
    ).first()

    if not doubt:
        return None

    doubt.faculty_answer = answer
    doubt.status = "Verified"

    db.commit()
    db.refresh(doubt)

    return doubt


def delete_doubt(db: Session, doubt_id: int):

    doubt = db.query(models.Doubt).filter(
        models.Doubt.id == doubt_id
    ).first()

    if not doubt:
        return {"message": "Doubt Not Found"}

    db.delete(doubt)
    db.commit()

    return {"message": "Deleted Successfully"}
# ==========================
# DOUBT FUNCTIONS
# ==========================

def create_doubt(db: Session, doubt: schemas.DoubtCreate):

    ai_answer = generate_ai_answer(doubt.question)

    new_doubt = models.Doubt(
        roll_no=doubt.roll_no,
        student_name=doubt.student_name,
        category=doubt.category,
        question=doubt.question,
        answer=ai_answer,
        faculty_answer="Waiting for Faculty...",
        faculty_id="",
        status="Pending"
    )

    db.add(new_doubt)
    db.commit()
    db.refresh(new_doubt)

    return new_doubt


def get_doubts(db: Session):

    return db.query(models.Doubt).all()


def answer_doubt(db: Session, doubt_id: int, answer: str):

    doubt = db.query(models.Doubt).filter(
        models.Doubt.id == doubt_id
    ).first()

    if not doubt:
        return None

    doubt.faculty_answer = answer
    doubt.status = "Verified"

    db.commit()
    db.refresh(doubt)

    return doubt


def delete_doubt(db: Session, doubt_id: int):

    doubt = db.query(models.Doubt).filter(
        models.Doubt.id == doubt_id
    ).first()

    if not doubt:
        return None

    db.delete(doubt)
    db.commit()

    return {"message": "Doubt deleted successfully"}