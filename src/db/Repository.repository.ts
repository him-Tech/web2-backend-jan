import { Pool } from "pg";
import { Repository, RepositoryId } from "../model";
import { getPool } from "../dbPool";

export function getRepositoryRepository(): RepositoryRepository {
  return new RepositoryRepositoryImpl(getPool());
}

export interface RepositoryRepository {
  insert(repository: Repository): Promise<Repository>;
  getById(id: RepositoryId): Promise<Repository | null>;
  getAll(): Promise<Repository[]>;
}

class RepositoryRepositoryImpl implements RepositoryRepository {
  pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  private getOneRepository(rows: any[]): Repository {
    const repository = this.getOptionalRepository(rows);
    if (repository === null) {
      throw new Error("Repository not found");
    } else {
      return repository;
    }
  }

  private getOptionalRepository(rows: any[]): Repository | null {
    if (rows.length === 0) {
      return null;
    } else if (rows.length > 1) {
      throw new Error("Multiple repositories found");
    } else {
      const repository = Repository.fromBackend(rows[0]);
      if (repository instanceof Error) {
        throw repository;
      }
      return repository;
    }
  }

  private getRepositoryList(rows: any[]): Repository[] {
    return rows.map((r) => {
      const repository = Repository.fromBackend(r);
      if (repository instanceof Error) {
        throw repository;
      }
      return repository;
    });
  }

  async getAll(): Promise<Repository[]> {
    const result = await this.pool.query(`
            SELECT id, github_id, github_owner_id, github_html_url, github_name, github_description 
            FROM github_repository
        `);

    return this.getRepositoryList(result.rows);
  }

  async getById(id: RepositoryId): Promise<Repository | null> {
    const result = await this.pool.query(
      `
            SELECT id, github_id, github_owner_id, github_html_url, github_name, github_description 
            FROM github_repository
            WHERE github_id = $1
        `,
      [id.id],
    );

    return this.getOptionalRepository(result.rows);
  }

  async insert(repository: Repository): Promise<Repository> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(
        `
                INSERT INTO github_repository (github_id, github_owner_id, github_html_url, github_name, github_description)
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING id, github_id, github_owner_id, github_html_url, github_name, github_description
            `,
        [
          repository.id.id,
          repository.ownerId.id,
          repository.htmlUrl,
          repository.name,
          repository.description,
        ],
      );

      return this.getOneRepository(result.rows);
    } finally {
      client.release();
    }
  }
}
