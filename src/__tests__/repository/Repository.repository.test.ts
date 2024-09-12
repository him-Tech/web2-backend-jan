import { setupTestDB } from "../jest.setup";
import { OwnerId, RepositoryId } from "../../model";
import { Fixture } from "./Fixture";
import { getOwnerRepository } from "../../db/OwnerRepository";
import { getRepositoryRepository } from "../../db/RepositoryRepository";

describe("RepositoryRepository", () => {
  const ownerRepo = getOwnerRepository();
  const repo = getRepositoryRepository();

  setupTestDB();

  describe("create", () => {
    it("should work", async () => {
      const ownerId = Fixture.id();
      await ownerRepo.insert(Fixture.owner(ownerId));

      const repository = Fixture.repository(Fixture.id(), ownerId);
      const created = await repo.insert(repository);

      expect(created).toEqual(repository);

      const found = await repo.getById(repository.id);
      expect(found).toEqual(repository);
    });

    it("should fail with foreign key constraint error if owner is not inserted", async () => {
      const repositoryId = Fixture.id();
      const ownerId = new OwnerId(Fixture.id()); // OwnerId that does not exist in the database

      const repository = Fixture.repository(repositoryId, ownerId.id);

      try {
        await repo.insert(repository);
        // If the insertion doesn't throw, fail the test
        fail(
          "Expected foreign key constraint violation, but no error was thrown.",
        );
      } catch (error: any) {
        // Check if the error is related to foreign key constraint
        expect(error.message).toMatch(/violates foreign key constraint/);
      }
    });
  });

  describe("getById", () => {
    it("should return null if repository not found", async () => {
      const nonExistentRepoId = new RepositoryId(999999);
      const found = await repo.getById(nonExistentRepoId);

      expect(found).toBeNull();
    });
  });

  describe("getAll", () => {
    it("should return all repositories", async () => {
      const ownerId1 = Fixture.id();
      const ownerId2 = Fixture.id();

      await ownerRepo.insert(Fixture.owner(ownerId1));
      await ownerRepo.insert(Fixture.owner(ownerId2));

      const repo1 = Fixture.repository(Fixture.id(), ownerId1, "payload1");
      const repo2 = Fixture.repository(Fixture.id(), ownerId2, "payload2");

      await repo.insert(repo1);
      await repo.insert(repo2);

      const allRepos = await repo.getAll();

      expect(allRepos).toHaveLength(2);
      expect(allRepos).toContainEqual(repo1);
      expect(allRepos).toContainEqual(repo2);
    });

    it("should return an empty array if no repositories exist", async () => {
      const allRepos = await repo.getAll();

      expect(allRepos).toEqual([]);
    });
  });
});
