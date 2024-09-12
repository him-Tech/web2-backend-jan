import { Router } from "express";
import passport from "passport";
import { AuthController } from "../../controllers/auth.controllers";
import { checkSchema } from "express-validator";
import { createUserValidationSchema } from "../../validation/validationSchemas";

const router = Router();

router.get("/status", AuthController.status);

router.post(
  "/register",
  checkSchema(createUserValidationSchema),
  AuthController.register,
);

router.post("/login", passport.authenticate("local"), AuthController.login);

// router.post('/send-verification-email', auth(), AuthController.sendVerificationEmail);

// http://localhost:3000/api/v1/auth/login/email
// @ts-ignore
router.post('/login/email', passport.authenticate('magiclink', { action : 'requestToken' }), function(req, res, next) {
    res.sendStatus(200);
});

// http://localhost:3000/api/v1/auth/login/email/verify
// @ts-ignore
router.get('/login/email/verify', passport.authenticate('magiclink', { action : 'acceptToken' }), function(req, res, next) {
    res.sendStatus(200);
});

router.post("/logout", AuthController.logout);

export default router;
