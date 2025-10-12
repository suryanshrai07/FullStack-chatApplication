import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getUserForSidebar,getMessages,sendMessages } from "../controllers/message.controller.js";

const router = Router();

router.route("/users").get(verifyJWT,getUserForSidebar);
router.route("/:id").get(verifyJWT,getMessages);
router.route("/send/:id").post(verifyJWT,sendMessages);
export default router