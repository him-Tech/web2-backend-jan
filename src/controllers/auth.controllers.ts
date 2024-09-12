import { ValidationError, validationResult } from "express-validator";
import { Request, Response } from "express";
import { CreateLocalUserDto } from "../dtos";
import { CreateUserQueryParams } from "../types/query-params";
import { getUserRepository } from "../db/";
import { User } from "../model";
import { StatusCodes } from "http-status-codes";

const userRepo = getUserRepository();

export class AuthController {
  static async status(request: Request, response: Response) {
    return request.user
      ? response.send(request.user)
      : response.sendStatus(StatusCodes.UNAUTHORIZED);
  }

  static async register(
    request: Request<{}, {}, CreateLocalUserDto, CreateUserQueryParams>,
    response: Response<User | ValidationError[]>,
  ) {
    const result = validationResult(request);
    if (!result.isEmpty())
      return response.status(StatusCodes.BAD_REQUEST).send(result.array());

    try {
      const savedUser = await userRepo.insertLocal(request.body);
      return response.status(StatusCodes.CREATED).send(savedUser);
    } catch (err) {
      console.log("Error: ", err);
      return response.sendStatus(StatusCodes.BAD_REQUEST);
    }
  }

  static async login(request: Request, response: Response) {
    response.sendStatus(StatusCodes.OK);
  }

  static async logout(request: Request, response: Response) {
    if (!request.user) return response.send(StatusCodes.OK); // .redirect("/"); ?
    request.logout((err) => {
      if (err) return response.sendStatus(StatusCodes.BAD_REQUEST);
      response.send(StatusCodes.OK); // .redirect("/"); ?
    });
  }
}
