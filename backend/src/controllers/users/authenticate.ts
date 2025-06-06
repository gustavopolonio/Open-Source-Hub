import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { env } from "@/env";

export async function authenticateWithOauth(
  provider: "GITHUB",
  providerUserId: string
): Promise<{ token: string; refreshToken: string }> {
  const oauthAccount = await prisma.oauthAccount.findUnique({
    where: { providerUserId, provider },
    include: { user: true },
  });

  if (!oauthAccount || !oauthAccount.user) {
    throw new Error("User not found");
  }

  const token = jwt.sign(
    {
      userId: oauthAccount.userId,
    },
    env.JWT_SECRET,
    {
      expiresIn: 60 * 10, // 10 minutes
    }
  );

  const refreshToken = jwt.sign(
    {
      userId: oauthAccount.userId,
    },
    env.JWT_SECRET,
    {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
    }
  );

  return { token, refreshToken };
}
