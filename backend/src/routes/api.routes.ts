import { Router } from "express";
import { getTags } from "@/controllers/api.controller";

const router = Router();

router.get("/tags", getTags);

export { router as apiRoutes };
