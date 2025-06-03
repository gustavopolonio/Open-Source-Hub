import { env } from "./env";
import express from "express";
import cookieParser from "cookie-parser";
import { usersRoutes } from "./routes/usersRoutes";
import { verifyJwt } from "./middlewares/verify-jwt";
import { githubRoutes } from "./routes/githubRoutes";

const app = express();
app.use(cookieParser());

app.use("/", usersRoutes);
app.use("/github", verifyJwt, githubRoutes);

app.listen(env.PORT, () => {
  console.log(`App listening on port: ${env.PORT}`);
});
