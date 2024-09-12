import { OwnerId } from "./Owner";

export class RepositoryId {
  id: number;

  constructor(id: number) {
    this.id = id;
  }

  static fromGithubApi(json: any): RepositoryId | Error {
    if (!json.id || typeof json.id !== "number") {
      return new Error("Invalid JSON: id is missing or not a string");
    }

    return new RepositoryId(json.id);
  }

  static fromBackend(json: any): RepositoryId | Error {
    if (!json.github_id || typeof json.github_id !== "number") {
      return new Error("Invalid JSON: github_id is missing or not a string");
    }

    return new RepositoryId(json.github_id);
  }
}

export class Repository {
  id: RepositoryId;
  ownerId: OwnerId;
  name: string;
  htmlUrl: string;
  description: string;

  constructor(
    id: RepositoryId,
    ownerId: OwnerId,
    name: string,
    htmlUrl: string,
    description: string,
  ) {
    this.id = id;
    this.ownerId = ownerId;
    this.name = name;
    this.htmlUrl = htmlUrl;
    this.description = description;
  }

  // Github API: https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#get-a-repository
  // Example:
  // Repo owned by an organization: https://api.github.com/repos/open-source-economy/frontend
  // Repo owned by a user: https://api.github.com/repos/laurianemollier/strongVerbes
  //
  // NOTE: Repo can be queried by owner id and repository id.
  // This does not work: https://api.github.com/repos/141809657/701996033
  // But that works: https://api.github.com/repositories/701996033
  // See discussion: https://github.com/octokit/octokit.rb/issues/483
  static fromGithubApi(json: any): Repository | Error {
    const repositoryId = RepositoryId.fromGithubApi(json);
    if (repositoryId instanceof Error) {
      return repositoryId;
    }

    if (!json.owner) {
      return new Error("Invalid JSON: owner");
    }
    const ownerId: OwnerId | Error = OwnerId.fromGithubApi(json.owner);
    if (ownerId instanceof Error) {
      return ownerId;
    }

    if (!json.name || typeof json.name !== "string") {
      return new Error("Invalid JSON: name is missing or not a string");
    }
    if (!json.html_url || typeof json.html_url !== "string") {
      return new Error("Invalid JSON: html_url is missing or not a string");
    }
    if (!json.description || typeof json.description !== "string") {
      return new Error("Invalid JSON: description is missing or not a string");
    }

    return new Repository(
      repositoryId,
      ownerId,
      json.name,
      json.html_url,
      json.description,
    );
  }

  static fromBackend(json: any): Repository | Error {
    const repositoryId = RepositoryId.fromBackend(json);
    if (repositoryId instanceof Error) {
      return repositoryId;
    }
    if (!json.github_owner_id || typeof json.github_owner_id !== "number") {
      return new Error(
        "Invalid JSON: github_owner_id is missing or not a string",
      );
    }
    if (!json.github_name || typeof json.github_name !== "string") {
      return new Error("Invalid JSON: github_name is missing or not a string");
    }
    if (!json.github_html_url || typeof json.github_html_url !== "string") {
      return new Error(
        "Invalid JSON: github_html_url is missing or not a string",
      );
    }
    if (
      !json.github_description ||
      typeof json.github_description !== "string"
    ) {
      return new Error(
        "Invalid JSON: github_description is missing or not a string",
      );
    }

    return new Repository(
      repositoryId,
      new OwnerId(json.github_owner_id),
      json.github_name,
      json.github_html_url,
      json.github_description,
    );
  }
}
