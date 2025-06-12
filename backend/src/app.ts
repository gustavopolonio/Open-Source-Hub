import { env } from "./env";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { verifyJwt } from "./middlewares/verify-jwt";
import { usersRoutes } from "./routes/usersRoutes";
import { githubRoutes } from "./routes/githubRoutes";
import { getPublicProjects, projectsRoutes } from "./routes/projectsRoutes";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: env.FRONTEND_BASE_URL,
    credentials: true,
  })
);

app.use("/", usersRoutes);
app.use("/github", verifyJwt, githubRoutes);

app.get("/projects", getPublicProjects);
app.use("/projects", verifyJwt, projectsRoutes);

app.listen(env.PORT, () => {
  console.log(`App listening on port: ${env.PORT}`);
});
