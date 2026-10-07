import type { Request, Response } from "express";
import { routePlanService } from "../services/RoutePlanService";
import { ERROR_CODES } from "../constants/errorCodes";

const parseId = (req: Request): number => Number(req.params.id);

export const routePlanController = {
  list: (_req: Request, res: Response) => res.json(routePlanService.list()),
  detail: (req: Request, res: Response, next: (err: unknown) => void) => {
    try {
      res.json(routePlanService.detail(parseId(req)));
    } catch (error) {
      next(error);
    }
  },
  create: (req: Request, res: Response, next: (err: unknown) => void) => {
    try {
      // controller 层再包一层：忽略调用方手填的 risk_level，风险一律服务端算
      const { risk_level, risk_factors, ...payload } = req.body ?? {};
      if (risk_level !== undefined || risk_factors !== undefined) {
        console.warn("route plan risk fields are server-computed and were ignored");
      }
      res.status(201).json(routePlanService.create(payload));
    } catch (error) {
      (error as Error & { code?: string }).code = (error as Error & { code?: string }).code ?? ERROR_CODES.VALIDATION_FAILED;
      next(error);
    }
  },
  resave: (req: Request, res: Response, next: (err: unknown) => void) => {
    try {
      res.json(routePlanService.resave(parseId(req), req.body ?? {}));
    } catch (error) {
      next(error);
    }
  }
};
