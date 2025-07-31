import { Request, Response } from "express";
import z from "zod";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { env } from "@/env";
import {
  authenticateWithOauth,
  encryptSymmetric,
  generateGitHubAccessToken,
  generateRandomPassword,
  getGitHubUserInfo,
} from "@/utils";
import { JwtPayload } from "@/@types/auth";

export async function authenticateOrRegister(
  req: Request,
  res: Response
): Promise<void> {
  const authenticateQuerySchema = z.object({
    code: z.string(),
    state: z.string(),
  });

  const { code, state } = authenticateQuerySchema.parse(req.query);
  console.log("IP from request:", req.ip);
  const oauthStateSchema = z.object({
    redirectTo: z.string().startsWith("/"),
    csrfToken: z.string().uuid(),
  });

  const { csrfToken, redirectTo } = oauthStateSchema.parse(
    JSON.parse(atob(decodeURIComponent(state)))
  );

  try {
    const { access_token: accessToken } = await generateGitHubAccessToken(code);

    if (!accessToken) {
      res.status(400).send({ message: "Access token not received" });
      return;
    }

    const {
      id: gitHubId,
      email: gitHubEmail,
      name: gitHubName,
    } = await getGitHubUserInfo(accessToken);

    if (!gitHubEmail) {
      res.status(400).send({ message: "GitHub email not received" });
      return;
    }

    const { ciphertext, iv, tag } = encryptSymmetric(
      env.GITHUB_ACCESS_TOKEN_ENCRYPT_KEY,
      accessToken
    );

    const userOauth = await prisma.oauthAccount.findUnique({
      where: {
        providerUserId: String(gitHubId),
        provider: "GITHUB",
      },
      include: {
        user: true,
      },
    });

    if (!userOauth) {
      // Check if the GitHub email matches a user in `users`
      const user = await prisma.user.findUnique({
        where: {
          email: gitHubEmail,
        },
      });

      if (user) {
        // Link this GitHub account to that `user` (insert into `oauth_accounts`)
        await prisma.oauthAccount.create({
          data: {
            providerUserId: String(gitHubId),
            providerUserAccessTokenEncrypted: ciphertext,
            ivEncrypt: iv,
            tagEncrypt: Buffer.from(tag).toString("base64"),
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        });
      } else {
        // Create a new `user`, then insert into `oauth_accounts`
        const password = generateRandomPassword();

        await prisma.user.create({
          data: {
            email: gitHubEmail,
            passwordHash: password,
            name: gitHubName,
            oauthAccounts: {
              create: [
                {
                  providerUserId: String(gitHubId),
                  providerUserAccessTokenEncrypted: ciphertext,
                  ivEncrypt: iv,
                  tagEncrypt: Buffer.from(tag).toString("base64"),
                },
              ],
            },
          },
        });
      }
    } else {
      // Update provider accessToken on DB
      await prisma.oauthAccount.update({
        where: {
          providerUserId: String(gitHubId),
          provider: "GITHUB",
        },
        data: {
          providerUserAccessTokenEncrypted: ciphertext,
          ivEncrypt: iv,
          tagEncrypt: Buffer.from(tag).toString("base64"),
        },
      });
    }

    const { token, refreshToken } = await authenticateWithOauth(
      "GITHUB",
      String(gitHubId)
    );

    res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        path: "/",
        secure: env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: true,
        maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
      })
      .redirect(
        `${env.FRONTEND_BASE_URL}/auth/callback?token=${token}&oauthCsrf=${csrfToken}&redirectTo=${redirectTo}`
      );
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

export async function refreshToken(req: Request, res: Response) {
  let refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401).send("Access Denied. No refresh token provided.");
    return;
  }

  try {
    const payload = jwt.verify(refreshToken, env.JWT_SECRET) as JwtPayload;

    const token = jwt.sign(
      {
        userId: payload.userId,
      },
      env.JWT_SECRET,
      {
        expiresIn: 60 * 10, // 10 minutes
      }
    );

    refreshToken = jwt.sign(
      {
        userId: payload.userId,
      },
      env.JWT_SECRET,
      {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
      }
    );

    res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        path: "/",
        secure: env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: true,
        maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
      })
      .json({ token });
    return;
  } catch (error) {
    res.status(400).send(`Invalid refresh token. ${error}`);
    return;
  }
}

export async function getAuthenticatedUser(req: Request, res: Response) {
  const userId = Number(req.user.userId);

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      omit: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ user });
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

