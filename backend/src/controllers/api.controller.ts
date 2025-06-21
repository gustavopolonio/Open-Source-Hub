import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";

export async function getTags(req: Request, res: Response) {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
    });

    res.status(200).json({ tags });
    return;
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send({ message: error });
      return;
    }
    res.status(500).send({ message: "Unknown error" });
    return;
  }
}
