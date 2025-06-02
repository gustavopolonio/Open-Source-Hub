import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/env';

export function verifyJwt(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      jwt.verify(token, env.JWT_SECRET);
      next();
    } catch {
      res.status(401).json({ error: "Invalid token" });
    }
  } else {
    res.status(401).json({ error: "Missing token" });
  }
}
