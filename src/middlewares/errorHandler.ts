import { NextFunction, Request, Response } from "express";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const errorStatus = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(errorStatus);

  const responseBody = {
    message: err.message,
    stack: err.stack, // TODO: not for production
  };
  console.log("Catch error: ", err.message);
  console.error(err.stack); // TODO: log

  res.send("Something went wrong!");
}
