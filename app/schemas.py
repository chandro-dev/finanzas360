from datetime import date as dt_date
from typing import Optional, List
from pydantic import BaseModel, EmailStr
try:
    # Pydantic v2
    from pydantic import ConfigDict  # type: ignore
except Exception:
    ConfigDict = dict  # fallback para evitar errores si no existe


# User
class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int
    telegram_id: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    name: Optional[str] = None
    telegram_id: Optional[str] = None


# Wallet
class WalletBase(BaseModel):
    name: str
    currency: Optional[str] = "COP"


class WalletCreate(WalletBase):
    balance: Optional[float] = 0.0


class WalletRead(WalletBase):
    id: int
    balance: float
    user_id: int
    model_config = ConfigDict(from_attributes=True)


# Category
class CategoryBase(BaseModel):
    name: str
    type: str  # income / expense


class CategoryCreate(CategoryBase):
    pass


class CategoryRead(CategoryBase):
    id: int
    user_id: int
    model_config = ConfigDict(from_attributes=True)


# Transaction
class TransactionBase(BaseModel):
    amount: float
    description: Optional[str] = None
    date: dt_date | None = None


class TransactionCreate(TransactionBase):
    wallet_id: int
    category_id: int


class TransactionRead(TransactionBase):
    id: int
    wallet_id: int
    category_id: int
    user_id: int
    model_config = ConfigDict(from_attributes=True)


# Auth
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Expanded representations
class WalletReadLite(BaseModel):
    id: int
    name: str
    currency: str | None = None
    model_config = ConfigDict(from_attributes=True)


class CategoryReadLite(BaseModel):
    id: int
    name: str
    type: str
    model_config = ConfigDict(from_attributes=True)


class TransactionReadDetail(TransactionRead):
    wallet: WalletReadLite
    category: CategoryReadLite
    model_config = ConfigDict(from_attributes=True)


# Budgets
class BudgetBase(BaseModel):
    name: str
    amount: float
    start_date: dt_date | None = None
    end_date: dt_date | None = None
    wallet_id: Optional[int] = None
    category_id: Optional[int] = None


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    start_date: dt_date | None = None
    end_date: dt_date | None = None
    wallet_id: Optional[int] = None
    category_id: Optional[int] = None


class BudgetRead(BudgetBase):
    id: int
    user_id: int
    model_config = ConfigDict(from_attributes=True)


# API Keys
class APIKeyCreate(BaseModel):
    name: str


class APIKeyRead(BaseModel):
    id: int
    name: str
    created_at: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class APIKeyWithSecret(APIKeyRead):
    key: str


# Summaries
class BalanceSummary(BaseModel):
    total_balance: float
    currency_totals: dict[str, float]


class WalletBalanceSummary(BaseModel):
    wallet: WalletReadLite
    balance: float


class SummaryResponse(BaseModel):
    total: BalanceSummary
    wallets: List[WalletBalanceSummary]
    budgets: Optional[List[BudgetRead]] = None
