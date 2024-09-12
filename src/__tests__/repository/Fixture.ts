import {
  Company,
  CompanyAddress,
  CompanyAddressId,
  CompanyId,
  Email,
  GithubData,
  Issue,
  IssueId,
  Owner,
  OwnerId,
  OwnerType,
  Provider,
  Repository,
  RepositoryId,
  ThirdPartyUser,
  ThirdPartyUserId,
} from "../../model";
import { CreateCompanyAddressDto } from "../../dtos/CreateCompanyAddress.dto";
import { CreateCompanyDto, CreateLocalUserDto } from "../../dtos";

export const Fixture = {
  id(): number {
    return Math.floor(Math.random() * 1000000);
  },
  thirdPartyUser(
    id: string,
    provider: Provider = Provider.Github,
    email: string = "lauriane@gmail.com",
  ): ThirdPartyUser {
    return new ThirdPartyUser(
      provider,
      new ThirdPartyUserId(id),
      [new Email(email, null)],
      new GithubData(Fixture.owner(1)),
    );
  },
  createUserDto(): CreateLocalUserDto {
    return {
      email: "d@gmail.com" + this.id(),
      password: "password",
    } as CreateLocalUserDto;
  },

  owner(ownerId: number, payload: string = "payload"): Owner {
    return new Owner(
      new OwnerId(ownerId),
      OwnerType.Organization,
      "Open Source Economy",
      "url",
      payload,
    );
  },
  repository(
    repositoryId: number,
    ownerId: number,
    payload: string = "payload",
  ): Repository {
    return new Repository(
      new RepositoryId(repositoryId),
      new OwnerId(ownerId),
      "Repository Name",
      "https://example.com",
      payload,
    );
  },
  issue(
    issueId: number,
    numberId: number,
    repositoryId: number,
    openByOwnerId: number,
  ): Issue {
    return new Issue(
      new IssueId(issueId, numberId),
      new RepositoryId(repositoryId),
      "issue title",
      "url",
      new Date("2022-01-01T00:00:00.000Z"),
      null,
      new OwnerId(openByOwnerId),
      "body",
    );
  },
  companyAddress(addressId: number): CompanyAddress {
    return new CompanyAddress(
      new CompanyAddressId(addressId),
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    );
  },
  companyAddressFromDto(
    addressId: number,
    dto: CreateCompanyAddressDto,
  ): CompanyAddress {
    return new CompanyAddress(
      new CompanyAddressId(addressId),
      dto.companyName ?? null,
      dto.streetAddress1 ?? null,
      dto.streetAddress2 ?? null,
      dto.city ?? null,
      dto.stateProvince ?? null,
      dto.postalCode ?? null,
      dto.country ?? null,
    );
  },
  company(
    companyId: number,
    contactPersonId: number | null = null,
    addressId: number | null = null,
  ): Company {
    return new Company(
      new CompanyId(companyId),
      null,
      null,
      contactPersonId !== null ? new OwnerId(contactPersonId) : null,
      addressId !== null ? new CompanyAddressId(addressId) : null,
    );
  },
  companyFromDto(companyId: number, dto: CreateCompanyDto): Company {
    return new Company(
      new CompanyId(companyId),
      dto.taxId ?? null,
      dto.name ?? null,
      dto.contactPersonId ?? null,
      dto.addressId ?? null,
    );
  },
};
