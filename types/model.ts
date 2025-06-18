// /models/Transaccion.ts
export type Transaccion = {
  id: string;
  cuentaId: string;
  categoriaId: string;
  descripcion: string;
  cantidad: number;
  fecha: string;
};

// /models/Cuenta.ts
export type Cuenta = {
  id: string;
  nombre: string;
  saldo: number;
};

// /models/Tarjeta.ts
export type Tarjeta = {
  id: string;
  nombre: string;
  cupo: number;
  disponible: number;
};

// /models/Persona.ts
export type Persona = {
  id: string;
  nombre: string;
  deuda: number;
};

// /models/Recordatorio.ts
export type Recordatorio = {
  id: string;
  mensaje: string;
  fecha: string;
  completado: boolean;
};
export type Categoria = {
  id: string;
  nombre: string;
  tipo: 'ingreso' | 'egreso';
};
