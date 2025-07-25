import { Request, Response } from "express";
import z from "zod";
import axios from "axios";
import { prisma } from "@/lib/prisma";
import { Prisma } from "generated/prisma";
import { GitHubRepo } from "@/@types/github";
import { env } from "@/env";

export async function getPublicProjects(req: Request, res: Response) {
  const { userId } = req.user;
  const includeBookmarks = userId !== undefined;
  const includeIsVoted = userId !== undefined;

  const sortByOptions = [
    "votes",
    "stars",
    "github_created_at_desc",
    "github_created_at_asc",
  ] as const;

  const getProjectsQuerySchema = z.object({
    search: z.string().toLowerCase().optional(),
    language: z.string().toLowerCase().optional(),
    sort: z.enum(sortByOptions).optional(),
    tagIds: z
      .string()
      .transform((val) =>
        val
          .split(",")
          .map((tag) => Number(tag.trim()))
          .filter((tag) => !isNaN(tag))
      )
      .optional(),
    page: z
      .string()
      .default("1")
      .transform((val) => Number(val)),
    limit: z
      .string()
      .default("10")
      .transform((val) => Number(val)),
  });

  const { search, language, sort, tagIds, page, limit } =
    getProjectsQuerySchema.parse(req.query);

  function orderProjectsBy(): Prisma.ProjectOrderByWithRelationInput {
    switch (sort) {
      case "votes":
        return { votes: { _count: "desc" } }; // Most voted
      case "stars":
        return { gitHubStars: "desc" }; // Most GitHub stars
      case "github_created_at_desc":
        return { gitHubCreatedAt: "desc" }; // Newest first
      case "github_created_at_asc":
        return { gitHubCreatedAt: "asc" }; // Oldest first
      default:
        return { votes: { _count: "desc" } }; // Most voted
    }
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        AND: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          { programmingLanguage: language },
          tagIds
            ? {
                tags: {
                  some: {
                    id: {
                      in: tagIds,
                    },
                  },
                },
              }
            : {},
        ],
      },
      include: {
        tags: true,
        _count: {
          select: { votes: true },
        },
        ...(includeBookmarks && {
          bookmarks: {
            where: { userId },
            select: { userId: true },
          },
        }),
        ...(includeIsVoted && {
          votes: {
            where: { userId },
            select: { userId: true },
          },
        }),
      },
      orderBy: orderProjectsBy(),
      skip: (page - 1) * limit,
      take: limit + 1, // Fetch one extra item to check if there's a next page
    });

    const hasNextPage = projects.length > limit;
    const paginatedProjects = hasNextPage ? projects.slice(0, -1) : projects;

    const projectsWithVotesAndBookmarksStatus = paginatedProjects.map(
      ({ bookmarks, votes, _count, ...rest }) => ({
        ...rest,
        votesCount: _count.votes,
        isBookmarked: bookmarks && bookmarks.length > 0,
        isVoted: votes && votes.length > 0,
      })
    );

    const totalCount = await prisma.project.count({
      where: {
        AND: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          { programmingLanguage: language },
          tagIds
            ? {
                tags: {
                  some: {
                    id: {
                      in: tagIds,
                    },
                  },
                },
              }
            : {},
        ],
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

export async function createProject(req: Request, res: Response) {
  const createProjectBodySchema = z.object({
    repoUrl: z.string().url(),
    tagIds: z.array(z.number()),
  });

  const { repoUrl, tagIds } = createProjectBodySchema.parse(req.body);

  const userId = Number(req.user.userId);

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
        repoUrl: repoUrl,
        submittedBy: userId,
        avatarUrl: gitHubRepository.owner.avatar_url,
        description: gitHubRepository.description,
        license: gitHubRepository.license?.name,
        liveLink: gitHubRepository.homepage,
        programmingLanguage: gitHubRepository.language?.toLocaleLowerCase(),
        gitHubCreatedAt: gitHubRepository.created_at,
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
}

export async function updateProject(req: Request, res: Response) {
  const updateProjectParamsSchema = z.object({
    projectId: z.coerce.number(),
  });

  const { projectId } = updateProjectParamsSchema.parse(req.params);

  const updateProjectBodySchema = z.object({
    programmingLanguage: z.string().optional(),
    liveLink: z.string().url().optional(),
    tagIds: z.array(z.number()).optional(),
  });

  const { liveLink, programmingLanguage, tagIds } =
    updateProjectBodySchema.parse(req.body);

  const userId = Number(req.user.userId);

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    if (project.submittedBy !== userId) {
      res
        .status(403)
        .json({ message: "User not authorized to edit this project" });
      return;
    }

    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        liveLink,
        programmingLanguage,
        ...(tagIds && {
          tags: {
            set: tagIds.map((tagId) => ({ id: tagId })),
          },
        }),
      },
      include: {
        tags: true,
      },
      omit: {
        gitHubProjectId: true,
        createdAt: true,
        gitHubCreatedAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({ updatedProject });
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

export async function deleteProject(req: Request, res: Response) {
  const deleteProjectParamsSchema = z.object({
    projectId: z.coerce.number(),
  });

  const { projectId } = deleteProjectParamsSchema.parse(req.params);

  const userId = Number(req.user.userId);

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    if (project.submittedBy !== userId) {
      res
        .status(403)
        .json({ message: "User not authorized to delete this project" });
      return;
    }

    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });

    res.status(200).json({ message: "Project deleted" });
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

export async function bookmarkProject(req: Request, res: Response) {
  const createBookmarkParamsSchema = z.object({
    projectId: z.coerce.number(),
  });

  const { projectId } = createBookmarkParamsSchema.parse(req.params);

  const userId = Number(req.user.userId);

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      res.status(404).send({ message: "Project not found" });
      return;
    }

    await prisma.bookmark.create({
      data: {
        projectId,
        userId,
      },
    });

    res.status(201).json({ message: "Project bookmarked successfully" });
    return;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res
        .status(409)
        .json({ message: "Project already bookmarked by this user" });
    }

    if (error instanceof Error) {
      res.status(400).send({ message: error });
      return;
    }
    res.status(500).send({ message: "Unknown error" });
    return;
  }
}

