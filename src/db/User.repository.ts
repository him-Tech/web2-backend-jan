import { Pool } from "pg";
import {
  Owner,
  Provider,
  ThirdPartyUser,
  ThirdPartyUserId,
  User,
  UserId,
} from "../model"; // Adjust the import paths as necessary
import { getPool } from "../dbPool";
import { CreateLocalUserDto } from "../dtos";
import { encrypt } from "../strategies/helpers"; // Adjust the import path as necessary

export function getUserRepository(): UserRepository {
  return new UserRepositoryImpl(getPool());
}

export interface UserRepository {
  insertLocal(user: CreateLocalUserDto): Promise<User>;
  insertGithub(user: ThirdPartyUser): Promise<User>;
  validateEmail(email: string): Promise<User | null>;
  getById(id: UserId): Promise<User | null>;
  getAll(): Promise<User[]>;
  findOne(email: string): Promise<User | null>;
  findByThirdPartyId(
    thirdPartyId: ThirdPartyUserId,
    provider: Provider,
  ): Promise<User | null>;
}

class UserRepositoryImpl implements UserRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  private getOneUser(rows: any[], owner: Owner | null = null): User {
    const user = this.getOptionalUser(rows, owner);
    if (user === null) {
      throw new Error("User not found");
    } else {
      return user;
    }
  }

  private getOptionalUser(
    rows: any[],
    owner: Owner | null = null,
  ): User | null {
    if (rows.length === 0) {
      return null;
    } else if (rows.length > 1) {
      throw new Error("Multiple users found");
    } else {
      const user = User.fromRaw(rows[0], owner);
      if (user instanceof Error) {
        throw user;
      }
      return user;
    }
  }

  private getUserList(rows: any[]): User[] {
    return rows.map((r) => {
      const user = User.fromRaw(r);
      if (user instanceof Error) {
        throw user;
      }
      return user;
    });
  }

  async validateEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(
      `
                UPDATE app_user
                SET is_email_verified = TRUE
                WHERE email = $1
                RETURNING id, name, email, is_email_verified, hashed_password, role
            `,
      [email],
    );

    return this.getOptionalUser(result.rows);
  }

  async getAll(): Promise<User[]> {
    const result = await this.pool.query(
      `
              SELECT
                  au.id,
                  au.name,
                  au.email,
                  au.is_email_verified,
                  au.hashed_password,
                  au.role,
                  au.provider,
                  au.third_party_id,
                  go.github_id,
                  go.github_type,
                  go.github_login,
                  go.github_html_url,
                  go.github_avatar_url
              FROM app_user au
                       LEFT JOIN github_owner go ON au.github_owner_id = go.github_id
          `,
      [],
    );
    return this.getUserList(result.rows);
  }

  async getById(id: UserId): Promise<User | null> {
    const result = await this.pool.query(
      `
              SELECT 
        au.id, 
        au.name, 
        au.email,
        au.is_email_verified,
        au.hashed_password, 
        au.role, 
        au.provider, 
        au.third_party_id,
        go.github_id,
        go.github_type,
        go.github_login,
        go.github_html_url,
        go.github_avatar_url
      FROM app_user au
      LEFT JOIN github_owner go ON au.github_owner_id = go.github_id
      WHERE au.id = $1
            `,
      [id.id],
    );
    return this.getOptionalUser(result.rows);
  }

  async insertLocal(user: CreateLocalUserDto): Promise<User> {
    const client = await this.pool.connect();

    const hashedPassword = await encrypt.hashPassword(user.password);

    try {
      const result = await client.query(
        `
                INSERT INTO app_user (name, email, is_email_verified, hashed_password, role)
                VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, is_email_verified, hashed_password, role
            `,
        [user.name, user.email, false, hashedPassword, "user"], // TODO: set the role
      );

      return this.getOneUser(result.rows);
    } finally {
      client.release();
    }
  }

  async insertGithub(user: ThirdPartyUser): Promise<User> {
    if (user.provider !== Provider.Github) {
      throw new Error("Invalid provider, was expecting Github");
    }

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN"); // Start a transaction

      const owner = user.providerData.owner;

      // Insert or update the Github owner
      const ownerResult = await client.query(
        `
            INSERT INTO github_owner (github_id, github_type, github_login, github_html_url, github_avatar_url)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (github_id) DO UPDATE 
            SET 
                github_type = EXCLUDED.github_type,
                github_login = EXCLUDED.github_login,
                github_html_url = EXCLUDED.github_html_url,
                github_avatar_url = EXCLUDED.github_avatar_url
            RETURNING github_id, github_type, github_login, github_html_url, github_avatar_url
            `,
        [owner.id.id, owner.type, owner.name, owner.htmlUrl, owner.avatarUrl],
      );

      // TODO: refactor
      const githubOwner = Owner.fromBackend(ownerResult.rows[0]);
      if (githubOwner instanceof Error) {
        throw githubOwner;
      }

      // Insert or update the ThirdPartyUser
      const userResult = await client.query(
        `
            INSERT INTO app_user (provider, third_party_id, name, email, is_email_verified, role, github_owner_id)
            VALUES ($1, $2, $3, $4, TRUE, 'user', $5) 
            ON CONFLICT (third_party_id) DO UPDATE 
            SET 
                provider = EXCLUDED.provider,
                name = EXCLUDED.name,
                email = EXCLUDED.email,
                github_owner_id = EXCLUDED.github_owner_id
            RETURNING id, provider, third_party_id, name, email, role
            `,
        [
          user.provider,
          user.id.id,
          user.providerData.owner.name || null, // Use the owner's name from providerData
          user.emails.length > 0 ? user.emails[0].value : null,
          githubOwner.id.id,
        ],
      );

      const insertedUser = this.getOneUser(userResult.rows, githubOwner);
      await client.query("COMMIT"); // Commit the transaction if everything is successful
      return insertedUser;
    } catch (error) {
      await client.query("ROLLBACK"); // Rollback the transaction if there's an error
      throw error;
    } finally {
      client.release(); // Release the client back to the pool
    }
  }

  async findOne(email: string): Promise<User | null> {
    const result = await this.pool.query(
      `
              SELECT 
        au.id, 
        au.name, 
        au.email, 
        au.is_email_verified, 
        au.hashed_password, 
        au.role, 
        au.provider, 
        au.third_party_id,
        go.github_id,
        go.github_type,
        go.github_login,
        go.github_html_url,
        go.github_avatar_url
      FROM app_user au
      LEFT JOIN github_owner go ON au.github_owner_id = go.github_id
      WHERE au.email = $1
            `,
      [email],
    );
    return this.getOptionalUser(result.rows);
  }

  async findByThirdPartyId(
    id: ThirdPartyUserId,
    provider: Provider,
  ): Promise<User | null> {
    const result = await this.pool.query(
      `
      SELECT 
        au.id, 
        au.name, 
        au.email, 
        au.is_email_verified, 
        au.hashed_password, 
        au.role, 
        au.provider, 
        au.third_party_id,
        go.github_id,
        go.github_type,
        go.github_login,
        go.github_html_url,
        go.github_avatar_url
      FROM app_user au
      LEFT JOIN github_owner go ON au.github_owner_id = go.github_id
      WHERE au.third_party_id = $1 AND au.provider = $2
    `,
      [id.id, provider],
    );
    return this.getOptionalUser(result.rows);
  }
}
