from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    MONGODB_URL: str = ""
    JWT_SECRET: str = "4f77c3e1e2d4cfbe842e472093e0b23023e32b4b455b854e4881cf7ee5795b54"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
