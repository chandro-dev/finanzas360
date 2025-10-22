from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db import models
from app.db.database import get_db
from app.schemas import WalletCreate, WalletRead
from app.deps import get_current_user


router = APIRouter()


@router.post("/", response_model=WalletRead, status_code=status.HTTP_201_CREATED)
def create_wallet(
    payload: WalletCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    wallet = models.Wallet(
        name=payload.name,
        currency=payload.currency,
        balance=payload.balance,
        user_id=current_user.id,
    )
    db.add(wallet)
    db.commit()
    db.refresh(wallet)
    return wallet


@router.get("/", response_model=List[WalletRead])
def list_wallets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.query(models.Wallet).filter(models.Wallet.user_id == current_user.id).all()


@router.get("/{wallet_id}", response_model=WalletRead)
def get_wallet(
    wallet_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    wallet = db.query(models.Wallet).filter(
        models.Wallet.id == wallet_id, models.Wallet.user_id == current_user.id
    ).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Billetera no encontrada")
    return wallet
