import { Router } from "express";
import RulesService from "../services/salesRulesCoupons/salesRules";
import { checkToken } from "../middlewares/checkToken";
import { Actions, actionsChecker } from "../middlewares/actionsChecker";

const router = Router();
const service = new RulesService();

router.get("/", service.findAllRules);
router.get("/list-sale-rule/:ruleId", service.findSaleRuleById);
router.get("/active", service.findAllActiveRules);
router.get("/inactive", service.findAllInactiveRules);
router.get("/status", service.findSaleRuleByStatus);
router.get(
  "/actives",
  checkToken,
  actionsChecker(Actions.COUPONS_VIEW),
  service.getActivesCoupons.bind(service),
);
router.get(
  "/inactives",
  checkToken,
  actionsChecker(Actions.COUPONS_VIEW),
  service.getInactivesCoupons.bind(service),
);
router.post(
  "/",
  checkToken,
  actionsChecker(Actions.COUPONS_CREATE),
  service.createCoupon.bind(service),
);
router.put(
  "/:couponId",
  checkToken,
  actionsChecker(Actions.COUPONS_UPDATE),
  service.editCoupon.bind(service),
);
router.delete(
  "/:couponId",
  checkToken,
  actionsChecker(Actions.COUPONS_DELETE),
  service.deleteCoupon.bind(service),
);

router.post("/create-sale-rule", checkToken, service.new);
router.put("/update-sale-rule/:ruleId", checkToken, service.update);
router.put("/activate-rule/:ruleId", checkToken, service.activate);
router.put("/disable-rule/:ruleId", checkToken, service.disable);
router.delete("/delete-sale-rule/:ruleId", checkToken, service.delete);

export default router;
