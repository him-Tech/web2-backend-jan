import { Pool } from "pg";
import { Owner, OwnerId } from "../model";
import { getPool } from "../dbPool";

export function getOwnerRepository(): OwnerRepository {
  return new OwnerRepositoryImpl(getPool());
}

export interface OwnerRepository {
  insert(owner: Owner): Promise<Owner>;
  getById(id: OwnerId): Promise<Owner | null>;
  getAll(): Promise<Owner[]>;
  findOne(githubLogin: string): Promise<Owner | null>;
}

class OwnerRepositoryImpl implements OwnerRepository {
  pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  private getOneOwner(rows: any[]): Owner {
    const owner = this.getOptionalOwner(rows);
    if (owner === null) {
      throw new Error("Owner not found");
    } else {
      return owner;
    }
  }

  private getOptionalOwner(rows: any[]): Owner | null {
    if (rows.length === 0) {
      return null;
    } else if (rows.length > 1) {
      throw new Error("Multiple owners found");
    } else {
      const owner = Owner.fromBackend(rows[0]);
      if (owner instanceof Error) {
        throw owner;
      }
      return owner;
    }
  }

  private getOwnerList(rows: any[]): Owner[] {
    return rows.map((r) => {
      const owner = Owner.fromBackend(r);
      if (owner instanceof Error) {
        throw owner;
      }
      return owner;
    });
  }

  async getAll(): Promise<Owner[]> {
    const result = await this.pool.query(`
            SELECT github_id, github_type, github_login, github_html_url, github_avatar_url 
            FROM github_owner
        `);

    return this.getOwnerList(result.rows);
  }

  async getById(id: OwnerId): Promise<Owner | null> {
    const result = await this.pool.query(
      `
            SELECT github_id, github_type, github_login, github_html_url, github_avatar_url 
            FROM github_owner
            WHERE github_id = $1
        `,
      [id.id],
    );

    return this.getOptionalOwner(result.rows);
  }

  // TODO: lolo insert or update
  async insert(owner: Owner): Promise<Owner> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(
        `
                INSERT INTO github_owner (github_id, github_type, github_login, github_html_url, github_avatar_url)
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING github_id, github_type, github_login, github_html_url, github_avatar_url
            `,
        [owner.id.id, owner.type, owner.name, owner.htmlUrl, owner.avatarUrl],
      );

      return this.getOneOwner(result.rows);
    } finally {
      client.release();
    }
  }

  async findOne(githubLogin: string): Promise<Owner | null> {
    const result = await this.pool.query(
      `
            SELECT github_id, github_type, github_login, github_html_url, github_avatar_url 
            FROM github_owner
            WHERE github_login = $1
        `,
      [githubLogin],
    );

    return this.getOptionalOwner(result.rows);
  }
}
