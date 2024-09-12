import passport from "passport";
import { getUserRepository, UserRepository } from "../db/";
import { MailService } from "../services/mail.service";

const MagicLinkStrategy = require("passport-magic-link").Strategy;
const repo: UserRepository = getUserRepository();

passport.use(
  new MagicLinkStrategy(
    {
      secret: "keyboard cat", // TODO: change this
      userFields: ["email"],
      tokenField: "token",
      verifyUserAfterToken: true,
    },
    // @ts-ignore
    async (user, token) => {
      await new MailService().sendVerificationEmail(user.email, token);
    },
    // @ts-ignore
    async (user) => {
      console.log("hello", user);
      return await repo.validateEmail(user.email);
    },
  ),
);
