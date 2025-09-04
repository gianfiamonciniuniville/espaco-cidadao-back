import { IAttributeGroup } from "./attributeGroup";

export interface IProductAttributeGroup {
  idProdutoGrupoAtributo?: number;
  idGrupoAtributo?: number;
  idProduto?: number;
  GrupoAtributo?: IAttributeGroup[];
}
