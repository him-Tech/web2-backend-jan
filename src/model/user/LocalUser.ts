export class LocalUser {
  name: string | null;
  email: string;
  isEmailVerified: boolean;
  hashedPassword: string;

  constructor(
    name: string | null,
    email: string,
    isEmailVerified: boolean,
    hashedPassword: string,
  ) {
    this.name = name;
    this.email = email;
    this.isEmailVerified = isEmailVerified;
    this.hashedPassword = hashedPassword;
  }

  static fromRaw(row: any): LocalUser | Error {
    if (!row.email || typeof row.email !== "string") {
      return new Error("Invalid raw: email is missing or not a string");
    }
    if (!row.hashed_password || typeof row.hashed_password !== "string") {
      return new Error(
        "Invalid raw: hashed_password is missing or not a string",
      );
    }
    if (typeof row.is_email_verified !== "boolean") {
      return new Error(
        `Invalid raw: is_email_verified is missing or not a boolean. Received: ${JSON.stringify(row, null, 2)}`,
      );
    }
    return new LocalUser(
      row.name ? row.name : null,
      row.email,
      row.is_email_verified,
      row.hashed_password,
    );
  }
}
