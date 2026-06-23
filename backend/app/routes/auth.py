from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from typing import Dict, Any
from pydantic import BaseModel, EmailStr
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user
from app.db import get_collection

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class ForgotPassword(BaseModel):
    email: EmailStr

@router.post("/register")
async def register(user_in: UserRegister):
    users_col = get_collection("users")
    
    # Check if user already exists
    existing_user = await users_col.find_one({"username": user_in.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username is already registered")
        
    existing_email = await users_col.find_one({"email": user_in.email})
    if existing_email:
        raise HTTPException(status_code=400, detail="Email is already registered")
        
    # Check if this is the first user (for admin assignment)
    total_users = await users_col.count_documents({})
    role = "user"
    if total_users == 0 or "admin" in user_in.username.lower():
        role = "user"
        
    hashed_password = get_password_hash(user_in.password)
    new_user = {
        "username": user_in.username,
        "email": user_in.email,
        "full_name": user_in.full_name,
        "password_hash": hashed_password,
        "role": role,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "settings": {
            "darkMode": True,
            "notificationsEnabled": True
        }
    }
    
    await users_col.insert_one(new_user)
    return {"message": "Registration successful. You can now login.", "username": user_in.username, "role": role}

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    users_col = get_collection("users")
    user = await users_col.find_one({"username": form_data.username})
    
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Generate JWT
    access_token = create_access_token(data={"sub": user["username"]})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "username": user["username"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
            "created_at": user.get("created_at"),
            "settings": user.get("settings", {"darkMode": True, "notificationsEnabled": True})
        }
    }

@router.get("/profile")
async def get_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    # Omit password hash
    return {
        "username": current_user["username"],
        "email": current_user["email"],
        "full_name": current_user["full_name"],
        "role": current_user["role"],
        "created_at": current_user.get("created_at"),
        "settings": current_user.get("settings", {"darkMode": True, "notificationsEnabled": True})
    }

@router.post("/change-password")
async def change_password(pass_in: PasswordChange, current_user: Dict[str, Any] = Depends(get_current_user)):
    users_col = get_collection("users")
    
    if not verify_password(pass_in.old_password, current_user["password_hash"]):
        raise HTTPException(status_code=400, detail="Invalid current password")
        
    new_hashed = get_password_hash(pass_in.new_password)
    await users_col.update_one(
        {"username": current_user["username"]},
        {"$set": {"password_hash": new_hashed}}
    )
    return {"message": "Password changed successfully."}

@router.post("/forgot-password")
async def forgot_password(forgot_in: ForgotPassword):
    # Simulated password recovery for demo workspace
    users_col = get_collection("users")
    user = await users_col.find_one({"email": forgot_in.email})
    if not user:
        # Avoid user enumeration, return friendly response anyway
        pass
    return {"message": f"A password reset link has been dispatched to {forgot_in.email}."}
