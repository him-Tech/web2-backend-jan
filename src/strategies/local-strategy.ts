import passport from "passport";
import { Strategy } from "passport-local";

import { encrypt } from "./helpers";
import { getUserRepository, UserRepository } from "../db/";
import { LocalUser, User } from "../model";

const repo: UserRepository = getUserRepository();

passport.use(
  // email field in the request body and send that as argument for the username
  new Strategy({ usernameField: "email" }, async (username, password, done) => {
    try {
      const user: User | null = await repo.findOne(username);
      if (!user) return done(new Error("User not found"));
      else if (!(user.data instanceof LocalUser)) {
        return done(new Error("User already registered with a third party"));
      } else if (!encrypt.comparePassword(password, user.data.hashedPassword)) {
        return done(new Error("Bad Credentials"));
      } else done(null, user); // user object attaches to the request as req.user
    } catch (err) {
      done(err);
    }
  }),
);
