from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Optional, Tuple

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session

from app.db import models


def _to_date(ts: Optional[int]):
    if ts is None:
        return None
    try:
        return datetime.fromtimestamp(int(ts), tz=timezone.utc).date()
    except Exception:
        return None


def _d2(amount: float | Decimal) -> Decimal:
    return (Decimal(str(amount))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def import_external_sqlite(
    sqlite_path: str,
    db: Session,
    user: models.User,
    default_currency: str = "COP",
) -> Dict[str, int]:
    """Import wallets, categories, and transactions from external SQLite schema into our DB for the given user.

    Returns a dict with counters.
    """
    src_engine = create_engine(
        f"sqlite:///{sqlite_path}", connect_args={"check_same_thread": False}
    )
    SrcSession = sessionmaker(bind=src_engine, autoflush=False, autocommit=False)
    src = SrcSession()

    wallet_map: Dict[str, int] = {}
    category_map: Dict[str, int] = {}

    try:
        # Wallets
        wallets_rs = src.execute(
            text(
                "SELECT wallet_pk, name, currency FROM wallets ORDER BY date_created ASC"
            )
        )
        wallet_count = 0
        for row in wallets_rs.mappings():
            name = row.get("name")
            currency = row.get("currency") or default_currency
            w = models.Wallet(
                name=name, currency=currency, balance=Decimal("0.00"), user_id=user.id
            )
            db.add(w)
            db.flush()
            wallet_map[str(row.get("wallet_pk"))] = w.id
            wallet_count += 1
        db.commit()

        # Categories
        cats_rs = src.execute(
            text(
                "SELECT category_pk, name, income FROM categories ORDER BY date_created ASC"
            )
        )
        cat_count = 0
        for row in cats_rs.mappings():
            name = row.get("name")
            income_flag = int(row.get("income") or 0)
            ctype = "income" if income_flag == 1 else "expense"
            c = models.Category(name=name, type=ctype, user_id=user.id)
            db.add(c)
            db.flush()
            category_map[str(row.get("category_pk"))] = c.id
            cat_count += 1
        db.commit()

        # Transactions
        tx_rs = src.execute(
            text(
                "SELECT transaction_pk, name, note, amount, category_fk, wallet_fk, date_created, income "
                "FROM transactions ORDER BY date_created ASC"
            )
        )
        tx_count = 0
        skipped_wallet = 0
        skipped_category = 0
        for row in tx_rs.mappings():
            wallet_fk = str(row.get("wallet_fk")) if row.get("wallet_fk") is not None else None
            category_fk = str(row.get("category_fk")) if row.get("category_fk") is not None else None
            wallet_id = wallet_map.get(wallet_fk) if wallet_fk else None
            category_id = category_map.get(category_fk) if category_fk else None
            if not wallet_id:
                skipped_wallet += 1
                continue
            if not category_id:
                skipped_category += 1
                continue

            amount = _d2(row.get("amount") or 0)
            desc_parts = [p for p in [row.get("name"), row.get("note")] if p]
            description = " - ".join(desc_parts) if desc_parts else None
            dt = _to_date(row.get("date_created"))
            income_flag = int(row.get("income") or 0)

            t = models.Transaction(
                amount=amount,
                description=description,
                date=dt,
                wallet_id=wallet_id,
                category_id=category_id,
                user_id=user.id,
            )
            db.add(t)

            # Update wallet balance
            w = db.query(models.Wallet).get(wallet_id)
            if income_flag == 1:
                w.balance = _d2((w.balance or Decimal("0")) + amount)
            else:
                w.balance = _d2((w.balance or Decimal("0")) - amount)

            tx_count += 1

        db.commit()

        return {
            "wallets": wallet_count,
            "categories": cat_count,
            "transactions": tx_count,
            "skipped_missing_wallet": skipped_wallet,
            "skipped_missing_category": skipped_category,
        }
    finally:
        src.close()

