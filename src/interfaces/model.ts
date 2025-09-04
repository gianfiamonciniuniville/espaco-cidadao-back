import { IBrand } from "./brand";

export interface IModel {
  idModelo?: number;
  idMarca?: number;
  NomeModelo?: string;
  Marca?: IBrand;
  idbloco?: string;
}
