export class CompanyAddressId {
  id: number;

  constructor(id: number) {
    this.id = id;
  }
}

export class CompanyAddress {
  id: CompanyAddressId;
  companyName: string | null;
  streetAddress1: string | null;
  streetAddress2: string | null;
  city: string | null;
  stateProvince: string | null;
  postalCode: string | null;
  country: string | null;

  constructor(
    id: CompanyAddressId,
    companyName: string | null = null,
    streetAddress1: string | null = null,
    streetAddress2: string | null = null,
    city: string | null = null,
    stateProvince: string | null = null,
    postalCode: string | null = null,
    country: string | null = null,
  ) {
    this.id = id;
    this.companyName = companyName;
    this.streetAddress1 = streetAddress1;
    this.streetAddress2 = streetAddress2;
    this.city = city;
    this.stateProvince = stateProvince;
    this.postalCode = postalCode;
    this.country = country;
  }

  static fromBackend(row: any): CompanyAddress | Error {
    if (typeof row.id !== "number") {
      return new Error("Invalid raw: id is missing or not a number");
    }
    if (
      row.company_name !== undefined &&
      row.company_name !== null &&
      typeof row.company_name !== "string"
    ) {
      return new Error("Invalid raw: company_name is not a string");
    }
    if (
      row.street_address_1 !== undefined &&
      row.street_address_1 !== null &&
      typeof row.street_address_1 !== "string"
    ) {
      return new Error("Invalid raw: street_address_1 is not a string");
    }
    if (
      row.street_address_2 !== undefined &&
      row.street_address_2 !== null &&
      typeof row.street_address_2 !== "string"
    ) {
      return new Error("Invalid raw: street_address_2 is not a string");
    }
    if (
      row.city !== undefined &&
      row.city !== null &&
      typeof row.city !== "string"
    ) {
      return new Error("Invalid raw: city is not a string");
    }
    if (
      row.state_province !== undefined &&
      row.state_province !== null &&
      typeof row.state_province !== "string"
    ) {
      return new Error("Invalid raw: state_province is not a string");
    }
    if (
      row.postal_code !== undefined &&
      row.postal_code !== null &&
      typeof row.postal_code !== "string"
    ) {
      return new Error("Invalid raw: postal_code is not a string");
    }
    if (
      row.country !== undefined &&
      row.country !== null &&
      typeof row.country !== "string"
    ) {
      return new Error("Invalid raw: country is not a string");
    }

    return new CompanyAddress(
      new CompanyAddressId(row.id),
      row.company_name ?? null,
      row.street_address_1 ?? null,
      row.street_address_2 ?? null,
      row.city ?? null,
      row.state_province ?? null,
      row.postal_code ?? null,
      row.country ?? null,
    );
  }
}
