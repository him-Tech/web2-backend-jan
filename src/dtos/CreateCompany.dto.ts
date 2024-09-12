import { CompanyAddressId, UserId } from "../model";

export interface CreateCompanyDto {
  taxId: string | null;
  name: string | null;
  contactPersonId: UserId | null;
  addressId: CompanyAddressId | null;
}
