from fastapi import FastAPI
from app.db import models
from app.db.database import engine
from app.api.routes import users, wallets, categories, transactions
from app.api.routes import auth
from app.api.routes import imports as import_routes
from app.api.routes import backup as backup_routes
from app.api.routes import budgets, summary, api_keys

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Finanzas Personales")

# Rutas principales
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(wallets.router, prefix="/api/wallets", tags=["Wallets"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["Transactions"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(api_keys.router, prefix="/api/auth/api-keys", tags=["Auth"])
from fastapi.responses import PlainTextResponse


@app.get("/status", tags=["status"], response_class=PlainTextResponse)
def read_status():
    return "its ok"

# Import endpoints
app.include_router(import_routes.router, prefix="/api/import", tags=["Import"])
app.include_router(backup_routes.router, prefix="/api/backup", tags=["Backup"])
app.include_router(budgets.router, prefix="/api/budgets", tags=["Budgets"])
app.include_router(summary.router, prefix="/api/summary", tags=["Summary"])
