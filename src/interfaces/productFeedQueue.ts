export interface IProductFeedQueue {
  idFilaProdutoFeed?: number;
  Sku: string;
  DataHora: Date;
  Acao: 0 | 1 | 2;
}
