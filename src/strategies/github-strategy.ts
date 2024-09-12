import passport from "passport";
import { Strategy } from "passport-github";
import { getUserRepository, UserRepository } from "../db/";
import { Provider, ThirdPartyUser, ThirdPartyUserId } from "../model";

if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
  throw new Error("GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be set");
}
const repo: UserRepository = getUserRepository();

passport.use(
  <passport.Strategy>new Strategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      callbackURL: "/api/v1/oauth2/redirect/github",
      scope: [""],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const findUser = await repo.findByThirdPartyId(
          new ThirdPartyUserId(profile.id),
          Provider.Github,
        );
        if (!findUser) {
          const user = ThirdPartyUser.fromJson(profile);
          if (user instanceof Error) {
            return done(user);
          }
          const newSavedUser = await repo.insertGithub(user);
          return done(null, newSavedUser);
        }
        return done(null, findUser);
      } catch (err) {
        return done(err);
      }
    },
  ),
);
