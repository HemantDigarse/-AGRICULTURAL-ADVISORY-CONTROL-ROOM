"""Authentication request and response schemas."""

from pydantic import BaseModel, EmailStr, Field


class RegisterInput(BaseModel):
    """Details required to create an account."""

    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class LoginInput(BaseModel):
    """Credentials required to sign in."""

    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)


class UserResponse(BaseModel):
    """Safe user details exposed to the client."""

    id: str
    name: str
    email: EmailStr


class AuthResponse(BaseModel):
    """Successful authentication response."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse
