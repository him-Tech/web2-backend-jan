import passport from "passport";
import { getUserRepository, UserRepository } from "../db/";
import { User, UserId } from "../model";

const userRepository: UserRepository = getUserRepository();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

// id passed to deserializeUser is the id returned from serializeUser
passport.deserializeUser(async (id, done) => {
  try {
    const user: User | null = await userRepository.getById(id as UserId);
    if (!user) {
      return user ? done(null, user) : done(new Error("User Not Found"));
    }
    done(null, user); // user object attaches to the request as req.user
  } catch (err) {
    done(err, null);
  }
});

export default passport;
