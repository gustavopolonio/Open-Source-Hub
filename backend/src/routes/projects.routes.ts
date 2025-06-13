import { Router } from "express";
import { verifyJwt } from "@/middlewares/verify-jwt";
import { optionalVerifyJwt } from "@/middlewares/optional-verify-jwt";
import {
  bookmarkProject,
  createProject,
  deleteProject,
  getPublicProjects,
  unbookmarkProject,
  unvoteOnProject,
  updateProject,
  voteOnProject,
} from "@/controllers/projects.controller";

const router = Router();

router.get("/", optionalVerifyJwt, getPublicProjects);

router.post("/", verifyJwt, createProject);

router.patch("/:projectId", verifyJwt, updateProject);

router.delete("/:projectId", verifyJwt, deleteProject);

router.post("/:projectId/bookmark", verifyJwt, bookmarkProject);

router.delete("/:projectId/bookmark", verifyJwt, unbookmarkProject);

router.post("/:projectId/vote", verifyJwt, voteOnProject);

router.delete("/:projectId/vote", verifyJwt, unvoteOnProject);

export { router as projectsRoutes };
