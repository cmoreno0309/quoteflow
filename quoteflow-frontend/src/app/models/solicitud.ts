export interface Solicitud {
  id: string;
  clienteRef: string;
  textoOriginal: string;
  estado: string;
  creadaEn: string;
}

export interface Linea {
  sku: string;
  nombre: string;
  cantidad: number;
  total: number;
}

export interface SolicitudDetalle {
  id: string;
  clienteRef: string;
  textoOriginal: string;
  estado: string;
  cliente: { conocido: boolean; nombre?: string; tier?: string } | null;
  lineas: Linea[];
  pricing: { subtotal: number; pctPedido: number; total: number } | null;
  aprobacion: { requerida: boolean; razones: string[]; decision?: string } | null;
  borrador: string | null;
  traza: { nodo: string; nota: string; ts: string }[];
}
