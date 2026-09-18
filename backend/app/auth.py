import bcrypt


def hash_password(password: str) -> str:
    """
    Hash a plain-text password using bcrypt.
    Returns a string safe to store in the database.
    """
    hashed = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    )
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain-text password against a stored password.

    Supports both:
    - New bcrypt hashes (start with $2b$ / $2a$ / $2y$)
    - Old plaintext passwords already stored before this fix,
      so existing accounts created earlier don't get locked out.
    """
    if hashed_password.startswith(("$2b$", "$2a$", "$2y$")):
        try:
            return bcrypt.checkpw(
                plain_password.encode("utf-8"),
                hashed_password.encode("utf-8")
            )
        except ValueError:
            return False

    # Legacy plaintext password (pre-hashing) — compare directly.
    return plain_password == hashed_password
