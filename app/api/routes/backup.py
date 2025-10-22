import os
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db import models
from app.deps import get_current_user


router = APIRouter()


@router.get("/export")
def export_backup(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    wallets = db.query(models.Wallet).filter(models.Wallet.user_id == current_user.id).all()
    categories = db.query(models.Category).filter(models.Category.user_id == current_user.id).all()
    transactions = db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id).all()

    payload = {
        "meta": {
            "generated_at": datetime.now(tz=timezone.utc).isoformat(),
            "user_id": current_user.id,
            "email": current_user.email,
            "version": 1,
        },
        "wallets": [
            {"id": w.id, "name": w.name, "currency": w.currency, "balance": float(w.balance or 0)}
            for w in wallets
        ],
        "categories": [
            {"id": c.id, "name": c.name, "type": c.type}
            for c in categories
        ],
        "transactions": [
            {
                "id": t.id,
                "amount": float(t.amount),
                "description": t.description,
                "date": t.date.isoformat() if t.date else None,
                "wallet_id": t.wallet_id,
                "category_id": t.category_id,
            }
            for t in transactions
        ],
    }

    return JSONResponse(content=payload)


@router.post("/sqlite")
def upload_sqlite_backup(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
):
    if not file.filename.lower().endswith((".sqlite", ".db")):
        raise HTTPException(status_code=400, detail="El archivo debe ser .sqlite o .db")

    # Guardar archivo en carpeta backups/{user_id}/
    folder = os.path.join("backups", str(current_user.id))
    os.makedirs(folder, exist_ok=True)
    timestamp = datetime.now(tz=timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    dest_path = os.path.join(folder, f"{timestamp}_{file.filename}")

    try:
        with open(dest_path, "wb") as f:
            while True:
                chunk = file.file.read(1024 * 1024)
                if not chunk:
                    break
                f.write(chunk)
    finally:
        file.file.close()

    return {"status": "stored", "path": dest_path.replace("\\", "/")}

