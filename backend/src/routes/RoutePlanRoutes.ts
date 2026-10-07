import { Router } from "express";
import { routePlanController } from "../controllers/RoutePlanController";

const router = Router();
router.get("/", routePlanController.list);
router.get("/:id", routePlanController.detail);
router.post("/", routePlanController.create);
router.patch("/:id", routePlanController.resave);

export default router;
