export interface IOrder {
  IdPedido: number;
  Numero: string;
  idCliente: number | null;
  idEndereco: number | null;
  OS: number | null;
  NotaFiscal: string | null;
  ChaveFiscal: string | null;
  DataCriado: string | Date | null;
  DataAprovado: string | null;
  Valor: number | null;
  Frete: number | null;
  idTransportadora: number | null;
  idCanal: number | null;
  idExterno: string | null;
  DataImportado: string | null;
  idStatus: number | null;
  Ativo: boolean | null;
  Cancelado: boolean | null;
  Enviado: boolean | null;
  Previsao: string | null;
  Entregue: boolean | null;
  idTraAnterior: number | null;
  Origem: string | null;
  TipoPagamento: string | null;
  Juros: number | null;
  PrazoEntrega: number | null;
}
