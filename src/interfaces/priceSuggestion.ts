export interface IPriceSuggestion {
  idPrecoSugestao?: number;
  idProduto?: number;
  Sku?: number | string;
  PrecoLista?: number;
  PrecoPromocional?: number;
  PrecoCarrinho?: number;
  PrecoCarrinhoAntigo?: number;
  CustoMedio?: number;
  CustoTabela?: number;
  PrecoListaAntigo?: number;
  PrecoPromocionalAntigo?: number;
  DataSugestao?: number;
  EmailSugestor?: string;
  NomeProduto?: string;
  idCanal?: number;
  DataPromoInicio?: number;
  DataPromoFim?: number;
  TaxaMax?: number;
  PercentualLucroPiorCaso?: number;
  LucroPiorCaso?: number;
  Autorizado?: "S" | "N";
  EmailAutorizador?: string;
  ItensPorKit?: number;
  Code?: string;
}
