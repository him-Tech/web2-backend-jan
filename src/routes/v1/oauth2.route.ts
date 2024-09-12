import { Router } from "express";
import passport from "passport";
import { StatusCodes } from "http-status-codes";

const router = Router();

router.get("/github", passport.authenticate("github"));

// http://localhost:3000/api/v1/oauth2/github
// http://localhost:3000/api/v1/oauth2/redirect/github
// http://localhost:3000/api/v1/oauth2/status

router.get(
  "/redirect/github",
  passport.authenticate("github", {
    successRedirect: "/api/v1/oauth2/status",
    failureRedirect: "/api/v1/oauth2/status",
  }),
  (request, response) => {
    return request.user
      ? response.send(request.user)
      : response.sendStatus(StatusCodes.UNAUTHORIZED);
  },
);

router.get("/status", (request, response) => {
  return request.user
    ? response.send(request.user)
    : response.sendStatus(StatusCodes.UNAUTHORIZED);
});

export default router;
