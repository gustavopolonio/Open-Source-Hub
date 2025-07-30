import { Router } from "express";
import { verifyJwt } from "@/middlewares/verify-jwt";
import { loginLimiter } from "@/middlewares/rate-limiters";
import {
  authenticateOrRegister,
  deleteAuthenticatedUser,
  getAuthenticatedUser,
  getAuthenticatedUserBookmarkedProjects,
  getAuthenticatedUserProjects,
  logout,
  refreshToken,
  updateAuthenticatedUser,
} from "@/controllers/users.controller";

const router = Router();

router.get("/github/callback", loginLimiter, authenticateOrRegister);

router.patch("/token/refresh", refreshToken);

router.post("/logout", logout);

router.get("/users/me", verifyJwt, getAuthenticatedUser);

router.patch("/users/me", verifyJwt, updateAuthenticatedUser);

router.delete("/users/me", verifyJwt, deleteAuthenticatedUser);

router.get("/users/me/projects", verifyJwt, getAuthenticatedUserProjects);

router.get(
  "/users/me/bookmarks",
  verifyJwt,
  getAuthenticatedUserBookmarkedProjects
);

export { router as usersRoutes };

// usersRoutes.post('/users', (req, res) => {
//   res.send('Create user - register');
// });

// usersRoutes.post('/sessions', (req, res) => {});
