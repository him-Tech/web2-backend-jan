export class OwnerId {
  id: number;

  constructor(id: number) {
    this.id = id;
  }

  static fromGithubApi(json: any): OwnerId | Error {
    if (!json.id || typeof json.id !== "number") {
      return new Error("Invalid JSON: id is missing or not a string");
    }

    return new OwnerId(json.id);
  }

  static fromBackend(json: any): OwnerId | Error {
    if (!json.github_id || typeof json.github_id !== "number") {
      return new Error(
        `Invalid JSON: github_id is missing or not a string. Received: ${JSON.stringify(json, null, 2)}`,
      );
    }

    return new OwnerId(json.github_id);
  }
}

export enum OwnerType {
  User = "User",
  Organization = "Organization",
}

export class Owner {
  id: OwnerId;
  type: OwnerType;
  name: string;
  htmlUrl: string;
  avatarUrl: string;

  constructor(
    id: OwnerId,
    type: OwnerType,
    name: string,
    url: string,
    avatar_url: string,
  ) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.htmlUrl = url;
    this.avatarUrl = avatar_url;
  }

  // For Organization
  // Github API: https://docs.github.com/en/rest/orgs/orgs?apiVersion=2022-11-28#get-an-organization
  // Example: https://api.github.com/orgs/open-source-economy
  //
  // For User
  // Github API: https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28#get-a-user
  // Example: https://api.github.com/users/laurianemollier
  static fromGithubApi(json: any): Owner | Error {
    const owner = OwnerId.fromGithubApi(json);
    if (owner instanceof Error) {
      return owner;
    }
    if (!json.login || typeof json.login !== "string") {
      return new Error("Invalid JSON: login is missing or not a string");
    }
    if (
      !json.type ||
      typeof json.type !== "string" ||
      !Object.values(OwnerType).includes(json.type)
    ) {
      return new Error(
        "Invalid JSON: type is missing; or not a string; or is not the correct type",
      );
    }
    if (!json.html_url || typeof json.html_url !== "string") {
      return new Error("Invalid JSON: html_url is missing or not a string");
    }
    if (!json.avatar_url || typeof json.avatar_url !== "string") {
      return new Error("Invalid JSON: avatar_url is missing or not a string");
    }

    return new Owner(
      owner,
      OwnerType[json.type as keyof typeof OwnerType],
      json.login,
      json.html_url,
      json.avatar_url,
    );
  }

  static fromBackend(json: any): Owner | Error {
    const owner = OwnerId.fromBackend(json);
    if (owner instanceof Error) {
      return owner;
    }
    if (!json.github_login || typeof json.github_login !== "string") {
      return new Error("Invalid JSON: github_login is missing or not a string");
    }
    if (
      !json.github_type ||
      typeof json.github_type !== "string" ||
      !Object.values(OwnerType).includes(json.github_type)
    ) {
      return new Error(
        "Invalid JSON: github_type is missing; or not a string; or is not the correct type",
      );
    }
    if (!json.github_html_url || typeof json.github_html_url !== "string") {
      return new Error(
        "Invalid JSON: github_html_url is missing or not a string",
      );
    }
    if (!json.github_avatar_url || typeof json.github_avatar_url !== "string") {
      return new Error(
        "Invalid JSON: github_avatar_url is missing or not a string",
      );
    }

    return new Owner(
      owner,
      OwnerType[json.github_type as keyof typeof OwnerType],
      json.github_login,
      json.github_html_url,
      json.github_avatar_url,
    );
  }
}

export class UserOwner extends Owner {
  static fromGithubApi(json: any): UserOwner | Error {
    const owner = Owner.fromGithubApi(json);
    if (owner instanceof Error) {
      return owner;
    }
    if (owner.type !== OwnerType.User) {
      return new Error("Invalid JSON: owner is not a user");
    }
    return Owner.fromGithubApi(json) as UserOwner;
  }
}
