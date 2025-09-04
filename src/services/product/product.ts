import { Request, Response } from "express";
import { response } from "../../utils/response";
import Service from "../Service";
import sequelize from "../../config/database";
import { Op, Order, WhereOptions } from "sequelize";
import { Brand } from "../../models/product/brand";
import { Category } from "../../models/product/category";
import { Channel } from "../../models/product/channel";
import { Description } from "../../models/product/description";
import { AttributeGroup } from "../../models/product/attributeGroup";
import { Image } from "../../models/product/image";
import { ProductModel } from "../../models/product/model";
import { Price } from "../../models/product/price";
import { Product } from "../../models/product/product";
import { ProductGroupAttribute } from "../../models/product/productGroupAttribute";
import { Publication } from "../../models/product/publication";
import { Seo } from "../../models/product/seo";
import { ComposedDescription } from "../../models/product/composedDescription";
import { Url } from "../../models/product/url";
import { GoogleProduct } from "../../models/product/googleProduct";
import { ImagemKit } from "../../models/product/imageKit";

class Products {
  public product = Service(Product);
  constructor() {
    this.product;
  }

  createProduct = async (req: Request, res: Response) => {
    const { body } = req;

    if (!body.Sku) {
      response(res, 422, "Informe o Sku");
      return;
    }

    if (!body.NomeProduto) {
      response(res, 422, "Informe o Nome do Produto");
      return;
    }

    try {
      const data = {
        NomeProduto: body.NomeProduto,
        Sku: body.Sku,
        Ean: body.Ean,
        Peso: body.Peso,
        Largura: body.Largura,
        Altura: body.Altura,
        UrlProduto: body.UrlProduto,
        Profundidade: body.Profundidade,
        EmailAutor: body.EmailAutor,
        idModelo: body.idModelo,
        PrecoMAP: body.PrecoMAP,
        QtdStock: body.QtdStock,
        DefPagina: body.DefPagina,
        Homologacao: body.Homologacao,
        TituloGoogle: body.TituloGoogle,
        DataAutoria: Date.now(),
      };
      const product = await Product.create(data);
      response(res, 201, "OK", product);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updateProduct = async (req: Request, res: Response) => {
    const { params, body } = req;
    const productExist = await Product.findByPk(params.id);

    if (!productExist) {
      response(res, 404, "Produto não encontrado");
      return;
    }

    try {
      const data = {
        NomeProduto: body.NomeProduto,
        Sku: body.Sku,
        Ean: body.Ean,
        Peso: body.Peso,
        Largura: body.Largura,
        Altura: body.Altura,
        UrlProduto: body.UrlProduto,
        Profundidade: body.Profundidade,
        EmailAutor: body.EmailAutor,
        idModelo: body.idModelo,
        PrecoMAP: body.PrecoMAP,
        QtdStock: body.QtdStock,
        DefPagina: body.DefPagina,
        Homologacao: body.Homologacao,
        TituloGoogle: body.TituloGoogle,
        DataAlteracao: Date.now(),
      };

      await Product.update(data, { where: { idProduto: params.id } });

      response(res, 200, "Produto atualizado com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  removeProduct = async (req: Request, res: Response) => {
    const { params } = req;

    const productExist = await Product.findByPk(params.id);

    if (!productExist) {
      response(res, 404, "Produto não encontrado!");
      return;
    }

    try {
      await Product.destroy({ where: { idProduto: params.id } });
      response(res, 200, `Produto ${productExist.NomeProduto} excluído com sucesso`);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findOneProductByPk = async (req: Request, res: Response) => {
    const { params } = req;
    try {
      const product = await Product.findByPk(params.id, {
        include: [
          { model: Image, as: "Imagem", required: false, order: [["Ordem", "ASC"]] },
          { model: Seo, as: "Seo", required: false },
          { model: Url, as: "Url", required: false },
          {
            model: Category,
            as: "Categoria",
            required: false,
            include: [{ model: Channel, as: "Canal", required: false }],
          },
          {
            model: Price,
            as: "Preco",
            include: [{ model: Channel, as: "Canal" }],
          },
          {
            model: Publication,
            as: "Publicacao",
            required: false,
            include: [{ model: Channel, as: "Canal", required: false }],
          },
          {
            model: Description,
            as: "Descricao",
            required: false,
            include: [
              { model: Channel, as: "Canal", required: false },
              { model: ComposedDescription, as: "DescricaoComposicao", required: false },
            ],
          },
          {
            model: ProductModel,
            as: "Modelo",
            required: false,
            include: [{ model: Brand, as: "Marca", required: false }],
          },
          /*
          {
            model: ProductAttributeValue,
            as: "ProdutoAtributoValor",
            required: false,
            include: [
              {
                model: Attribute,
                as: "Atributo",
                required: false,
                include: [{ model: FieldType, as: "TipoCampo", required: false }],
              },
            ],
          },*/
          {
            model: ProductGroupAttribute,
            as: "ProdutoGrupoAtributo",
            required: false,
            include: [
              {
                model: AttributeGroup,
                as: "GrupoAtributo",
                required: false,
              },
            ],
          },
          {
            model: GoogleProduct,
            as: "GoogleProduct",
            required: false,
            attributes: { exclude: ["Sku"] },
          },
        ],
      });

      response(res, 200, "OK", product);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
  findOneProductBySku = async (req: Request, res: Response) => {
    const { params } = req;
    try {
      const product = await Product.findOne({
        where: { Sku: params.sku },
        include: [
          { model: Image, as: "Imagem", required: false, order: [["Ordem", "ASC"]] },
          { model: Seo, as: "Seo", required: false },
          { model: ImagemKit, as: "ImagemKit", required: false },
          { model: Url, as: "Url", include: [{ model: Channel, as: "Canal" }], required: false },
          {
            model: Category,
            as: "Categoria",
            required: false,
            include: [{ model: Channel, as: "Canal", required: false }],
          },
          {
            model: Price,
            as: "Preco",
            include: [{ model: Channel, as: "Canal" }],
          },
          {
            model: Publication,
            as: "Publicacao",
            required: false,
            include: [{ model: Channel, as: "Canal", required: false }],
          },
          {
            model: Description,
            as: "Descricao",
            required: false,
            include: [
              { model: Channel, as: "Canal", required: false },
              { model: ComposedDescription, as: "DescricaoComposicao", required: false },
            ],
          },
          {
            model: ProductModel,
            as: "Modelo",
            required: false,
            include: [{ model: Brand, as: "Marca", required: false }],
          },
          {
            model: ProductGroupAttribute,
            as: "ProdutoGrupoAtributo",
            required: false,
            include: [
              {
                model: AttributeGroup,
                as: "GrupoAtributo",
                required: false,
              },
            ],
          },
          {
            model: GoogleProduct,
            as: "GoogleProduct",
            required: false,
            attributes: { exclude: ["Sku"] },
          },
        ],
      });

      if (!product) {
        response(res, 404, "Produto não encontrado!");
        return;
      }

      response(res, 200, "OK", product);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  async findPricingProduct(req: Request, res: Response) {
    const { params } = req;
    try {
      const product = await Product.findOne({
        where: { Sku: params.sku },
        include: [
          { model: Image, as: "Imagem", required: false, order: [["Ordem", "ASC"]] },
          { model: ImagemKit, as: "ImagemKit", required: false },
          { model: Url, as: "Url", required: false },
        ],
      });

      if (!product) {
        response(res, 404, "Produto não encontrado!");
        return;
      }

      response(res, 200, "OK", product);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  }

  getPricesByPk = async (req: Request, res: Response) => {
    const { params, query } = req;
    try {
      const prices = await Price.findAll({
        where: { idProduto: params.id },
      });
      response(res, 200, "OK", prices);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  getPublicationsByPk = async (req: Request, res: Response) => {
    const { params } = req;
    try {
      const publications = await Publication.findAll({
        where: { idProduto: params.id },
      });
      response(res, 200, "OK", publications);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findAllProducts = async (req: Request, res: Response) => {
    const { query } = req;
    const page = Number(query.page) || 1;
    const size = Number(query.size) || 20;

    try {
      let whereProduct:
        | {
            NomeProduto?: { [Op.like]: string };
            Sku?: string;
            idProduto?: { [Op.notIn]?: any; [Op.in]?: any };
            idModelo?: { [Op.is]?: null; [Op.eq]?: number; [Op.in]?: any };
            QtdStock?: { [Op.gt]?: number; [Op.eq]?: number };
            Ean?: { [Op.or]?: any };
          }
        | any = {};

      if (query.search) {
        whereProduct = { ...whereProduct, NomeProduto: { [Op.like]: "%" + query.search + "%" } };
      }

      if (query.sku) {
        whereProduct = { ...whereProduct, Sku: query.sku as string };
      }

      if (query.image === "null") {
        const subquery = `
        SELECT idProduto FROM Imagem 
        `;
        whereProduct = {
          ...whereProduct,
          idProduto: {
            [Op.notIn]: sequelize.literal(`(${subquery})`),
          },
        };
      }

      if (query.model) {
        if (isNaN(Number(query.model))) {
          whereProduct = {
            ...whereProduct,
            idModelo: {
              [Op.is]: null,
            },
          };
        } else {
          whereProduct = {
            ...whereProduct,
            idModelo: { [Op.eq]: Number(query.model) },
          };
        }
      } else if (query.brand && isNaN(Number(query.brand)) == false) {
        whereProduct = {
          ...whereProduct,
          idModelo: {
            [Op.in]: sequelize.literal(
              `(SELECT idModelo FROM Modelo WHERE idMarca=${Number(query.brand)})`,
            ),
          },
        };
      }

      if (query.ean === "false") {
        whereProduct = {
          ...whereProduct,
          Ean: {
            [Op.or]: {
              [Op.is]: null,
              [Op.eq]: "",
            },
          },
        };
      }
      if (query.groupid) {
        if (query.groupid === "null") {
          const subquery = `
          select p.idProduto from produto p
          left join ProdutoGrupoAtributo pga on p.idProduto=pga.idProduto
          where pga.idGrupoAtributo is null 
          `;
          whereProduct = {
            ...whereProduct,
            idProduto: { ...whereProduct.idProduto, [Op.in]: sequelize.literal(`(${subquery})`) },
          };
        } else {
          const subquery = `SELECT idProduto FROM ProdutoGrupoAtributo WHERE idGrupoAtributo=${query.groupid}`;
          whereProduct = {
            ...whereProduct,
            idProduto: { ...whereProduct.idProduto, [Op.in]: sequelize.literal(`(${subquery})`) },
          };
        }
      }

      let order: Order = [["QtdStock", "DESC"]];
      if (query.order === "asc") {
        order = [["QtdStock", "ASC"]];
      }

      if (query.stock) {
        if (query.stock === "0") {
          whereProduct = {
            ...whereProduct,
            QtdStock: { [Op.eq]: 0 },
          };
        } else if (query.stock === "1") {
          whereProduct = {
            ...whereProduct,
            QtdStock: { [Op.gt]: 0 },
          };
        }
      }

      /* possibilidades:
       *    published=idCanal
       *    notPublished=idCanal
       *    nenhum dos dois
       */
      let publication_required: boolean = false;
      let publication_query: WhereOptions | undefined = undefined;
      if (query.published) {
        publication_required = true;
        publication_query = { idCanal: query.published };
      } else if (query.notPublished) {
        if (isNaN(Number(query.notPublished))) {
          throw new Error(`${query.notPublished} is not a number`);
        } else {
          const subquery = `
          SELECT idProduto FROM Publicacao WHERE idCanal= ${query.notPublished}
          `;
          whereProduct = {
            ...whereProduct,
            idProduto: {
              ...whereProduct.idProduto,
              [Op.notIn]: sequelize.literal(`(${subquery})`),
            },
          };
        }
      }

      let categoryWhere: WhereOptions | undefined = undefined;

      if (query.category) {
        categoryWhere = { idCategoria: query.category };
      }

      let requiredGoogle: boolean = false;

      if (query.google === "all") {
        requiredGoogle = true;
      }

      /*
      OBS: precisava desse query sem os includes pra contar só os produtos,
      no outro conta as linhas dos includes tb, mas com distinct: true parece estar certo
      *
      const productMetaData = await Product.findAndCountAll({
        where: whereProduct,
        limit: size,
        offset: (page - 1) * size,
      });
       */
      const products = await Product.findAndCountAll({
        where: whereProduct,
        include: [
          {
            model: Image,
            as: "Imagem",
            required: false,
          },
          {
            model: Publication,
            as: "Publicacao",
            required: publication_required,
            where: publication_query,
            include: [
              {
                model: Channel,
                as: "Canal",
                required: false,
                attributes: {
                  exclude: ["TokenFixo", "TokenDinamico", "DescricaoComposta"],
                },
              },
            ],
          },
          { model: Category, as: "Categoria", where: categoryWhere },
          {
            model: GoogleProduct,
            as: "GoogleProduct",
            required: requiredGoogle,
            attributes: { exclude: ["Sku"] },
          },
          {
            model: Url,
            as: "Url",
            // busca não pode ter url required: true pq
            // produtos não publicados ainda não tem url
            required: false,
            ...(query.urlPath ? { where: { url: { [Op.like]: "%" + query.urlPath + "%" } } } : {}),
          },
          {
            model: Price,
            as: "Preco",
            required: false,
            attributes: { exclude: ["idCanal"] },
            include: [
              {
                model: Channel,
                as: "Canal",
                required: false,
                attributes: {
                  exclude: ["TokenFixo", "TokenDinamico", "DescricaoComposta"],
                },
              },
            ],
          },
        ],
        distinct: true,
        order,
        limit: size,
        offset: (page - 1) * size,
        //logging: true,
      });

      response(res, 200, "OK", {
        product: products.rows,
        total: products.count,
        limit: size,
        actualPage: page,
        totalPages: Math.ceil(products.count / size),
      });
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default Products;
