export interface IPublication {
  idPublicacao?: number;
  idCanal?: number;
  idProduto?: number;
  DataPublicacao?: string | number;
  Ativo?: boolean;
  ItensPorKit?: number;
  Code?: string;
}