export async function updateAuthenticatedUser(req: Request, res: Response) {
  const updateUserBodySchema = z.object({
    name: z.string().optional(),
    bio: z.string().optional(),
    avatarUrl: z.string().url().optional(),
    skillIds: z.array(z.number()).optional(),
  });

  const { avatarUrl, bio, name, skillIds } = updateUserBodySchema.parse(
    req.body
  );

  const userId = Number(req.user.userId);

  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
        bio,
        avatarUrl,
        ...(skillIds && {
          skills: {
            set: skillIds.map((skillId) => ({ id: skillId })),
          },
        }),
      },
      omit: {
        id: true,
        passwordHash: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({ updatedUser });
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

export async function deleteAuthenticatedUser(req: Request, res: Response) {
  const userId = Number(req.user.userId);

  try {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    res.status(200).json({ message: "User deleted" });
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

export async function getAuthenticatedUserProjects(
  req: Request,
  res: Response
) {
  const getUserProjectsQuerySchema = z.object({
    page: z
      .string()
      .default("1")
      .transform((val) => Number(val)),
    limit: z
      .string()
      .default("10")
      .transform((val) => Number(val)),
  });

  const { limit, page } = getUserProjectsQuerySchema.parse(req.query);

  const userId = Number(req.user.userId);

  try {
    const projects = await prisma.project.findMany({
      where: {
        submittedBy: userId,
      },
      include: {
        author: {
          omit: {
            id: true,
          },
        },
        tags: true,
        _count: {
          select: { votes: true },
        },
        votes: {
          where: { userId },
          select: { userId: true },
        },
      },
      omit: {
        gitHubProjectId: true,
        programmingLanguage: true,
        createdAt: true,
        updatedAt: true,
        gitHubCreatedAt: true,
        submittedBy: true,
      },
      skip: (page - 1) * limit,
      take: limit + 1, // Fetch one extra item to check if there's a next page
    });

    const hasNextPage = projects.length > limit;
    const paginatedProjects = hasNextPage ? projects.slice(0, -1) : projects;

    const projectsWithVotesStatus = paginatedProjects.map(
      ({ votes, _count, ...rest }) => ({
        ...rest,
        votesCount: _count.votes,
        isVoted: votes && votes.length > 0,
      })
    );

    const totalCount = await prisma.project.count({
      where: {
        submittedBy: userId,
      },
    });

    res.status(200).json({
      projects: projectsWithVotesStatus,
      nextPage: hasNextPage ? page + 1 : null,
      totalCount,
    });
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

export async function getAuthenticatedUserBookmarkedProjects(
  req: Request,
  res: Response
) {
  const getUserBookmarksQuerySchema = z.object({
    page: z
      .string()
      .default("1")
      .transform((val) => Number(val)),
    limit: z
      .string()
      .default("10")
      .transform((val) => Number(val)),
  });

  const { limit, page } = getUserBookmarksQuerySchema.parse(req.query);

  const userId = Number(req.user.userId);

  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId,
      },
      include: {
        project: {
          include: {
            tags: true,
            _count: {
              select: { votes: true },
            },
            votes: {
              where: { userId },
              select: { userId: true },
            },
            bookmarks: {
              where: { userId },
              select: { userId: true },
            },
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit + 1, // Fetch one extra item to check if there's a next page
    });

    const hasNextPage = bookmarks.length > limit;
    const paginatedBookmarks = hasNextPage ? bookmarks.slice(0, -1) : bookmarks;
    const paginatedProjects = paginatedBookmarks.map(
      (bookmark) => bookmark.project
    );

    const projectsWithVotesAndBookmarksStatus = paginatedProjects.map(
      ({ bookmarks, votes, _count, ...rest }) => ({
        ...rest,
        isBookmarked: bookmarks && bookmarks.length > 0,
        isVoted: votes && votes.length > 0,
        votesCount: _count.votes,
      })
    );

    const totalCount = await prisma.bookmark.count({
      where: {
        userId,
      },
    });

    res.status(200).json({
      projects: projectsWithVotesAndBookmarksStatus,
      nextPage: hasNextPage ? page + 1 : null,
      totalCount,
    });
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

export async function logout(req: Request, res: Response) {
  res
    .status(200)
    .clearCookie("refreshToken", {
      path: "/",
      secure: env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: true,
    })
    .json({ message: "Logged out" });
  return;
}
