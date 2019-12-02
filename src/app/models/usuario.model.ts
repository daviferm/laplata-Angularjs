

export class Usuario {

    constructor(
        public nombre: string,
        public apellidos: string,
        public email: string,
        public telefono: string,
        public genero: string,
        public nacimiento?: string,
        public img?: string,
        public direccion?: string,
        public codigoPostal?: string,
        public ciudad?: string,
        public provincia?: string,
        public antiguedad?: string,
        public observaciones?: string,
        public _id?: string
    ) {}

}