import { Request, Response } from "express";
import axios from "axios";
import { prisma } from "@/lib/prisma";
import { env } from "@/env";
import { decryptSymmetric } from "@/utils";
import { GitHubRepo } from "@/@types/github";

export async function getAuthenticatedUserGithubRepos(
  req: Request,
  res: Response
) {
  const userId = Number(req.user.userId);

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
}
