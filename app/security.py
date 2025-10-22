import os
import hashlib
import secrets
from hmac import compare_digest
from datetime import datetime, timedelta, timezone
from typing import Optional, Union

try:
    import jwt  # PyJWT
except Exception:  # pragma: no cover
    jwt = None  # type: ignore

ALG = "pbkdf2_sha256"
ITERATIONS = 310000
SALT_BYTES = 16


def hash_password(password: str) -> str:
    if not isinstance(password, str) or password == "":
        raise ValueError("password required")
    salt = os.urandom(SALT_BYTES)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, ITERATIONS)
    return f"{ALG}${ITERATIONS}${salt.hex()}${dk.hex()}"


def verify_password(password: str, hashed: str) -> bool:
    try:
        alg, rounds, salt_hex, hash_hex = hashed.split("$")
        if alg != ALG:
            return False
        rounds_int = int(rounds)
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(hash_hex)
        dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, rounds_int)
        return compare_digest(dk, expected)
    except Exception:
        return False


# JWT settings
JWT_SECRET = os.getenv("JWT_SECRET", "CHANGE_ME_DEV_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))


def create_access_token(subject: Union[str, int], expires_minutes: Optional[int] = None) -> str:
    if jwt is None:
        raise RuntimeError("PyJWT no está instalado. Ejecuta: pip install PyJWT")
    exp_minutes = expires_minutes or JWT_EXPIRE_MINUTES
    now = datetime.now(tz=timezone.utc)
    payload = {
        "sub": str(subject),
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=exp_minutes)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    if jwt is None:
        raise RuntimeError("PyJWT no está instalado. Ejecuta: pip install PyJWT")
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])


# API Keys
API_KEY_PREFIX = os.getenv("API_KEY_PREFIX", "sk_")


def _hash_api_key(raw_key: str) -> str:
    return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()


def create_api_key() -> tuple[str, str]:
    raw = API_KEY_PREFIX + secrets.token_urlsafe(32)
    hashed = _hash_api_key(raw)
    return raw, hashed


def hash_api_key(raw_key: str) -> str:
    return _hash_api_key(raw_key)


def verify_api_key(raw_key: str, key_hash: str) -> bool:
    return compare_digest(_hash_api_key(raw_key), key_hash)
