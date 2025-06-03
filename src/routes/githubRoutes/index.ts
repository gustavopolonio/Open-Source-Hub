import { Router, Request, Response } from "express";
import axios from "axios";
import { decryptSymmetric } from "../../utils";
import { env } from "@/env";
import { GitHubRepo } from "@/@types/github";
import { prisma } from "@/lib/prisma";

export const githubRoutes = Router();

githubRoutes.get("/user/repos", async (req: Request, res: Response) => {
  const { userId } = req.user;

  try {
    const userOauth = await prisma.oauthAccount.findUnique({
      where: {
        provider_userId: {
          provider: "GITHUB",
          userId,
        },
      },
    });

    if (!userOauth) {
      res.status(400).send({ message: "User not found" });
      return;
    }

    const gitHubAccessToken = decryptSymmetric(
      env.GITHUB_ACCESS_TOKEN_ENCRYPT_KEY,
      userOauth.providerUserAccessTokenEncrypted,
      userOauth.ivEncrypt,
      userOauth.tagEncrypt
    );

    const { data: gitHubRepositories } = await axios.get<GitHubRepo[]>(
      `${env.GITHUB_BASE_URL}/user/repos`,
      {
        headers: {
          Authorization: `Bearer ${gitHubAccessToken}`,
        },
      }
    );

    res.status(200).json({ gitHubRepositories });
    return;
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send({ message: error });
      return;
    }
    res.status(500).send({ message: "Unknown error" });
    return;
  }
});
