import { NextFunction, Request, Response } from "express";
import { catchErrors } from "../errors";
import jwt from "jsonwebtoken";
import { User } from "../entities/User";

export const authentication = catchErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;
    console.log(req.cookies);
    if (!token) throw new Error("Unauthenticated");

    const { username }: any = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ username });

    if (!user) throw new Error("Unauthenticated");

    res.locals.user = user;

    return next();
  }
);
