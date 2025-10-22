from collections import defaultdict
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import models
from app.db.database import get_db
from app.deps import get_current_user
from app.schemas import SummaryResponse, BalanceSummary, WalletBalanceSummary, WalletReadLite, BudgetRead


router = APIRouter()


@router.get("/", response_model=SummaryResponse)
def get_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    wallets: List[models.Wallet] = (
        db.query(models.Wallet).filter(models.Wallet.user_id == current_user.id).all()
    )
    budgets: List[models.Budget] = (
        db.query(models.Budget).filter(models.Budget.user_id == current_user.id).all()
    )

    currency_totals: dict[str, float] = defaultdict(float)
    wallet_summaries: List[WalletBalanceSummary] = []
    for wallet in wallets:
        balance_float = float(wallet.balance or 0)
        currency_totals[wallet.currency or "UNKNOWN"] += balance_float
        wallet_summaries.append(
            WalletBalanceSummary(
                wallet=WalletReadLite.model_validate(wallet),
                balance=balance_float,
            )
        )

    total_balance = sum(currency_totals.values())
    budgets_read = [BudgetRead.model_validate(b) for b in budgets]

    return SummaryResponse(
        total=BalanceSummary(total_balance=total_balance, currency_totals=dict(currency_totals)),
        wallets=wallet_summaries,
        budgets=budgets_read,
    )
