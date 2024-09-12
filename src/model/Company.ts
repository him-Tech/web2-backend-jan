import { UserId } from "./user";
import { CompanyAddressId } from "./CompanyAddress";

export class CompanyId {
  id: number;

  constructor(id: number) {
    this.id = id;
  }
}

export class Company {
  id: CompanyId;
  taxId: string | null;
  name: string | null;
  contactPersonId: UserId | null;
  addressId: CompanyAddressId | null;

  constructor(
    id: CompanyId,
    taxId: string | null,
    name: string | null,
    contactPersonId: UserId | null = null,
    addressId: CompanyAddressId | null = null,
  ) {
    this.id = id;
    this.taxId = taxId;
    this.name = name;
    this.contactPersonId = contactPersonId;
    this.addressId = addressId;
  }

  static fromBackend(row: any): Company | Error {
    if (typeof row.id !== "number") {
      return new Error("Invalid raw: id is missing or not a number");
    }
    if (
      row.tax_id !== undefined &&
      row.tax_id !== null &&
      typeof row.tax_id !== "string"
    ) {
      return new Error("Invalid raw: tax_id is not a string");
    }
    if (
      row.name !== undefined &&
      row.name !== null &&
      typeof row.name !== "string"
    ) {
      return new Error("Invalid raw: tax_id is not a string");
    }

    if (
      row.contact_person_id !== undefined &&
      row.contact_person_id !== null &&
      typeof row.contact_person_id !== "number"
    ) {
      return new Error(
        `Invalid raw: contact_person_id is not a number. Received: ${JSON.stringify(row, null, 2)}`,
      );
    }

    let addressId: CompanyAddressId | null = null;
    if (row.address_id !== undefined && row.address_id !== null) {
      if (typeof row.address_id === "number") {
        addressId = new CompanyAddressId(row.address_id);
      } else {
        return new Error("Invalid raw: address_id is not a number");
      }
    }

    return new Company(
      new CompanyId(row.id),
      row.tax_id,
      row.name,
      row.contact_person_id ? new UserId(row.contact_person_id) : null,
      addressId,
    );
  }
}
