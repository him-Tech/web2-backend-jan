import bcrypt from "bcrypt";

// TODO
const saltRounds = 10;
// dotenv.config();
//
// if (!process.env.JWT_SECRET) {
//   throw new Error("No JWT secret string. Set JWT_SECRET environment variable.");
// }
//
// const JWT_SECRET = process.env.JWT_SECRET;

export class encrypt {
  static async hashPassword(password: string) {
    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(password, salt);
  }

  static comparePassword(password: string, hashPassword: string): boolean {
    return bcrypt.compareSync(password, hashPassword);
  }
}
