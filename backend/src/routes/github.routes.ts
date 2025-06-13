import { Router } from "express";
import { getAuthenticatedUserGithubRepos } from "@/controllers/github.controller";
import { verifyJwt } from "@/middlewares/verify-jwt";

const router = Router();

router.get("/user/repos", verifyJwt, getAuthenticatedUserGithubRepos);

export { router as githubRoutes };
