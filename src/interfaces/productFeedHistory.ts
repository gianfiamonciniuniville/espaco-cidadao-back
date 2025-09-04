export interface IProductFeedHistory {
  idFilaProdutoFeedHistorico?: number;
  Sku: string;
  DataHora?: number | Date;
  DataHoraUpdate?: number;
  Acao: 0 | 1 | 2;
}
/*
0 - exclui 
1 - cria
2 - atualiza
*/
