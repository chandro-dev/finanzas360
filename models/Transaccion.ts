// models/Transaccion.ts

import { Categoria } from "@/models/Categoria";
import { Cuenta } from "@/models/Cuenta";
import { Tag } from "@/models/Tag";

export interface Transaccion {
  id: number;
  nombre: string;
  cantidad: number;
  fecha: string;
  categoria_id: number | null;
  Cuenta_id: number | null;
  categoria?: Categoria;   
  cuenta?: Cuenta;         
  tags?: Tag[];            
  categoria_nombre?: string; 
  categoria_icono?: string;  
  cuenta_nombre?: string;   
}
