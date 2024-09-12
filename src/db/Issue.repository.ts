import { Pool } from "pg";
import { Issue, IssueId } from "../model";
import { getPool } from "../dbPool";

export function getIssueRepository(): IssueRepository {
  return new IssueRepositoryImpl(getPool());
}

export interface IssueRepository {
  insert(issue: Issue): Promise<Issue>;
  getById(id: IssueId): Promise<Issue | null>;
  getAll(): Promise<Issue[]>;
}

class IssueRepositoryImpl implements IssueRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  private getOneIssue(rows: any[]): Issue {
    const issue = this.getOptionalIssue(rows);
    if (issue === null) {
      throw new Error("Issue not found");
    } else {
      return issue;
    }
  }

  private getOptionalIssue(rows: any[]): Issue | null {
    if (rows.length === 0) {
      return null;
    } else if (rows.length > 1) {
      throw new Error("Multiple issues found");
    } else {
      const issue = Issue.fromBackend(rows[0]);
      if (issue instanceof Error) {
        throw issue;
      }
      return issue;
    }
  }

  private getIssueList(rows: any[]): Issue[] {
    return rows.map((r) => {
      const issue = Issue.fromBackend(r);
      if (issue instanceof Error) {
        throw issue;
      }
      return issue;
    });
  }

  async getAll(): Promise<Issue[]> {
    const result = await this.pool.query(`
            SELECT github_id, github_number, github_repository_id, github_title, github_body, github_open_by_owner_id, github_html_url, github_created_at, github_closed_at
            FROM github_issue
        `);

    return this.getIssueList(result.rows);
  }

  async getById(id: IssueId): Promise<Issue | null> {
    const result = await this.pool.query(
      `
            SELECT github_id, github_number, github_repository_id, github_title, github_body, github_open_by_owner_id, github_html_url, github_created_at, github_closed_at
            FROM github_issue
            WHERE github_id = $1 AND github_number = $2
        `,
      [id.id, id.number],
    );

    return this.getOptionalIssue(result.rows);
  }

  async insert(issue: Issue): Promise<Issue> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(
        `
                INSERT INTO github_issue (
                    github_id, github_number, github_repository_id, github_title, github_body, github_open_by_owner_id, github_html_url, github_created_at, github_closed_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING github_id, github_number, github_repository_id, github_title, github_body, github_open_by_owner_id, github_html_url, github_created_at, github_closed_at
            `,
        [
          issue.id.id,
          issue.id.number,
          issue.repositoryId.id,
          issue.title,
          issue.body,
          issue.openBy.id,
          issue.htmlUrl,
          issue.createdAt.toISOString(),
          issue.closedAt?.toISOString() || null,
        ],
      );

      return this.getOneIssue(result.rows);
    } finally {
      client.release();
    }
  }
}
