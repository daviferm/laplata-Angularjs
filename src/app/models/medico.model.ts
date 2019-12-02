// Clase para manejar usuarios
export class Medico {
    constructor(
        public nombre: string,
        public email: string,
        public password: string,
        public img?: string,
        public direccion?: string,
        public telefono?: string,
        public color?: string,
        public check?: boolean,
        // tslint:disable-next-line: variable-name
        public _id?: string) {}
}
