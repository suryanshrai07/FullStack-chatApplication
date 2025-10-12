import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getUserForSidebar,getMessages,sendMessages } from "../controllers/message.controller.js";

const router = Router();

router.route("/users").get(verifyJWT,getUserForSidebar);
router.route("/send/:id").post(verifyJWT,sendMessages);
router.route("/:id").get(verifyJWT,getMessages);

export default router