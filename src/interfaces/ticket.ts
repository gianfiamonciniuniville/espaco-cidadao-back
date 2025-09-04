export interface ITicket {
  id?: number;
  Titulo?: string;
  Descricao?: string;
  EmailAutor?: string;
  DataAutoria?: number;
  Path?: string;
  idTicketStatus?: number;
  idTicketNivelPrioridade?: number;
  idResponsavel?: number;
}
