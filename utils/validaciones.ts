export class ValidacionTransaccion {
    static validarCampos(descripcion: string, cantidad: string, categoria: string, cuenta: string): string | null {
      if (!descripcion.trim()) return "La descripción es obligatoria";
      if (!cantidad.trim()) return "La cantidad es obligatoria";
      const monto = parseFloat(cantidad);
      if (isNaN(monto)) return "La cantidad debe ser un número";
      if (!cuenta) return "La cuenta es obligatoria";
      if (!categoria) return "La categoría es obligatoria";
      return null; // Todo bien
    }
  }

