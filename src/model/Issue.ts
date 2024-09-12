import { OwnerId } from "./Owner";
import { RepositoryId } from "./Repository";

// impossible to query Github api by issue id
// only by repository id and issue number
export class IssueId {
  id: number;
  number: number;

  // TODO: for the DB we need to store the repository id as well
  constructor(id: number, number: number) {
    this.id = id;
    this.number = number;
  }

  static fromJson(json: any): IssueId | Error {
    if (!json.id || typeof json.id !== "number") {
      return new Error("Invalid JSON: id is missing or not a string");
    }
    if (!json.number || typeof json.number !== "number") {
      return new Error("Invalid JSON: number is missing or not a string");
    }

    return new IssueId(json.id, json.number);
  }
}

export class Issue {
  id: IssueId;
  repositoryId: RepositoryId;
  title: string;
  htmlUrl: string;
  createdAt: Date;
  closedAt: Date | null;
  openBy: OwnerId;
  body: string;

  constructor(
    id: IssueId,
    repositoryId: RepositoryId,
    title: string,
    htmlUrl: string,
    createdAt: Date,
    closedAt: Date | null,
    openBy: OwnerId,
    body: string,
  ) {
    this.id = id;
    this.title = title;
    this.repositoryId = repositoryId;
    this.htmlUrl = htmlUrl;
    this.createdAt = createdAt;
    this.closedAt = closedAt;
    this.openBy = openBy;
    this.body = body;
  }

  // Github API: https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#get-an-issue
  // Example: https://api.github.com/repos/scala/scala/issues/1
  //
  // NOTE: Issue can be queried by owner id and repository id.
  // This does not work: https://api.github.com/repos/795990/2888818/issues/1
  // But that works: https://api.github.com/repositories/2888818/issues/1
  // See discussion: https://github.com/octokit/octokit.rb/issues/483
  //
  // github api does not return the repository id
  static fromGithubApi(repositoryId: RepositoryId, json: any): Issue | Error {
    const issueId = IssueId.fromJson(json);
    if (issueId instanceof Error) {
      return issueId;
    }
    if (!json.title || typeof json.title !== "string") {
      return new Error("Invalid JSON: title is missing or not a string");
    }
    if (!json.html_url || typeof json.html_url !== "string") {
      return new Error("Invalid JSON: html_url is missing or not a string");
    }
    if (!json.created_at || typeof json.created_at !== "string") {
      return new Error("Invalid JSON: created_at is missing or not a string");
    }
    if (json.closed_at && typeof json.closed_at !== "string") {
      // optional
      return new Error("Invalid JSON: closed_at is not a string");
    }
    if (!json.user || typeof json.user !== "object") {
      return new Error("Invalid JSON: user is missing or not an object");
    }
    const ownerId: OwnerId | Error = OwnerId.fromGithubApi(json.user);
    if (ownerId instanceof Error) {
      return ownerId;
    }
    if (!json.body || typeof json.body !== "string") {
      return new Error("Invalid JSON: body is missing or not a string");
    }

    return new Issue(
      issueId,
      repositoryId,
      json.title,
      json.html_url,
      new Date(json.created_at), // TODO: can throw an error?
      json.closed_at ? new Date(json.closed_at) : null, // TODO: can throw an error?
      ownerId,
      json.body,
    );
  }

  static fromBackend(row: any): Issue | Error {
    if (!row.github_id || typeof row.github_id !== "number") {
      return new Error("Invalid raw: github_id is missing or not a string");
    }
    if (!row.github_number || typeof row.github_number !== "number") {
      return new Error("Invalid raw: github_number is missing or not a string");
    }
    if (
      !row.github_repository_id ||
      typeof row.github_repository_id !== "number"
    ) {
      return new Error(
        "Invalid raw: github_repository_id is missing or not a string",
      );
    }
    if (!row.github_title || typeof row.github_title !== "string") {
      return new Error("Invalid raw: github_title is missing or not a string");
    }
    if (!row.github_html_url || typeof row.github_html_url !== "string") {
      return new Error(
        "Invalid raw: github_html_url is missing or not a string",
      );
    }
    // if (!row.github_created_at || typeof row.github_created_at !== "object") {
    if (!row.github_created_at || typeof row.github_created_at !== "string") {
      return new Error(
        "Invalid raw: github_created_at is missing or not a string",
      );
    }
    if (row.github_closed_at && typeof row.github_closed_at !== "string") {
      // if (row.github_closed_at && typeof row.github_closed_at !== "object") {
      // optional
      return new Error("Invalid raw: github_closed_at is not a string");
    }
    if (
      !row.github_open_by_owner_id ||
      typeof row.github_open_by_owner_id !== "number"
    ) {
      return new Error(
        "Invalid raw: github_open_by_owner_id is missing or not a number",
      );
    }
    if (!row.github_body || typeof row.github_body !== "string") {
      return new Error("Invalid raw: github_body is missing or not a string");
    }
    const issueId = new IssueId(row.github_id, row.github_number);
    const repositoryId = new RepositoryId(row.github_repository_id);
    const githubOpenByOwnerId = new OwnerId(row.github_open_by_owner_id);

    return new Issue(
      issueId,
      repositoryId,
      row.github_title,
      row.github_html_url,
      new Date(row.github_created_at),
      row.github_closed_at ? new Date(row.github_closed_at) : null,
      githubOpenByOwnerId,
      row.github_body,
    );
  }
}
