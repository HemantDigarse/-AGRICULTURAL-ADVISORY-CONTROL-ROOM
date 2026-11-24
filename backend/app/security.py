"""Password hashing and signed access-token helpers."""

import base64
import hashlib
import hmac
import json
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import Header, HTTPException, Query, status
from sqlalchemy import select

from app.config.settings import settings
from app.database.connection import async_session_factory
from app.database.models import User

PASSWORD_ITERATIONS = 600_000


def hash_password(password: str) -> str:
    """Hash a password using PBKDF2-HMAC with a random salt."""
    salt = secrets.token_bytes(16)
    derived_key = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, PASSWORD_ITERATIONS
    )
    return "$".join(
        [
            "pbkdf2_sha256",
            str(PASSWORD_ITERATIONS),
            base64.urlsafe_b64encode(salt).decode(),
            base64.urlsafe_b64encode(derived_key).decode(),
        ]
    )


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against a stored PBKDF2-HMAC hash."""
    try:
        algorithm, iteration_text, salt_text, key_text = password_hash.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        derived_key = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            base64.urlsafe_b64decode(salt_text),
            int(iteration_text),
        )
        return hmac.compare_digest(derived_key, base64.urlsafe_b64decode(key_text))
    except (TypeError, ValueError):
        return False


def _encode_part(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode("ascii")


def _decode_part(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def create_access_token(user: User) -> str:
    """Create a signed, short-lived access token for a user."""
    expires_at = datetime.now(timezone.utc) + timedelta(
        hours=settings.AUTH_TOKEN_EXPIRE_HOURS
    )
    payload = {"sub": user.id, "exp": int(expires_at.timestamp())}
    payload_part = _encode_part(
        json.dumps(payload, separators=(",", ":")).encode("utf-8")
    )
    signature = hmac.new(
        settings.AUTH_SECRET_KEY.encode("utf-8"),
        payload_part.encode("ascii"),
        hashlib.sha256,
    ).digest()
    return "{}.{}".format(payload_part, _encode_part(signature))


def _get_token_payload(token: str) -> dict[str, Any]:
    """Validate a token and return its payload."""
    try:
        payload_part, signature_part = token.split(".", 1)
        expected_signature = hmac.new(
            settings.AUTH_SECRET_KEY.encode("utf-8"),
            payload_part.encode("ascii"),
            hashlib.sha256,
        ).digest()
        if not hmac.compare_digest(expected_signature, _decode_part(signature_part)):
            raise ValueError("Invalid signature")
        payload = json.loads(_decode_part(payload_part))
        if not isinstance(payload.get("sub"), str) or payload.get("exp", 0) < datetime.now(timezone.utc).timestamp():
            raise ValueError("Expired or invalid token")
        return payload
    except (ValueError, json.JSONDecodeError, UnicodeDecodeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session is invalid or has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None


async def require_current_user(
    authorization: str | None = Header(default=None),
    access_token: str | None = Query(default=None),
) -> User:
    """Return the authenticated user or reject unauthenticated requests."""
    token = access_token
    if authorization:
        scheme, _, credentials = authorization.partition(" ")
        if scheme.lower() == "bearer" and credentials:
            token = credentials
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication is required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = _get_token_payload(token)
    async with async_session_factory() as session:
        result = await session.execute(select(User).where(User.id == payload["sub"]))
        user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
