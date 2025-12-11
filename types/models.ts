// TrackTeam TypeScript Type Definitions

// Colaborador types
export type Colaborador = {
  id: string;
  nombre: string;
  apellido: string;
  cargo: string;
  email: string;
  ciudad: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Equipo types
export type Equipo = {
  id: string;
  serial: string;
  marca: string;
  modelo: string;
  tipo: "Desktop" | "Portátil";
  procesador: string;
  ram: number;
  almacenamiento: string;
  gpu: string;
  estadoSalud: "Bueno" | "Regular" | "Malo";
  fechaAdquisicion: Date;
  colaboradorId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type EquipoCreateInput = {
  serial: string;
  marca: string;
  modelo: string;
  tipo: "Desktop" | "Portátil";
  procesador: string;
  ram: number;
  almacenamiento: string;
  gpu: string;
  estadoSalud?: "Bueno" | "Regular" | "Malo";
  fechaAdquisicion: Date;
  colaboradorId?: string;
};

export type EquipoUpdateInput = Partial<EquipoCreateInput>;

// ServicioTecnico types
export type ServicioTecnico = {
  id: string;
  tipo: "Preventivo" | "Correctivo" | "Limpieza" | "Actualización de Software";
  fechaServicio: Date;
  problemas: string;
  soluciones: string;
  tiempoInvertido: number;
  estadoResultante: "Bueno" | "Regular" | "Malo";
  equipoId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ServicioTecnicoCreateInput = {
  tipo: "Preventivo" | "Correctivo" | "Limpieza" | "Actualización de Software";
  fechaServicio: Date;
  problemas: string;
  soluciones: string;
  tiempoInvertido: number;
  estadoResultante: "Bueno" | "Regular" | "Malo";
  equipoId: string;
};

export type ServicioTecnicoUpdateInput = Partial<ServicioTecnicoCreateInput>;
