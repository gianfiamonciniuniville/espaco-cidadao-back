import { ProductModel } from "./../../models/product/model";
import { Request, Response } from "express";

import Service from "../Service";
import { response } from "../../utils/response";

import { Publication } from "../../models/product/publication";
import { Product } from "./../../models/product/product";
import { Brand } from "../../models/product/brand";
import { Channel } from "../../models/product/channel";
import sequelize from "../../config/database";
import { QueryTypes } from "sequelize";
import { IUser } from "../../models/user/user";
import { PublicationQueue } from "../../models/product/publicationQueue";
import { Op } from "sequelize";
import { IUserToken } from "../../middlewares/checkToken";
interface IFilaPublicacao {
  id: number;
  AtualizaImagens: number;
}

interface IPublication {
  idProduto: number;
  idCanal: number;
  quantidade: number;
  atualizaImagens?: number;
}
class Publications {
  public publication = Service(Publication);
  constructor() {
    this.publication;
  }

  findAll = async (req: Request, res: Response) => {
    try {
      const publication = await Publication.findAll({
        include: [
          {
            model: Product,
            as: "Produto",
            attributes: {
              exclude: ["idModelo", "Peso", "Altura", "Largura", "Modo", "Profundidade"],
            },
            include: [
              {
                model: ProductModel,
                as: "Modelo",
                include: [{ model: Brand, as: "Marca" }],
              },
            ],
          },
          {
            model: Channel,
            as: "Canal",
          },
        ],
      });

      response(res, 200, "OK", publication);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  newPublication = async (req: Request, res: Response) => {
    const { body }: { body: IPublication } = req;
    const idProduto = body.idProduto;
    const idCanal = body.idCanal;
    const itensPorKit = body.quantidade;
    //@ts-ignore
    const user = req.user as IUserToken;
    const email = user?.email;
    const atualizaImagens = isNaN(Number(body.atualizaImagens)) ? 1 : body.atualizaImagens;
    /* 0 - só atributos
     * 1 - tudo
     * 2 - só imagens
     */

    try {
      /* insere produto na FilaPublicacaoHistorico onde um trigger vai mandar pra FilaPublicacao,
       * depois outro serviço vai ler a fila e tentar publicar o produto
       */
      const query1 = `SET NOCOUNT ON
      select * from FilaPublicacao where idProduto=:idProduto and idCanal=:idCanal and ItensPorKit=:itensPorKit
      `;
      const idFilaPublicacao = await sequelize.query(query1, {
        type: QueryTypes.SELECT,
        replacements: { idProduto, idCanal, itensPorKit },
      });
      if (idFilaPublicacao.length > 0) {
        const row = idFilaPublicacao[0] as IFilaPublicacao;
        const id = row.id;
        if (row.AtualizaImagens !== atualizaImagens && row.AtualizaImagens !== 1) {
          console.log("já na fila: " + id + ", alterado pra mudar imagens e atributos");
          // se tava só atributos ou só imagens e tá mandando diferente, atualizaImagens=1 (todos)
          const query2 = `update FilaPublicacao set AtualizaImagens=1 where id=:id`;
          await sequelize.query(query2, {
            type: QueryTypes.UPDATE,
            replacements: { id },
          });
          response(
            res,
            200,
            "Produto já está na fila de publicação, alterado pra mudar imagens e atributos",
            idFilaPublicacao,
          );
        } else {
          console.log("já na fila: " + id);
          response(res, 200, "Produto já está na fila de publicação", idFilaPublicacao);
          return;
        }
      } else {
        console.log("novo na fila");

        const query = `SET NOCOUNT ON
        declare @localdatetime as datetimeoffset;
        set @localdatetime=(select SYSDATETIMEOFFSET() AT TIME ZONE  'E. South America Standard Time' )
        insert into FilaPublicacaoHistorico (idCanal, sku, DataHora, EmailUsuario, idProduto, AtualizaImagens, ItensPorKit)
        select :idCanal, sku, @localdatetime, :email, idproduto, :atualizaImagens, :itensPorKit 
        from produto where idProduto=:idProduto
        SELECT SCOPE_IDENTITY() AS [id]; 
        `;

        const idFilaPublicacaoHistorico = await sequelize.query<any>(query, {
          type: QueryTypes.SELECT,
          replacements: { idProduto, idCanal, email, atualizaImagens, itensPorKit },
        });
        if (idFilaPublicacaoHistorico.length > 0 && idFilaPublicacaoHistorico[0].id) {
          response(res, 201, "Produto colocado na fila de publicação", idFilaPublicacaoHistorico);
        } else {
          response(
            res,
            502,
            "Erro ao colocar produto na fila de publicação",
            idFilaPublicacaoHistorico,
          );
        }
      }
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updatePublication = async (req: Request, res: Response) => {
    /* não atualiza uma publicação (talvez fila de atualização depois?) */
    response(res, 502);
  };

  removePublication = async (req: Request, res: Response) => {
    /* por enquanto sem funcionalidade de pausar/remover publicação */
    response(res, 502);
  };

  isInPublicationQueue = async (req: Request, res: Response) => {
    const { params } = req;
    const idProduto = params.idProduto;
    const idCanal = params.idCanal;

    try {
      const query = `SET NOCOUNT ON
      select * from FilaPublicacao where idProduto=:idProduto and idCanal=:idCanal
      `;

      const idFilaPublicacao = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { idProduto, idCanal },
      });
      if (idFilaPublicacao.length > 0) {
        response(res, 200, "Produto na fila para ser publicado", idFilaPublicacao);
      } else {
        response(res, 404, "Produto não está na fila de publicação");
      }
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
  isInPublicationQueueAnyChannel = async (req: Request, res: Response) => {
    const { params } = req;
    const idProduto = params.idProduto;

    try {
      const query = `SET NOCOUNT ON
      select * from FilaPublicacao where idProduto=:idProduto
      `;

      const idFilaPublicacao = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { idProduto },
      });
      if (idFilaPublicacao.length > 0) {
        response(res, 200, "Produto na fila para ser publicado", idFilaPublicacao);
      } else {
        response(res, 404, "Produto não está na fila de publicação");
      }
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findAllInQueuePagination = async (req: Request, res: Response) => {
    const { query } = req;
    const page = Number(query.page) || 1;
    const size = Number(query.size) || 20;

    let publicationQueueWhere = {};
    let productWhere = {};

    if (query.idCanal) {
      publicationQueueWhere = { idCanal: Number(query.idCanal) };
    }

    if (query.searchParam === "Sku") {
      productWhere = {
        Sku: {
          [Op.like]: "%" + (query.search || "") + "%",
        },
      };
    } else if (query.searchParam === "Nome") {
      productWhere = {
        NomeProduto: {
          [Op.like]: "%" + (query.search || "") + "%",
        },
      };
    }

    try {
      const PublicationQueueResponse = await PublicationQueue.findAndCountAll({
        include: [
          {
            model: Product,
            as: "Produto",
            attributes: {
              exclude: [
                "Sku",
                "UrlProduto",
                "Peso",
                "Largura",
                "Profundidade",
                "Altura",
                "EmailAutor",
                "DataAutoria",
                "DataAlteracao",
                "DataExclusao",
                "DefPagina",
                "QtdStock",
                "PrecoMAP",
                "Nacional",
              ],
            },
            where: productWhere,
          },
          {
            model: Channel,
            as: "Canal",
            attributes: {
              exclude: ["idCanal"],
            },
          },
        ],
        order: [["dtHoraFila", "DESC"]],
        attributes: {
          exclude: ["idProduto"],
        },
        where: publicationQueueWhere,
        limit: size,
        offset: (page - 1) * size,
        distinct: true,
      });
      response(res, 200, "OK", {
        publications: PublicationQueueResponse.rows,
        total: PublicationQueueResponse.count,
        limit: size,
        actualPage: page,
        totalPages: Math.ceil(PublicationQueueResponse.count / size),
      });
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default Publications;
