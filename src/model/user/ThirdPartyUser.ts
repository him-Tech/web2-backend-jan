import { Owner } from "../Owner";

export class ThirdPartyUserId {
  id: string;

  constructor(id: string) {
    this.id = id;
  }
}

export enum Provider {
  Github = "github",
}

export class Email {
  value: string;
  type: string | null;

  constructor(value: string, type: string | null) {
    this.value = value;
    this.type = type;
  }

  static fromJson(json: any): Email | Error {
    if (!json.value || typeof json.value !== "string") {
      return new Error("Invalid JSON: value is missing or not a string");
    }
    if (json.type && typeof json.type !== "string") {
      return new Error("Invalid JSON: type is not a string");
    }

    return new Email(json.value, json.type);
  }
}

export class GithubData {
  owner: Owner;

  constructor(owner: Owner) {
    this.owner = owner;
  }
}

export class ThirdPartyUser {
  provider: Provider;
  id: ThirdPartyUserId;
  emails: Email[];
  providerData: GithubData;

  constructor(
    provider: Provider,
    id: ThirdPartyUserId,
    emails: Email[],
    providerData: GithubData,
  ) {
    this.provider = provider;
    this.id = id;
    this.emails = emails;
    this.providerData = providerData;
  }

  static fromJson(json: any): ThirdPartyUser | Error {
    if (!json.provider || typeof json.provider !== "string") {
      return new Error("Invalid json: provider is missing or not a string");
    }
    if (!json.id || typeof json.id !== "string") {
      return new Error("Invalid json: id is missing or not a string");
    }
    if (json._json && typeof json._json !== "object") {
      return new Error("Invalid json: _json is not an object");
    }
    if (json.emails && !Array.isArray(json.emails)) {
      return new Error("Invalid json: emails is not an array");
    }

    const emails: Email[] = [];
    if (json.emails) {
      json.emails.forEach((email: any) => {
        const e = Email.fromJson(email);
        if (e instanceof Error) {
          throw e;
        }
        emails.push(e);
      });
    }

    const owner = Owner.fromGithubApi(json._json);
    if (owner instanceof Error) {
      return owner;
    }
    const providerData = new GithubData(owner);

    return new ThirdPartyUser(
      json.provider as Provider,
      new ThirdPartyUserId(json.id),
      emails,
      providerData,
    );
  }

  static fromRaw(row: any, owner: Owner | null = null): ThirdPartyUser | Error {
    if (!row.provider || typeof row.provider !== "string") {
      return new Error("Invalid raw: provider is missing or not a string");
    }
    if (!row.third_party_id || typeof row.third_party_id !== "string") {
      return new Error(
        `Invalid raw: third_party_id is missing or not a string. Received: ${JSON.stringify(row, null, 2)}`,
      );
    }
    if (row.display_name && typeof row.display_name !== "string") {
      return new Error(
        `Invalid raw: display_name is not a string. Received: ${JSON.stringify(row, null, 2)}`,
      );
    }
    if (row.email && typeof row.email !== "string") {
      return new Error("Invalid raw: email is missing or not a string");
    }

    const emails: Email[] = [];
    if (row.email) {
      const e = new Email(row.email, null);
      emails.push(e);
    }

    if (owner === null) {
      const o = Owner.fromBackend(row);
      if (o instanceof Error) {
        return o;
      }
      owner = o;
    }
    const providerData = new GithubData(owner!); // TODO: refactor

    return new ThirdPartyUser(
      row.provider as Provider,
      new ThirdPartyUserId(row.third_party_id),
      emails,
      providerData,
    );
  }
}
