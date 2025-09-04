export interface IPriceQueueHistory {
  idFilaPrecoHistorico?: number;
  idCanal?: number;
  Sku?: string | number;
  PrecoLista: number;
  PrecoPromocional?: number;
  PrecoCarrinho?: number | null;
  PrecoListaAntigo?: number;
  PrecoCarrinhoAntigo?: number | null;
  PrecoPromocionalAntigo?: number;
  EmailUsuario?: string;
  DataHora: number;
  DataHoraUpdate?: number;
  DataPromoInicio?: number;
  DataPromoFim?: number;
  NotificarCarrinhoAbandonado?: boolean;
  Code?: string;
  ItensPorKit?: number;
}
