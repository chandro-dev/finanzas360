import argparse
from typing import Type, List, Dict, Any

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.db import models
from app.db.database import engine as dest_engine, SessionLocal as DestSession


def copy_table(
    src_session,
    dest_session,
    model: Type,
    unique_fields: List[str] | None = None,
    verbose: bool = True,
):
    unique_fields = unique_fields or []
    rows = src_session.query(model).all()
    count = 0
    for row in rows:
        data: Dict[str, Any] = {}
        for c in model.__table__.columns:
            data[c.name] = getattr(row, c.name)

        # Skip if exists by unique fields
        if unique_fields:
            q = dest_session.query(model)
            for f in unique_fields:
                q = q.filter(getattr(model, f) == data.get(f))
            if q.first():
                continue

        # Insert preserving IDs
        obj = model(**data)
        dest_session.add(obj)
        count += 1

    dest_session.commit()
    if verbose:
        print(f"Copied {count} rows into {model.__tablename__}")


def bump_postgres_sequences(dest_session):
    if dest_engine.dialect.name != "postgresql":
        return
    tables = [
        models.User.__tablename__,
        models.Wallet.__tablename__,
        models.Category.__tablename__,
        models.Transaction.__tablename__,
    ]
    for t in tables:
        # setval(pg_get_serial_sequence('table','id'), (SELECT COALESCE(MAX(id),1) FROM table))
        dest_session.execute(
            text(
                "SELECT setval(pg_get_serial_sequence(:t,'id'), COALESCE((SELECT MAX(id) FROM "
                + t
                + "), 1))"
            ),
            {"t": t},
        )
    dest_session.commit()


def main():
    parser = argparse.ArgumentParser(description="Import data from a SQLite file to current DB")
    parser.add_argument("sqlite_path", help="Path to the .sqlite/.db file (e.g., ./finanzas.db)")
    args = parser.parse_args()

    src_engine = create_engine(f"sqlite:///{args.sqlite_path}", connect_args={"check_same_thread": False})
    SrcSession = sessionmaker(bind=src_engine, autoflush=False, autocommit=False)
    src_session = SrcSession()
    dest_session = DestSession()

    try:
        # Order matters due to FKs
        copy_table(src_session, dest_session, models.User, unique_fields=["email"])  # email unique
        copy_table(src_session, dest_session, models.Wallet)
        copy_table(src_session, dest_session, models.Category)
        copy_table(src_session, dest_session, models.Transaction)

        bump_postgres_sequences(dest_session)
        print("Import completed successfully.")
    finally:
        src_session.close()
        dest_session.close()


if __name__ == "__main__":
    main()

