from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload

from app.db import models
from app.db.database import get_db
from app.schemas import TransactionCreate, TransactionRead, TransactionReadDetail
from app.deps import get_current_user


router = APIRouter()


@router.post("/", response_model=TransactionRead, status_code=status.HTTP_201_CREATED)
def create_transaction(
    payload: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Validaciones básicas
    wallet = db.query(models.Wallet).filter(
        models.Wallet.id == payload.wallet_id, models.Wallet.user_id == current_user.id
    ).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Billetera no existe")
    category = db.query(models.Category).filter(
        models.Category.id == payload.category_id, models.Category.user_id == current_user.id
    ).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no existe")

    txn = models.Transaction(
        amount=payload.amount,
        description=payload.description,
        date=payload.date,
        wallet_id=payload.wallet_id,
        category_id=payload.category_id,
        user_id=current_user.id,
    )
    db.add(txn)

    # Actualización sencilla del balance de la wallet
    # Nota: en un escenario real, conviene manejar transacciones y tipos (ingreso/gasto)
    if category.type == "expense":
        wallet.balance = (wallet.balance or 0) - payload.amount
    else:
        wallet.balance = (wallet.balance or 0) + payload.amount

    db.commit()
    db.refresh(txn)
    return txn


@router.get("/", response_model=List[TransactionRead])
def list_transactions(
    wallet_id: Optional[int] = Query(None),
    category_id: Optional[int] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    order_by: str = Query("date", pattern="^(date|id|amount)$"),
    order_dir: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    q = db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id)
    if wallet_id is not None:
        q = q.filter(models.Transaction.wallet_id == wallet_id)
    if category_id is not None:
        q = q.filter(models.Transaction.category_id == category_id)
    if date_from is not None:
        q = q.filter(models.Transaction.date >= date_from)
    if date_to is not None:
        q = q.filter(models.Transaction.date <= date_to)
    # Order
    order_column = {
        "date": models.Transaction.date,
        "id": models.Transaction.id,
        "amount": models.Transaction.amount,
    }[order_by]
    if order_dir == "desc":
        order_column = order_column.desc()
    q = q.order_by(order_column).offset(offset).limit(limit)
    return q.all()


@router.get("/detailed", response_model=List[TransactionReadDetail])
def list_transactions_detailed(
    wallet_id: Optional[int] = Query(None),
    category_id: Optional[int] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    order_by: str = Query("date", pattern="^(date|id|amount)$"),
    order_dir: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    q = (
        db.query(models.Transaction)
        .options(joinedload(models.Transaction.wallet), joinedload(models.Transaction.category))
        .filter(models.Transaction.user_id == current_user.id)
    )
    if wallet_id is not None:
        q = q.filter(models.Transaction.wallet_id == wallet_id)
    if category_id is not None:
        q = q.filter(models.Transaction.category_id == category_id)
    if date_from is not None:
        q = q.filter(models.Transaction.date >= date_from)
    if date_to is not None:
        q = q.filter(models.Transaction.date <= date_to)

    order_column = {
        "date": models.Transaction.date,
        "id": models.Transaction.id,
        "amount": models.Transaction.amount,
    }[order_by]
    if order_dir == "desc":
        order_column = order_column.desc()
    q = q.order_by(order_column).offset(offset).limit(limit)
    return q.all()


@router.get("/{transaction_id}", response_model=TransactionRead)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    txn = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == current_user.id,
    ).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")
    return txn
