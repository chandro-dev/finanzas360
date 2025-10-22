import os
import tempfile
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Form
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db import models
from app.deps import get_current_user
from app.services.importer import import_external_sqlite


router = APIRouter()


@router.post("/sqlite")
def import_sqlite(
    file: UploadFile = File(...),
    default_currency: str = Form("COP"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not file.filename.lower().endswith((".sqlite", ".db")):
        raise HTTPException(status_code=400, detail="El archivo debe ser .sqlite o .db")

    # Guardar a un archivo temporal
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
            temp_path = tmp.name
            while True:
                chunk = file.file.read(1024 * 1024)
                if not chunk:
                    break
                tmp.write(chunk)
    finally:
        file.file.close()

    try:
        result = import_external_sqlite(temp_path, db, current_user, default_currency)
        return {
            "status": "ok",
            "import": result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al importar: {e}")
    finally:
        try:
            os.remove(temp_path)
        except Exception:
            pass

