export class Mascota {

  id: string;
  nombre: string;
  edad: number;
  tipo: string;
  raza: string;
  descripcion?: string;
  estadoAdopcion: boolean;
  estadoDonacion: boolean;
  creada_en: Date;
  organizacionId: string;

  // Relacionales (pueden omitirse en el DTO si no quieres anidar)
  donaciones?: any[];
  adopciones?: any[];
  imagenes?: any[];

}
