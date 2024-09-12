import { LocalUser } from "./LocalUser";
import { ThirdPartyUser } from "./ThirdPartyUser";
import { Owner } from "../Owner";

export class UserId {
  id: number;

  constructor(id: number) {
    this.id = id;
  }
}

export enum UserRole {
  user = "user",
}

export class User implements Express.User {
  id: UserId;
  data: LocalUser | ThirdPartyUser;
  role: UserRole;

  constructor(id: UserId, data: LocalUser | ThirdPartyUser, role: UserRole) {
    this.id = id;
    this.data = data;
    this.role = role;
  }

  // TODO: refactor the owner parameter. Just a hack for the moment
  static fromRaw(row: any, owner: Owner | null = null): User | Error {
    if (!row.role || typeof row.role !== "string") {
      return new Error("Invalid raw: role is missing or not a string");
    }

    var user: LocalUser | ThirdPartyUser | Error;
    // Check if the row represents a local user
    if (row.id && typeof row.id === "number" && row.hashed_password) {
      user = LocalUser.fromRaw(row);
    } else if (row.provider && !row.hashed_password) {
      user = ThirdPartyUser.fromRaw(row, owner);
    } else {
      return new Error("Invalid raw: Unable to determine user type");
    }

    if (user instanceof Error) {
      return user;
    } else {
      return new User(new UserId(row.id), user, row.role);
    }
  }
}
