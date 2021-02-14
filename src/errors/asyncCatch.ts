import { NextFunction, Request, RequestHandler, Response } from "express";

export const catchErrors = (
  requestHandler: RequestHandler
): RequestHandler => async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  console.log(next);
  try {
    return await requestHandler(req, res, next);
  } catch (err) {
    next(err);
  }
};
