import type { NextFunction, Request, Response } from "express";
import { routePlanService } from "../services/RoutePlanService";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

const wrapRiskFailure = (err: unknown) =>
  err instanceof Error && "code" in err
    ? err
    : Object.assign(new Error(ERROR_MESSAGES.ROUTE_RISK_FAILED), { status: 500, code: ERROR_CODES.ROUTE_RISK_FAILED });

export const routePlanController = {
  list: (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(routePlanService.list());
    } catch (err) {
      next(wrapRiskFailure(err));
    }
  },
  create: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(routePlanService.create(req.body));
    } catch (err) {
      next(wrapRiskFailure(err));
    }
  }
};
