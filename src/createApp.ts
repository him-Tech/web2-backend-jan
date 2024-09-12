import express from "express";

import session from "express-session";
import passport from "passport";
import v1Routes from "./routes/v1";

import { errorHandler } from "./middlewares/errorHandler";
import "./strategies";
import { getPool } from "./dbPool";

export function createApp() {
  const app = express();
  const pgSession = require("connect-pg-simple")(session);

  app.use(express.json());
  app.use(
    session({
      secret: "anson the dev", // TODO: process.env.FOO_COOKIE_SECRET
      saveUninitialized: true,
      resave: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      },
      store: new pgSession({
        pool: getPool(),
        tableName: "user_session",
      }),
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use("/api/v1", v1Routes);

  app.use(errorHandler);

  return app;
}
