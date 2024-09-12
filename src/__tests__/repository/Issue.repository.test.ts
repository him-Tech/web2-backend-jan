import { type Express } from "express";
import { createApp } from "../../createApp";
import { setupTestDB } from "../jest.setup";
import { IssueId } from "../../model";
import { Fixture } from "./Fixture";
import {
  getIssueRepository,
  getOwnerRepository,
  getRepositoryRepository,
} from "../../db/";

describe("IssueRepository", () => {
  let app: Express = createApp();

  setupTestDB();

  const issueRepo = getIssueRepository();
  const ownerRepo = getOwnerRepository();
  const repo = getRepositoryRepository();

  describe("create", () => {
    it("should work", async () => {
      const ownerId = Fixture.id();
      const repositoryId = Fixture.id();

      // Insert owner and repository before inserting the issue
      await ownerRepo.insert(Fixture.owner(ownerId));
      await repo.insert(Fixture.repository(repositoryId, ownerId));

      const issue = Fixture.issue(
        Fixture.id(),
        Fixture.id(),
        repositoryId,
        ownerId,
      );
      const created = await issueRepo.insert(issue);

      expect(created).toEqual(issue);

      const found = await issueRepo.getById(issue.id);
      expect(found).toEqual(issue);
    });

    it("should fail with foreign key constraint error if repository or owner is not inserted", async () => {
      const issueId = Fixture.id();
      const repositoryId = Fixture.id(); // RepositoryId that does not exist in the database
      const ownerId = Fixture.id(); // OwnerId that does not exist in the database

      const issue = Fixture.issue(issueId, Fixture.id(), repositoryId, ownerId);

      try {
        await issueRepo.insert(issue);
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
    it("should return null if issue not found", async () => {
      const nonExistentIssueId = new IssueId(999999, 999999);
      const found = await issueRepo.getById(nonExistentIssueId);

      expect(found).toBeNull();
    });
  });

  describe("getAll", () => {
    it("should return all issues", async () => {
      const ownerId = Fixture.id();
      const repositoryId = Fixture.id();

      await ownerRepo.insert(Fixture.owner(ownerId));
      await repo.insert(Fixture.repository(repositoryId, ownerId));

      const issue1 = Fixture.issue(
        Fixture.id(),
        Fixture.id(),
        repositoryId,
        ownerId,
      );
      const issue2 = Fixture.issue(
        Fixture.id(),
        Fixture.id(),
        repositoryId,
        ownerId,
      );

      await issueRepo.insert(issue1);
      await issueRepo.insert(issue2);

      const allIssues = await issueRepo.getAll();

      expect(allIssues).toHaveLength(2);
      expect(allIssues).toContainEqual(issue1);
      expect(allIssues).toContainEqual(issue2);
    });

    it("should return an empty array if no issues exist", async () => {
      const allIssues = await issueRepo.getAll();
      expect(allIssues).toEqual([]);
    });
  });
});
