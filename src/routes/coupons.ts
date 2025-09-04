import { Router } from "express";
import CouponsService from "../services/salesRulesCoupons/coupons";
import { checkToken } from "../middlewares/checkToken";

const router = Router();
const service = new CouponsService();

router.get("/list-coupons", service.findCouponById);
router.post("/create-coupon", checkToken, service.new);
router.post("/auto-generate-coupons", checkToken, service.couponGenerator);
router.put("/update-coupon/:couponId", checkToken, service.update);
router.delete("/delete-coupon/:couponId", checkToken, service.delete);

export default router;
