import argparse
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Optional

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.db import models
from app.db.database import engine as dest_engine, SessionLocal
from app.security import hash_password


def to_date(ts: Optional[int]):
    if ts is None:
        return None
    try:
        return datetime.fromtimestamp(int(ts), tz=timezone.utc).date()
    except Exception:
        return None


def d2(amount: float | Decimal) -> Decimal:
    return (Decimal(str(amount))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def ensure_user(session, email: str, name: Optional[str] = None) -> models.User:
    user = session.query(models.User).filter(models.User.email == email).first()
    if user:
        return user
    user = models.User(
        email=email,
        name=name or email.split("@")[0],
        password_hash=hash_password("imported"),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def main():
    parser = argparse.ArgumentParser(description="Importa wallets/categorías/transacciones desde un SQLite externo")
    parser.add_argument("sqlite_path", help="Ruta al archivo SQLite externo (p.ej. ./origen.sqlite)")
    parser.add_argument("--email", required=True, help="Email del usuario destino en el sistema")
    parser.add_argument("--name", default=None, help="Nombre para crear el usuario si no existe")
    parser.add_argument("--default-currency", default="COP", help="Moneda por defecto para wallets si falta")
    args = parser.parse_args()

    # Engine origen (SQLite externo)
    src_engine = create_engine(f"sqlite:///{args.sqlite_path}", connect_args={"check_same_thread": False})
    SrcSession = sessionmaker(bind=src_engine, autoflush=False, autocommit=False)
    src = SrcSession()

    # Destino (DB actual desde .env)
    dest = SessionLocal()

    try:
        # Asegurar usuario destino
        user = ensure_user(dest, args.email, args.name)

        # Mapas de PK origen (TEXT) a IDs destino (INT)
        wallet_map: Dict[str, int] = {}
        category_map: Dict[str, int] = {}

        # Importar wallets
        wallets_rs = src.execute(
            text(
                "SELECT wallet_pk, name, currency FROM wallets ORDER BY date_created ASC"
            )
        )
        wallet_count = 0
        for row in wallets_rs.mappings():
            name = row.get("name")
            currency = row.get("currency") or args.default_currency
            w = models.Wallet(name=name, currency=currency, balance=Decimal("0.00"), user_id=user.id)
            dest.add(w)
            dest.flush()  # obtiene id antes de commit
            wallet_map[str(row.get("wallet_pk"))] = w.id
            wallet_count += 1
        dest.commit()

        # Importar categorías
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
            dest.add(c)
            dest.flush()
            category_map[str(row.get("category_pk"))] = c.id
            cat_count += 1
        dest.commit()

        # Importar transacciones
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

            amount = d2(row.get("amount") or 0)
            desc_parts = [p for p in [row.get("name"), row.get("note")] if p]
            description = " - ".join(desc_parts) if desc_parts else None
            dt = to_date(row.get("date_created"))
            income_flag = int(row.get("income") or 0)

            t = models.Transaction(
                amount=amount,
                description=description,
                date=dt,
                wallet_id=wallet_id,
                category_id=category_id,
                user_id=user.id,
            )
            dest.add(t)

            # Actualizar balance de la wallet
            w = dest.query(models.Wallet).get(wallet_id)
            if income_flag == 1:
                w.balance = d2((w.balance or Decimal("0")) + amount)
            else:
                w.balance = d2((w.balance or Decimal("0")) - amount)

            tx_count += 1

        dest.commit()

        print(f"Import wallets: {wallet_count}")
        print(f"Import categories: {cat_count}")
        print(f"Import transactions: {tx_count}")
        if skipped_wallet:
            print(f"Skipped transactions due to missing wallet: {skipped_wallet}")
        if skipped_category:
            print(f"Skipped transactions due to missing category: {skipped_category}")

        print("Import completed successfully.")
    finally:
        src.close()
        dest.close()


if __name__ == "__main__":
    main()

