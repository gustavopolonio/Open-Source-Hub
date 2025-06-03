import { env } from "./env";
import express from "express";
import cookieParser from "cookie-parser";
import { verifyJwt } from "./middlewares/verify-jwt";
import { usersRoutes } from "./routes/usersRoutes";
import { githubRoutes } from "./routes/githubRoutes";
import { projectsRoutes } from "./routes/projectsRoutes";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/", usersRoutes);
app.use("/github", verifyJwt, githubRoutes);
app.use("/projects", verifyJwt, projectsRoutes);

app.listen(env.PORT, () => {
  console.log(`App listening on port: ${env.PORT}`);
});
