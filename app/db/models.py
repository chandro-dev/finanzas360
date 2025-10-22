from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, Date, Text, Index, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    name = Column(String)
    password_hash = Column(String, nullable=False)
    telegram_id = Column(String, unique=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    wallets = relationship("Wallet", back_populates="user")
    categories = relationship("Category", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")
    api_keys = relationship("APIKey", back_populates="user", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="user", cascade="all, delete-orphan")


class Wallet(Base):
    __tablename__ = "wallets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    balance = Column(Numeric(14, 2), default=0)
    currency = Column(String, default="COP")
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    user = relationship("User", back_populates="wallets")
    transactions = relationship("Transaction", back_populates="wallet")


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # income / expense
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    user = relationship("User", back_populates="categories")
    transactions = relationship("Transaction", back_populates="category")
    budget_limits = relationship("CategoryBudgetLimit", back_populates="category", cascade="all, delete-orphan")


class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True)
    amount = Column(Numeric(14, 2), nullable=False)
    description = Column(Text)
    date = Column(Date)
    wallet_id = Column(Integer, ForeignKey("wallets.id"), index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    wallet = relationship("Wallet", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")
    user = relationship("User", back_populates="transactions")

    __table_args__ = (
        Index("ix_transactions_user_date", "user_id", "date"),
    )


class Budget(Base):
    __tablename__ = "budgets"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    period_start = Column(Date, nullable=True)
    period_end = Column(Date, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="budgets")
    wallet = relationship("Wallet")
    category = relationship("Category")
    limits = relationship("CategoryBudgetLimit", back_populates="budget", cascade="all, delete-orphan")


class CategoryBudgetLimit(Base):
    __tablename__ = "category_budget_limits"
    id = Column(Integer, primary_key=True)
    budget_id = Column(Integer, ForeignKey("budgets.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    limit_amount = Column(Numeric(14, 2), nullable=False)

    budget = relationship("Budget", back_populates="limits")
    category = relationship("Category", back_populates="budget_limits")


class APIKey(Base):
    __tablename__ = "api_keys"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    key_hash = Column(String, nullable=False, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="api_keys")
