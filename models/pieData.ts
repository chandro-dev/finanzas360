export interface LineData {
    labels: string[];
    datasets: {
      data: number[];
      color: (opacity?: number) => string;
      strokeWidth: number;
    }[];
    legend: string[];
  }
  
export  interface DataLine {
    ingresos: number;
    egresos: number;
    mes: string;
  }