"""Registration and login API routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.database.connection import async_session_factory
from app.database.models import User
from app.schemas.auth import AuthResponse, LoginInput, RegisterInput, UserResponse
from app.security import create_access_token, hash_password, require_current_user, verify_password

router = APIRouter(prefix="/api/auth", tags=["authentication"])


def _user_response(user: User) -> UserResponse:
    return UserResponse(id=user.id, name=user.name, email=user.email)


def _auth_response(user: User) -> AuthResponse:
    return AuthResponse(access_token=create_access_token(user), user=_user_response(user))


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register_account(details: RegisterInput):
    """Create a new account and sign the user in."""
    email = details.email.lower()
    user = User(name=details.name.strip(), email=email, password_hash=hash_password(details.password))

    try:
        async with async_session_factory() as session:
            session.add(user)
            await session.commit()
            await session.refresh(user)
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account already exists for this email address.",
        ) from None

    return _auth_response(user)


@router.post("/login", response_model=AuthResponse)
async def login_account(credentials: LoginInput):
    """Authenticate an existing account."""
    async with async_session_factory() as session:
        result = await session.execute(
            select(User).where(User.email == credentials.email.lower())
        )
        user = result.scalar_one_or_none()

    if user is None or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )
    return _auth_response(user)


@router.get("/me", response_model=UserResponse)
async def get_current_user(user: User = Depends(require_current_user)):
    """Return the signed-in account."""
    return _user_response(user)
