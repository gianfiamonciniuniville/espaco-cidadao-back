import { ISeo } from "./seo";
import { ICategory } from "./category";
import { IImage } from "./image";
import { IModel } from "./model";
import { IProductAttributeGroup } from "./productAttributeGroup";
import { IPrice } from "./price";

export interface IProduct {
  idProduto?: number;
  idModelo: number;
  Sku: string;
  UrlProduto?: string;
  Ean: string;
  NomeProduto: string;
  EmailAutor: string;
  DataAutoria: number;
  DataAlteracao?: number;
  DataExclusao?: number;
  DefPagina?: string;
  QtdStock?: number;
  PrecoMAP: number;
  PrecoLista?: number;
  Peso: number;
  Largura: number;
  Profundidade?: number;
  Altura: number;
  Nacional?: string;
  Homologacao?: number;
  TituloGoogle?: string;
  Preco?: IPrice[];
  Seo?: ISeo[];
  Imagem?: IImage[];
  Modelo?: IModel[];
  Categoria?: ICategory[];
  ProdutoGrupoAtributo?: IProductAttributeGroup[];
  usaPrecoMap?: boolean;
}

export interface ICategoryProduct {
  idCategoria?: number;
  idProduto?: number;
}
