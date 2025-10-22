from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import models
from app.db.database import get_db
from app.deps import get_current_user
from app.schemas import BudgetCreate, BudgetRead, BudgetUpdate


router = APIRouter()


def _budget_to_read(budget: models.Budget) -> BudgetRead:
    limit_amount = sum(float(limit.limit_amount or 0) for limit in budget.limits)
    return BudgetRead(
        id=budget.id,
        name=budget.name,
        user_id=budget.user_id,
        period_start=budget.period_start,
        period_end=budget.period_end,
        wallet_id=budget.wallet_id,
        category_id=budget.category_id,
        limit_amount=limit_amount,
    )


def _ensure_wallet(db: Session, user_id: int, wallet_id: int | None):
    if wallet_id is None:
        return
    exists = (
        db.query(models.Wallet)
        .filter(models.Wallet.id == wallet_id, models.Wallet.user_id == user_id)
        .first()
    )
    if not exists:
        raise HTTPException(status_code=404, detail="Wallet no pertenece al usuario")


def _ensure_category(db: Session, user_id: int, category_id: int | None):
    if category_id is None:
        return
    exists = (
        db.query(models.Category)
        .filter(models.Category.id == category_id, models.Category.user_id == user_id)
        .first()
    )
    if not exists:
        raise HTTPException(status_code=404, detail="Categoria no pertenece al usuario")


@router.post("/", response_model=BudgetRead, status_code=status.HTTP_201_CREATED)
def create_budget(
    payload: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _ensure_wallet(db, current_user.id, payload.wallet_id)
    _ensure_category(db, current_user.id, payload.category_id)
    if payload.limit_amount and not payload.category_id:
        raise HTTPException(
            status_code=400,
            detail="Debe indicar una categoria para poder asignar un limite",
        )

    budget = models.Budget(
        name=payload.name,
        period_start=payload.period_start,
        period_end=payload.period_end,
        user_id=current_user.id,
        wallet_id=payload.wallet_id,
        category_id=payload.category_id,
    )
    db.add(budget)
    db.flush()

    if payload.category_id and payload.limit_amount:
        db.add(
            models.CategoryBudgetLimit(
                budget_id=budget.id,
                category_id=payload.category_id,
                limit_amount=payload.limit_amount,
            )
        )

    db.commit()
    db.refresh(budget)
    return _budget_to_read(budget)


@router.get("/", response_model=List[BudgetRead])
def list_budgets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    budgets = (
        db.query(models.Budget)
        .filter(models.Budget.user_id == current_user.id)
        .order_by(models.Budget.id)
        .all()
    )
    return [_budget_to_read(b) for b in budgets]


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
    return _budget_to_read(budget)


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

    data = payload.model_dump(exclude_unset=True)

    if "wallet_id" in data:
        _ensure_wallet(db, current_user.id, data["wallet_id"])
        budget.wallet_id = data["wallet_id"]
    if "category_id" in data:
        _ensure_category(db, current_user.id, data["category_id"])
        budget.category_id = data["category_id"]
    if "name" in data:
        budget.name = data["name"]
    if "period_start" in data:
        budget.period_start = data["period_start"]
    if "period_end" in data:
        budget.period_end = data["period_end"]

    limit_amount = data.get("limit_amount")
    limit_record = budget.limits[0] if budget.limits else None

    if limit_amount is not None:
        if limit_amount == 0:
            if limit_record:
                db.delete(limit_record)
        else:
            if not budget.category_id:
                raise HTTPException(
                    status_code=400,
                    detail="Debe asociar una categoria para poder asignar un limite",
                )
            if limit_record:
                limit_record.limit_amount = limit_amount
                limit_record.category_id = budget.category_id
            else:
                db.add(
                    models.CategoryBudgetLimit(
                        budget_id=budget.id,
                        category_id=budget.category_id,
                        limit_amount=limit_amount,
                    )
                )
    elif "category_id" in data and limit_record:
        if budget.category_id is None:
            db.delete(limit_record)
        else:
            limit_record.category_id = budget.category_id

    db.commit()
    db.refresh(budget)
    return _budget_to_read(budget)


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
