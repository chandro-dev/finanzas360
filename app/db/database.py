from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from typing import Generator

# Cargar variables desde .env si existe
try:
    from dotenv import load_dotenv  # type: ignore
    load_dotenv()
except Exception:
    pass


# Permite usar una URL completa o componentes separados
# Variables soportadas:
# - DATABASE_URL (prioritaria)
# - DB_DIALECT (ej: postgresql+psycopg2, mysql+pymysql, sqlite)
# - DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME

def _build_db_url_from_parts() -> str:
    # Por defecto, usar SQLite para facilitar el arranque local
    dialect = os.getenv("DB_DIALECT", "sqlite").strip()
    user = os.getenv("DB_USER", "").strip()
    password = os.getenv("DB_PASSWORD", "").strip()
    host = os.getenv("DB_HOST", "localhost").strip()
    port = os.getenv("DB_PORT", "5432").strip()
    name = os.getenv("DB_NAME", "./finanzas.db").strip()
    if dialect.startswith("sqlite"):
        # Para sqlite, usar ruta simple: sqlite:///./finanzas.db
        db_path = name if name else "./finanzas.db"
        return f"sqlite:///{db_path}"
    creds = f"{user}:{password}@" if user or password else ""
    hostport = f"{host}:{port}" if port else host
    return f"{dialect}://{creds}{hostport}/{name}"


DATABASE_URL = os.getenv("DATABASE_URL") or _build_db_url_from_parts()

# Config especial para SQLite (hilos)
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
