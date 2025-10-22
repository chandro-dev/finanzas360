from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import models
from app.db.database import get_db
from app.deps import get_current_user
from app.schemas import BudgetCreate, BudgetRead, BudgetUpdate


router = APIRouter()


@router.post("/", response_model=BudgetRead, status_code=status.HTTP_201_CREATED)
def create_budget(
    payload: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if payload.wallet_id:
        wallet = (
            db.query(models.Wallet)
            .filter(models.Wallet.id == payload.wallet_id, models.Wallet.user_id == current_user.id)
            .first()
        )
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet no pertenece al usuario")
    if payload.category_id:
        category = (
            db.query(models.Category)
            .filter(models.Category.id == payload.category_id, models.Category.user_id == current_user.id)
            .first()
        )
        if not category:
            raise HTTPException(status_code=404, detail="Categoría no pertenece al usuario")
    budget = models.Budget(
        name=payload.name,
        amount=payload.amount,
        start_date=payload.start_date,
        end_date=payload.end_date,
        user_id=current_user.id,
        wallet_id=payload.wallet_id,
        category_id=payload.category_id,
    )
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


@router.get("/", response_model=List[BudgetRead])
def list_budgets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.query(models.Budget).filter(models.Budget.user_id == current_user.id).all()


@router.get("/{budget_id}", response_model=BudgetRead)
def get_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    budget = (
        db.query(models.Budget)
        .filter(models.Budget.user_id == current_user.id, models.Budget.id == budget_id)
        .first()
    )
    if not budget:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
    return budget


@router.put("/{budget_id}", response_model=BudgetRead)
def update_budget(
    budget_id: int,
    payload: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    budget = (
        db.query(models.Budget)
        .filter(models.Budget.user_id == current_user.id, models.Budget.id == budget_id)
        .first()
    )
    if not budget:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")

    update_data = payload.model_dump(exclude_unset=True)
    wallet_id = update_data.get("wallet_id")
    category_id = update_data.get("category_id")
    if wallet_id is not None:
        if wallet_id:
            wallet = (
                db.query(models.Wallet)
                .filter(models.Wallet.id == wallet_id, models.Wallet.user_id == current_user.id)
                .first()
            )
            if not wallet:
                raise HTTPException(status_code=404, detail="Wallet no pertenece al usuario")
        else:
            update_data["wallet_id"] = None
    if category_id is not None:
        if category_id:
            category = (
                db.query(models.Category)
                .filter(models.Category.id == category_id, models.Category.user_id == current_user.id)
                .first()
            )
            if not category:
                raise HTTPException(status_code=404, detail="Categoría no pertenece al usuario")
        else:
            update_data["category_id"] = None

    for field, value in update_data.items():
        setattr(budget, field, value)

    db.commit()
    db.refresh(budget)
    return budget


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    budget = (
        db.query(models.Budget)
        .filter(models.Budget.user_id == current_user.id, models.Budget.id == budget_id)
        .first()
    )
    if not budget:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
    db.delete(budget)
    db.commit()
