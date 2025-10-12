import { Router } from "express";
import {
  checkAuth,
  loginUser,
  logoutUser,
  registerUser,
  uploadProfilePic,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/signup").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);

router.route("/update-profile").put(verifyJWT, uploadProfilePic);
router.route("/check").get(verifyJWT, checkAuth);


export default router;
