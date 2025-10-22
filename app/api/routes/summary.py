from collections import defaultdict
from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import func, case
from sqlalchemy.orm import Session, joinedload

from app.db import models
from app.db.database import get_db
from app.deps import get_current_user
from app.schemas import (
    SummaryResponse,
    BalanceSummary,
    WalletBalanceSummary,
    WalletReadLite,
    BudgetSummary,
    TransactionReadDetail,
)


router = APIRouter()


@router.get("/", response_model=SummaryResponse)
def get_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    wallets: List[models.Wallet] = (
        db.query(models.Wallet)
        .filter(models.Wallet.user_id == current_user.id)
        .order_by(models.Wallet.id)
        .all()
    )
    budgets: List[models.Budget] = (
        db.query(models.Budget)
        .options(joinedload(models.Budget.wallet), joinedload(models.Budget.category))
        .filter(models.Budget.user_id == current_user.id)
        .order_by(models.Budget.id)
        .all()
    )

    cutoff_date = datetime.utcnow().date() - timedelta(days=30)

    # Aggregations for incomes/expenses per wallet in last 30 days
    agg_rows = (
        db.query(
            models.Transaction.wallet_id,
            func.coalesce(
                func.sum(
                    case(
                        (models.Category.type == "income", models.Transaction.amount),
                        else_=0,
                    )
                ),
                0,
            ).label("income"),
            func.coalesce(
                func.sum(
                    case(
                        (models.Category.type == "expense", models.Transaction.amount),
                        else_=0,
                    )
                ),
                0,
            ).label("expense"),
        )
        .join(models.Category, models.Transaction.category)
        .filter(
            models.Transaction.user_id == current_user.id,
            models.Transaction.date.isnot(None),
            models.Transaction.date >= cutoff_date,
        )
        .group_by(models.Transaction.wallet_id)
        .all()
    )
    wallet_stats = {row.wallet_id: row for row in agg_rows}

    total_income_30 = sum(float(row.income) for row in agg_rows)
    total_expense_30 = sum(float(row.expense) for row in agg_rows)

    currency_totals: dict[str, float] = defaultdict(float)
    wallet_summaries: List[WalletBalanceSummary] = []
    for wallet in wallets:
        balance_float = float(wallet.balance or 0)
        currency_totals[wallet.currency or "UNKNOWN"] += balance_float
        stats = wallet_stats.get(wallet.id)
        income_30 = float(stats.income) if stats else 0.0
        expense_30 = float(stats.expense) if stats else 0.0
        wallet_summaries.append(
            WalletBalanceSummary(
                wallet=WalletReadLite.model_validate(wallet),
                balance=balance_float,
                income_last_30=income_30,
                expense_last_30=expense_30,
            )
        )

    total_balance = sum(currency_totals.values())

    # Budgets progress
    budget_summaries: List[BudgetSummary] = []
    for budget in budgets:
        spent_query = db.query(func.coalesce(func.sum(models.Transaction.amount), 0))
        spent_query = spent_query.join(models.Category)
        spent_query = spent_query.filter(
            models.Transaction.user_id == current_user.id,
            models.Category.type == "expense",
        )
        if budget.wallet_id:
            spent_query = spent_query.filter(models.Transaction.wallet_id == budget.wallet_id)
        if budget.category_id:
            spent_query = spent_query.filter(models.Transaction.category_id == budget.category_id)
        if budget.start_date:
            spent_query = spent_query.filter(models.Transaction.date >= budget.start_date)
        if budget.end_date:
            spent_query = spent_query.filter(models.Transaction.date <= budget.end_date)

        spent = float(spent_query.scalar() or 0.0)
        budget_amount = float(budget.amount)
        remaining = budget_amount - spent
        progress = spent / budget_amount if budget_amount else 0.0
        budget_summaries.append(
            BudgetSummary(
                id=budget.id,
                name=budget.name,
                amount=budget_amount,
                start_date=budget.start_date,
                end_date=budget.end_date,
                user_id=budget.user_id,
                wallet_id=budget.wallet_id,
                category_id=budget.category_id,
                spent=spent,
                remaining=remaining,
                progress=progress,
            )
        )

    # Recent transactions (detailed) - last 5
    recent_transactions: List[models.Transaction] = (
        db.query(models.Transaction)
        .options(joinedload(models.Transaction.wallet), joinedload(models.Transaction.category))
        .filter(models.Transaction.user_id == current_user.id)
        .order_by(models.Transaction.date.desc().nullslast(), models.Transaction.id.desc())
        .limit(5)
        .all()
    )
    recent_tx_serialized = [TransactionReadDetail.model_validate(tx) for tx in recent_transactions]

    return SummaryResponse(
        total=BalanceSummary(
            total_balance=total_balance,
            currency_totals=dict(currency_totals),
            income_last_30=total_income_30,
            expense_last_30=total_expense_30,
            net_last_30=total_income_30 - total_expense_30,
        ),
        wallets=wallet_summaries,
        budgets=budget_summaries,
        recent_transactions=recent_tx_serialized,
    )
