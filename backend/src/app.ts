import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { env } from "./env";
import { usersRoutes } from "./routes/users.routes";
import { githubRoutes } from "./routes/github.routes";
import { projectsRoutes } from "./routes/projects.routes";
import { apiRoutes } from "./routes/api.routes";

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
app.use("/github", githubRoutes);
app.use("/projects", projectsRoutes);
app.use("/api", apiRoutes);

app.listen(env.PORT, () => {
  console.log(`App listening on port: ${env.PORT}`);
});
