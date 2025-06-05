import { Router, Request, Response } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { env } from "@/env";
import { prisma } from "@/lib/prisma";
import { authenticateWithOauth } from "@/controllers/users/authenticate";
import { JwtPayload } from "@/@types/auth";
import { verifyJwt } from "@/middlewares/verify-jwt";
import {
  encryptSymmetric,
  generateGitHubAccessToken,
  generateRandomPassword,
  getGitHubUserInfo,
} from "../../utils";

export const usersRoutes = Router();

usersRoutes.get(
  "/github/callback",
  async (req: Request, res: Response): Promise<void> => {
    const authenticateQuerySchema = z.object({
      code: z.string(),
    });

    const { code } = authenticateQuerySchema.parse(req.query);

    try {
      const { access_token: accessToken } = await generateGitHubAccessToken(
        code
      );

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

        const { ciphertext, iv, tag } = encryptSymmetric(
          env.GITHUB_ACCESS_TOKEN_ENCRYPT_KEY,
          accessToken
        );

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
      }

      const { token, refreshToken } = await authenticateWithOauth(
        "GITHUB",
        String(gitHubId)
      );

      res
        .status(200)
        .cookie("refreshToken", refreshToken, {
          path: "/",
          secure: true,
          httpOnly: true,
          sameSite: true,
        })
        .json({ token });
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
);

usersRoutes.patch("/token/refresh", async (req: Request, res: Response) => {
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
        secure: true,
        httpOnly: true,
        sameSite: true,
      })
      .json({ token });
    return;
  } catch (error) {
    res.status(400).send(`Invalid refresh token. ${error}`);
    return;
  }
});

usersRoutes.patch(
  "/users/me",
  verifyJwt,
  async (req: Request, res: Response) => {
    const updateUserBodySchema = z.object({
      name: z.string().optional(),
      bio: z.string().optional(),
      avatarUrl: z.string().url().optional(),
      skillIds: z.array(z.number()).optional(),
    });

    const { avatarUrl, bio, name, skillIds } = updateUserBodySchema.parse(
      req.body
    );

    const { userId } = req.user;

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
);

usersRoutes.get(
  "/users/me/projects",
  verifyJwt,
  async (req: Request, res: Response) => {
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

    const { userId } = req.user;

    try {
      const projects = await prisma.project.findMany({
        where: {
          submittedBy: userId,
        },
        include: { author: true },
        skip: (page - 1) * limit,
        take: limit + 1, // Fetch one extra item to check if there's a next page
      });

      const hasNextPage = projects.length > limit;
      const paginatedProjects = hasNextPage ? projects.slice(0, -1) : projects;

      res
        .status(200)
        .json({
          projects: paginatedProjects,
          nextPage: hasNextPage ? page + 1 : null,
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
);

// usersRoutes.post('/users', (req, res) => {
//   res.send('Create user - register');
// });

// usersRoutes.post('/sessions', (req, res) => {});
