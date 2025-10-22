from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import models
from app.db.database import get_db
from app.deps import get_current_user
from app.schemas import APIKeyCreate, APIKeyRead, APIKeyWithSecret
from app.security import create_api_key


router = APIRouter()


@router.post("/", response_model=APIKeyWithSecret, status_code=status.HTTP_201_CREATED)
def create_api_key_route(
    payload: APIKeyCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    raw_key, key_hash = create_api_key()
    api_key = models.APIKey(name=payload.name, key_hash=key_hash, user_id=current_user.id)
    db.add(api_key)
    db.commit()
    db.refresh(api_key)
    return APIKeyWithSecret(id=api_key.id, name=api_key.name, created_at=api_key.created_at.isoformat(), key=raw_key)


@router.get("/", response_model=List[APIKeyRead])
def list_api_keys(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    keys = db.query(models.APIKey).filter(models.APIKey.user_id == current_user.id).all()
    return [APIKeyRead(id=k.id, name=k.name, created_at=k.created_at.isoformat()) for k in keys]


@router.delete("/{api_key_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_api_key(
    api_key_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    key = (
        db.query(models.APIKey)
        .filter(models.APIKey.user_id == current_user.id, models.APIKey.id == api_key_id)
        .first()
    )
    if not key:
        raise HTTPException(status_code=404, detail="API key no encontrada")
    db.delete(key)
    db.commit()
