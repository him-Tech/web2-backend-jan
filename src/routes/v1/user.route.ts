import { Router } from "express";
import { UserController } from "../../controllers/user.controllers";

const router = Router();

router.get("/", UserController.getUsers);

router.get("/:id", UserController.getUserById);

export default router;