export async function unbookmarkProject(req: Request, res: Response) {
  const deleteBookmarkParamsSchema = z.object({
    projectId: z.coerce.number(),
  });

  const { projectId } = deleteBookmarkParamsSchema.parse(req.params);

  const userId = Number(req.user.userId);

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      res.status(404).send({ message: "Project not found" });
      return;
    }

    await prisma.bookmark.delete({
      where: {
        userId_projectId: { userId, projectId },
      },
    });

    res.status(200).json({ message: "Project bookmark removed" });
    return;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res
        .status(409)
        .json({ message: "Project is not bookmarked by this user" });
    }

    if (error instanceof Error) {
      res.status(400).send({ message: error });
      return;
    }
    res.status(500).send({ message: "Unknown error" });
    return;
  }
}

export async function voteOnProject(req: Request, res: Response) {
  const createVoteParamsSchema = z.object({
    projectId: z.coerce.number(),
  });

  const { projectId } = createVoteParamsSchema.parse(req.params);

  const userId = Number(req.user.userId);

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      res.status(404).send({ message: "Project not found" });
      return;
    }

    await prisma.vote.create({
      data: {
        projectId,
        userId,
      },
    });

    res.status(201).json({ message: "Project voted successfully" });
    return;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res.status(409).json({ message: "Project already voted by this user" });
    }

    if (error instanceof Error) {
      res.status(400).send({ message: error });
      return;
    }
    res.status(500).send({ message: "Unknown error" });
    return;
  }
}

export async function unvoteOnProject(req: Request, res: Response) {
  const deleteVoteParamsSchema = z.object({
    projectId: z.coerce.number(),
  });

  const { projectId } = deleteVoteParamsSchema.parse(req.params);

  const userId = Number(req.user.userId);

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      res.status(404).send({ message: "Project not found" });
      return;
    }

    await prisma.vote.delete({
      where: {
        userId_projectId: { userId, projectId },
      },
    });

    res.status(200).json({ message: "Project vote removed" });
    return;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(409).json({ message: "Project is not voted by this user" });
    }

    if (error instanceof Error) {
      res.status(400).send({ message: error });
      return;
    }
    res.status(500).send({ message: "Unknown error" });
    return;
  }
}
