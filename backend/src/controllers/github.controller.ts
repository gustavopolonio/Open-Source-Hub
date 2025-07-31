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

    function parseData(
      data:
        | GitHubRepo[]
        | {
            incomplete_results?: unknown;
            repository_selection?: unknown;
            total_count?: number;
            [key: string]: unknown;
          }
    ) {
      if (Array.isArray(data)) {
        return data;
      }

      // Some endpoints respond with 204 No Content instead of empty array when there is no data. In that case, return an empty array.
      if (!data) {
        return [];
      }

      // Otherwise, the array of items that we want is in an object
      // Delete keys that don't include the array of items
      const copy = { ...data };
      delete copy.incomplete_results;
      delete copy.repository_selection;
      delete copy.total_count;

      // Pull out the array of items
      const namespaceKey = Object.keys(copy)[0];
      const items = copy[namespaceKey];

      if (Array.isArray(items)) {
        return items as GitHubRepo[];
      }

      return [];
    }

    async function getPaginatedReposData(url: string): Promise<GitHubRepo[]> {
      const nextPattern = /(?<=<)([\S]*)(?=>; rel="Next")/i;
      let pagesRemaining = true;
      let data: GitHubRepo[] = [];

      while (pagesRemaining) {
        const response = await axios.get<GitHubRepo[]>(`${url}`, {
          headers: {
            Authorization: `Bearer ${gitHubAccessToken}`,
          },
          params: {
            per_page: 100,
          },
        });

        const parsedData = parseData(response.data);
        data = [...data, ...parsedData];

        const linkHeader = response.headers.link;
        pagesRemaining = linkHeader && linkHeader.includes(`rel="next"`);

        if (pagesRemaining) {
          url = linkHeader.match(nextPattern)[0];
        }
      }

      return data;
    }

    const gitHubRepositories = await getPaginatedReposData(
      `${env.GITHUB_BASE_URL}/user/repos`
    );

    const gitHubRepositoriesMapped = gitHubRepositories.map((repo) => ({
      name: repo.name,
      url: repo.html_url,
    }));

    res.status(200).json({ gitHubRepositories: gitHubRepositoriesMapped });
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
