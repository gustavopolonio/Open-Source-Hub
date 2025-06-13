import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "@/@types/auth";
import { env } from "@/env";

export function optionalVerifyJwt(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    if (!token) {
      req.user = {
        userId: undefined,
      };
      next();
    }

    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      req.user = {
        userId: payload.userId,
      };
      next();
    } catch {
      req.user = {
        userId: undefined,
      };
    }
  } else {
    req.user = {
      userId: undefined,
    };
  }

  next();
}
