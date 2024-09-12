import express from "express";
import authRoute from "./auth.route";
import oauth2Route from "./oauth2.route";
import userRoute from "./user.route";

const router = express.Router();

router.use("/auth", authRoute);
router.use("/oauth2", oauth2Route);
router.use("/users", userRoute);

export default router;
