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
      return next();
    }

    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      req.user = {
        userId: payload.userId,
      };
      return next();
    } catch {
      res.status(401).json({ error: "Invalid token" });
    }
  } else {
    req.user = {
      userId: undefined,
    };
  }

  return next();
}
