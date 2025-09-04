import { Request, Response } from "express";

import Service from "../Service";
import { response } from "../../utils/response";

import { AttributeSelect } from "../../models/product/attributeSelect";

export default class SelectAttributeService {
  public selectAttribute = Service(AttributeSelect);
  constructor() {
    this.selectAttribute;
  }

  findAll = async (req: Request, res: Response) => {
    try {
      const selectAttributes = await AttributeSelect.findAll();
      response(res, 200, "OK", selectAttributes);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  newAttributeSelect = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      const atributosValores = body.values;

      await Promise.all(
        atributosValores.map(async (atributoValor: any) => {
          await AttributeSelect.create({
            idAtributo: atributoValor.idAtributo,
            Valor: atributoValor.Valor,
            Ordem: atributoValor.Ordem,
            Padrao: atributoValor.Padrao ? atributoValor.Padrao : "N",
          });
        }),
      );

      response(res, 201, "OK");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updateAttributeSelectByDefault = async (req: Request, res: Response) => {
    const { params, body } = req;

    try {
      const data = {
        idAtributo: body.idAtributo,
        Valor: body.Valor,
        Ordem: body.Ordem,
        Padrao: body.Padrao ? body.Padrao : "N",
      };

      /*const otherSelection = await AttributeSelect.findOne({//bloco que trabalha Padrao "N" ou "S" 
        where: {
          Padrao: "S",
          idAtributo: body.idAtributo,
        },
      });*/

      /*if (otherSelection) {
        await AttributeSelect.update(
          { Padrao: "N" },
          {
            where: {
              idSelecao: otherSelection.idSelecao,
            },
          },
        );
      }*/

      await AttributeSelect.update(data, {
        where: {
          idSelecao: params.id,
          idAtributo: body.idAtributo,
        },
      });

      response(res, 200, "Select atualizado com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  removeAttributeSelect = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      const selectAttribute = await AttributeSelect.destroy({
        where: {
          idSelecao: params.id,
        },
      });
      response(res, 200, "OK", selectAttribute);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}
