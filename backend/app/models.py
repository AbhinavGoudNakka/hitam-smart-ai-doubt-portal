from sqlalchemy import Column, Integer, String
from .database import Base


# =========================
# STUDENT TABLE
# =========================

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)

    roll_no = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    year = Column(String, nullable=False)
    section = Column(String, nullable=False)

    # Store hashed password
    password = Column(String, nullable=False)


# =========================
# FACULTY TABLE
# =========================

class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(Integer, primary_key=True, index=True)

    faculty_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)

    # Store hashed password
    password = Column(String, nullable=False)

    # Pending / Approved / Rejected
    status = Column(String, default="Pending")


# =========================
# ADMIN TABLE
# =========================

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

    status = Column(String, default="Active")
    created_by = Column(String, default="System")

# =========================
# DOUBTS TABLE
# =========================

class Doubt(Base):
    __tablename__ = "doubts"

    id = Column(Integer, primary_key=True, index=True)

    roll_no = Column(String, nullable=False)
    student_name = Column(String, nullable=False)

    category = Column(String, nullable=False)
    question = Column(String, nullable=False)

    # AI generated answer
    answer = Column(String, default="")

    # Faculty verified answer
    faculty_answer = Column(
        String,
        default="Waiting for Faculty..."
    )

    faculty_id = Column(
        String,
        default=""
    )

    # Time of verification
    verified_at = Column(
        String,
        nullable=True
    )

    # Pending / Verified
    status = Column(
        String,
        default="Pending"
    )