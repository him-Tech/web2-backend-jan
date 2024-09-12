import { setupTestDB } from "../jest.setup";
import { CompanyAddressId } from "../../model";
import { Fixture } from "./Fixture";
import { getCompanyAddressRepository } from "../../db/";
import { CreateCompanyAddressDto } from "../../dtos";

describe("CompanyAddressRepository", () => {
  const companyAddressRepo = getCompanyAddressRepository();

  setupTestDB();

  describe("create", () => {
    it("should create a new company address", async () => {
      const addressDto = {
        companyName: "Company Name",
      } as CreateCompanyAddressDto;

      const created = await companyAddressRepo.create(addressDto);

      expect(created).toEqual(
        Fixture.companyAddressFromDto(created.id.id, addressDto),
      );

      const found = await companyAddressRepo.getById(
        new CompanyAddressId(created.id.id),
      );
      expect(found).toEqual(created);
    });
  });

  describe("update", () => {
    it("should update an existing company address", async () => {
      const addressDto = {
        companyName: "Company Name",
      } as CreateCompanyAddressDto;

      // First create the address
      const created = await companyAddressRepo.create(addressDto);

      // Update the address
      const updatedAddressDto = {
        companyName: null,
      } as CreateCompanyAddressDto;

      const updated = await companyAddressRepo.update(
        Fixture.companyAddressFromDto(created.id.id, updatedAddressDto),
      );

      expect(created.id).toEqual(updated.id);
      expect(updated).toEqual(
        Fixture.companyAddressFromDto(created.id.id, updatedAddressDto),
      );

      const found = await companyAddressRepo.getById(
        new CompanyAddressId(updated.id.id),
      );
      expect(found).toEqual(updated);
    });
  });

  describe("getById", () => {
    it("should return null if address not found", async () => {
      const nonExistentAddressId = new CompanyAddressId(999999);
      const found = await companyAddressRepo.getById(nonExistentAddressId);

      expect(found).toBeNull();
    });
  });

  describe("getAll", () => {
    it("should return an empty array if no address exist", async () => {
      const alladdress = await companyAddressRepo.getAll();

      expect(alladdress).toEqual([]);
    });

    it("should return all company address", async () => {
      const addressId1 = Fixture.id();
      const addressId2 = Fixture.id();

      const address = {
        companyName: "Company Name",
      } as CreateCompanyAddressDto;

      await companyAddressRepo.create(address);
      await companyAddressRepo.create(address);

      const alladdress = await companyAddressRepo.getAll();

      expect(alladdress).toHaveLength(2);
      expect(alladdress).toContainEqual(
        Fixture.companyAddressFromDto(1, address),
      );
      expect(alladdress).toContainEqual(
        Fixture.companyAddressFromDto(2, address),
      );
    });
  });
});
