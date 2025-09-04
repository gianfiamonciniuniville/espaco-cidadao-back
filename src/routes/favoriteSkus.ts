import { Router } from "express";
import FavoriteSkus from "../services/product/favoriteSkus";

const router = Router();

const favoriteSkus = new FavoriteSkus();

router.get("/:sku", favoriteSkus.findFavoriteBySku);
router.delete("/:sku", favoriteSkus.deleteFavorite);
router.post("/", favoriteSkus.crateFavorite);
router.get("/", favoriteSkus.findAllFavorites);

export default router;
