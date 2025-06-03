import { Router, Request, Response } from "express";
import z from "zod";
import axios from "axios";
import { prisma } from "@/lib/prisma";
import { GitHubRepo } from "@/@types/github";
import { env } from "@/env";

export const projectsRoutes = Router();

projectsRoutes.post("/", async (req: Request, res: Response) => {
  const createProjectBodySchema = z.object({
    repoUrl: z.string().url(),
    tagIds: z.array(z.number()),
  });

  const { repoUrl, tagIds } = createProjectBodySchema.parse(req.body);

  const { userId } = req.user;
  const [owner, repo] = new URL(repoUrl).pathname.slice(1).split("/");

  try {
    const { data: gitHubRepository } = await axios.get<GitHubRepo>(
      `${env.GITHUB_BASE_URL}/repos/${owner}/${repo}`
    );

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

    if (userOauth.providerUserId !== String(gitHubRepository.owner.id)) {
      res
        .status(400)
        .send({ message: "User is not the owner of repository sent" });
      return;
    }

    const projectAlreadyExists = await prisma.project.findUnique({
      where: {
        gitHubProjectId: gitHubRepository.id,
      },
    });

    if (projectAlreadyExists) {
      res.status(409).send({ message: "Project already exists" });
      return;
    }

    const newProject = await prisma.project.create({
      data: {
        gitHubProjectId: gitHubRepository.id,
        name: gitHubRepository.name,
        gitHubStars: gitHubRepository.stargazers_count,
        repo_url: repoUrl,
        submittedBy: userId,
        avatarUrl: gitHubRepository.owner.avatar_url,
        description: gitHubRepository.description,
        license: gitHubRepository.license?.name,
        liveLink: gitHubRepository.homepage,
        programmingLanguage: gitHubRepository.language,
        tags: {
          connect: tagIds.map((id) => ({ id })),
        },
      },
    });

    res.status(201).json({ newProject });
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
