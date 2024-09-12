import { setupTestDB } from "../jest.setup";
import { OwnerId } from "../../model";
import { getOwnerRepository } from "../../db/OwnerRepository";
import { Fixture } from "./Fixture";

describe("OwnerRepository", () => {
  setupTestDB();

  const repo = getOwnerRepository();

  describe("create", () => {
    it("should work", async () => {
      const owner = Fixture.owner(Fixture.id());
      const created = await repo.insert(owner);

      expect(created).toEqual(owner);

      const found = await repo.getById(owner.id);
      expect(found).toEqual(owner);
    });
  });

  describe("getById", () => {
    it("should return null if owner not found", async () => {
      const nonExistentOwnerId = new OwnerId(999999);
      const found = await repo.getById(nonExistentOwnerId);

      expect(found).toBeNull();
    });
  });

  describe("getAll", () => {
    it("should return all owners", async () => {
      const owner1 = Fixture.owner(Fixture.id(), "payload1");
      const owner2 = Fixture.owner(Fixture.id(), "payload2");

      await repo.insert(owner1);
      await repo.insert(owner2);

      const allOwners = await repo.getAll();

      expect(allOwners).toHaveLength(2);
      expect(allOwners).toContainEqual(owner1);
      expect(allOwners).toContainEqual(owner2);
    });

    it("should return an empty array if no owners exist", async () => {
      const allOwners = await repo.getAll();

      expect(allOwners).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should find an owner by github login", async () => {
      const owner = Fixture.owner(Fixture.id());
      await repo.insert(owner);

      const found = await repo.findOne(owner.name);

      expect(found).toEqual(owner);
    });

    it("should return null if owner not found by github login", async () => {
      const found = await repo.findOne("nonexistentuser");

      expect(found).toBeNull();
    });
  });
});
