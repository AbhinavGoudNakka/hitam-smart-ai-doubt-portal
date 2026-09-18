from typing import Optional
from pydantic import BaseModel


# =========================
# STUDENT
# =========================

class StudentCreate(BaseModel):
    roll_no: str
    name: str
    department: str
    year: str
    section: str

    # Optional. The portal supports password-less student sign-in
    # (Roll No only). Kept optional so older clients that still send
    # a password continue to work.
    password: Optional[str] = None


class StudentLogin(BaseModel):
    roll_no: str
    password: str


# Simplified student sign-in: Roll Number only, no password.
class StudentIdLogin(BaseModel):
    roll_no: str


class StudentResponse(BaseModel):
    id: int
    roll_no: str
    name: str
    department: str
    year: str
    section: str

    class Config:
        from_attributes = True


# =========================
# FACULTY
# =========================

class FacultyCreate(BaseModel):
    faculty_id: str
    name: str
    department: str
    email: str
    password: str


class FacultyLogin(BaseModel):
    faculty_id: str
    password: str


class FacultyResponse(BaseModel):
    id: int
    faculty_id: str
    name: str
    department: str
    email: str
    status: str

    class Config:
        from_attributes = True


# =========================
# ADMIN
# =========================

class AdminCreate(BaseModel):
    username: str
    name: str
    email: str
    password: str


class AdminLogin(BaseModel):
    username: str
    password: str


class AdminResponse(BaseModel):
    id: int
    username: str
    name: str
    email: str
    status: str
    created_by: str

    class Config:
        from_attributes = True


# =========================
# DOUBTS
# =========================

class DoubtCreate(BaseModel):
    roll_no: str
    student_name: str
    category: str
    question: str


class DoubtResponse(BaseModel):
    id: int
    roll_no: str
    student_name: str
    category: str
    question: str

    answer: Optional[str] = None
    faculty_answer: Optional[str] = None
    faculty_id: Optional[str] = None
    verified_at: Optional[str] = None
    status: str

    class Config:
        from_attributes = True


# =========================
# FACULTY VERIFY ANSWER
# =========================

class FacultyAnswer(BaseModel):
    faculty_answer: str
    faculty_id: str


# =========================
# ADMIN APPROVAL
# =========================

class StatusUpdate(BaseModel):
    status: str


# =========================
# UPDATE AI ANSWER
# =========================

class AnswerUpdate(BaseModel):
    answer: str