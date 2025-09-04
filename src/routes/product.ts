import { Router } from "express";

import BlockService from "../services/product/block";
import BrandService from "../services/product/brand";
import CategoryService from "../services/product/category";
import ChannelService from "../services/product/channel";
import DescriptionService from "../services/product/description";
import DescriptionComposedService from "../services/product/composedDescription";
import ImageService from "../services/product/image";
import ImageKitService from "../services/product/imageKit";
import ModelService from "../services/product/model";
import PriceService from "../services/product/price";
import ProductService from "../services/product/product";
import PublicationService from "../services/product/publication";
import SeoService from "../services/product/seo";
import UrlService from "../services/product/url";

import { Multer } from "../middlewares/multer";
import { uploadImageBrand, uploadImageKit, uploadImageProduct } from "../middlewares/uploadFile";
import publicationActive from "../services/product/publicationActive";

const router = Router();

const productService = new ProductService();
const seoService = new SeoService();
const urlService = new UrlService();
const imageService = new ImageService();
const imageKitService = new ImageKitService();
const modelService = new ModelService();
const brandService = new BrandService();
const channelService = new ChannelService();
const categoryService = new CategoryService();
const descriptionService = new DescriptionService();
const priceService = new PriceService();
const descriptionComposedService = new DescriptionComposedService();
const blockService = new BlockService();
const publicationService = new PublicationService();
const publicationActiveService = new publicationActive();

router.patch("/seo/:id", seoService.updateSeo);
router.delete("/seo/:id", seoService.removeSeo);
router.post("/seo", seoService.newSeo);

router.get("/url/:idProduto", urlService.findAllByProductId);
router.post("/url", urlService.newUrl);
router.patch("/url", urlService.updateUrl);

router.patch("/block/:id", blockService.updateBlock);
router.delete("/block/:id", blockService.removeBlock);
router.post("/block", blockService.newBlock);
router.get("/block", blockService.findAll);

router.patch("/description/:id", descriptionService.updateDescription);
router.delete("/description/:id", descriptionService.removeDescription);
router.post("/description", descriptionService.newDescription);

router.patch("/price/:id", priceService.updatePrice);
router.delete("/price/:id", priceService.removePrice);
router.post("/price", priceService.newPrice);
router.get("/price", priceService.findAllPrice);

router.patch("/publication/:id", publicationService.updatePublication);
router.delete("/publication/:id", publicationService.removePublication);
router.post("/publication", publicationService.newPublication);
router.get("/publication", publicationService.findAll);
router.get("/:idProduto/publication/:idCanal", publicationService.isInPublicationQueue);
router.get("/:idProduto/publication", publicationService.isInPublicationQueueAnyChannel);
router.get("/publication/queue", publicationService.findAllInQueuePagination);
router.put("/publication/active/:idPublicacao", publicationActiveService.updateActiveFlag);

router.patch("/composed-description/:id", descriptionComposedService.updateComposedDescription);
router.delete("/composed-description/:id", descriptionComposedService.removeComposedDescription);
router.post("/composed-description", descriptionComposedService.newComposedDescription);

router.get("/model/:id", modelService.findOne);
router.patch("/model/:id", modelService.updateModel);
router.delete("/model/:id", modelService.removeModel);
router.post("/model", modelService.newModel);
router.get("/model", modelService.findAll);

router.get("/brand/:id", brandService.findOne);
router.delete("/brand/:id", brandService.removeBrand);
router.patch("/brand/:id", Multer.single("banner"), uploadImageBrand, brandService.updateBrand);
router.post("/brand", Multer.single("banner"), uploadImageBrand, brandService.newBrand);
router.get("/brand", brandService.findAll);

router.get("/category/:id", categoryService.findOne);
router.get("/category/:id/products", categoryService.findAllProductsInOne);
router.patch("/category/:id", categoryService.updateCategory);
router.delete("/category/:id", categoryService.removeCategory);
router.delete("/category-product/:id", categoryService.removeCategoryInProduct);
router.put("/category-product/:id", categoryService.newCategoryInProduct);
router.get("/category-product/:idProduto", categoryService.findAllInProduct);
router.post("/category", categoryService.newCategory);
router.get("/category", categoryService.findAll);

router.get("/channel/:id", channelService.findOne);
router.patch("/channel/:id", channelService.updateChannel);
router.delete("/channel/:id", channelService.removeChannel);
router.post("/channel", channelService.newChannel);
router.get("/channel", channelService.findAll);

router.patch("/image/update-list", imageService.updateListImage);
router.post("/image/remove-list", imageService.removeListImage);
// router.patch("/image/:id", Multer.single("Path"), uploadImageProduct, imageService.updateImage);
// router.delete("/image/:id", imageService.removeImage);
router.get("/image/:idModelo", imageService.getRelatedImages);
router.post("/image", Multer.single("Path"), uploadImageProduct, imageService.newImage);

router.get("/imageKit", imageKitService.findAll);
router.get("/imageKit/:idProduto&:quantidade", imageKitService.findByProductId);
router.post("/imageKit", Multer.single("Path"), uploadImageKit, imageKitService.newImageKit);
router.patch("/imageKit/update-list", imageKitService.updateImageKit);
router.post("/imageKit/remove-list", imageKitService.deleteImageKit);
router.get("/imageKit/:idModelo", imageKitService.getRelatedImagesKit);

router.get("/sku/:sku", productService.findOneProductBySku);
router.get("/sku/:sku/pricing", productService.findPricingProduct);
router.get("/:id", productService.findOneProductByPk);
router.get("/:id/prices", productService.getPricesByPk);
router.get("/:id/publications", productService.getPublicationsByPk);
router.patch("/:id", productService.updateProduct);
router.delete("/:id", productService.removeProduct);

router.post("/", productService.createProduct);
router.get("/", productService.findAllProducts);

export default router;
