export interface IPriceSuggestionHistory {
  idPrecoSugestaoHistorico?: number;
  Sku?: number | string;
  PrecoLista?: number;
  PrecoPromocional?: number;
  PrecoCarrinho?: number;
  PrecoListaAntigo?: number;
  PrecoCarrinhoAntigo?: number;
  PrecoPromocionalAntigo?: number;
  DataSugestao?: number;
  DataAutorizacao?: number;
  DataPromoInicio?: number;
  DataPromoFim?: number;
  EmailSugestor?: string;
  EmailAutorizador?: string;
  NomeProduto?: string;
  idCanal?: number;
  idProduto?: number;
  Autorizado?: string;
}
