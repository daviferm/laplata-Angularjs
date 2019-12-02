

export class CitaDB {

    constructor(
        public medicoId: string,
        public dia: string,
        public inicio: string,
        public final: string,
        public color: string,
        public pacienteId?: string,
        public evento?: string,
        public incidencia?: string,
        public _id?: string
    ) {}

};