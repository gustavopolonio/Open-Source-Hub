import { Router, Request, Response } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { env } from "@/env";
import { prisma } from "@/lib/prisma";
import { authenticateWithOauth } from "@/controllers/users/authenticate";
import { JwtPayload } from "@/@types/auth";
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

// usersRoutes.post('/users', (req, res) => {
//   res.send('Create user - register');
// });

// usersRoutes.post('/sessions', (req, res) => {});
