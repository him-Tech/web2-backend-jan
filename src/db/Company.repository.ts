import { Pool } from "pg";
import { Company, CompanyId, UserId } from "../model";
import { getPool } from "../dbPool";
import { CreateCompanyDto } from "../dtos";

export function getCompanyRepository(): CompanyRepository {
  return new CompanyRepositoryImpl(getPool());
}

export interface CompanyRepository {
  insert(company: CreateCompanyDto): Promise<Company>;
  update(company: Company): Promise<Company>;
  getById(id: CompanyId): Promise<Company | null>;
  getAll(): Promise<Company[]>;
}

class CompanyRepositoryImpl implements CompanyRepository {
  pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  private getOneCompany(rows: any[]): Company {
    const company = this.getOptionalCompany(rows);
    if (company === null) {
      throw new Error("Company not found");
    } else {
      return company;
    }
  }

  private getOptionalCompany(rows: any[]): Company | null {
    if (rows.length === 0) {
      return null;
    } else if (rows.length > 1) {
      throw new Error("Multiple company found");
    } else {
      const company = Company.fromBackend(rows[0]);
      if (company instanceof Error) {
        throw company;
      }
      return company;
    }
  }

  private getCompanyList(rows: any[]): Company[] {
    return rows.map((r) => {
      const company = Company.fromBackend(r);
      if (company instanceof Error) {
        throw company;
      }
      return company;
    });
  }

  async getAll(): Promise<Company[]> {
    const result = await this.pool.query(`
      SELECT id, tax_id, name, contact_person_id, address_id 
      FROM company
    `);

    return this.getCompanyList(result.rows);
  }

  async getById(id: CompanyId): Promise<Company | null> {
    const result = await this.pool.query(
      `
      SELECT id, tax_id, name, contact_person_id, address_id 
      FROM company
      WHERE id = $1
      `,
      [id.id],
    );

    return this.getOptionalCompany(result.rows);
  }

  // TODO: check if that is correct and optimal for the DB
  async insert(company: CreateCompanyDto): Promise<Company> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Insert the company record, but initially set contact_person_id to NULL
      const result = await client.query(
        `
      INSERT INTO company (tax_id, name, address_id)
      VALUES ($1, $2, $3) 
      RETURNING id, tax_id, name, address_id
      `,
        [company.taxId, company.name, company.addressId?.id ?? null],
      );

      const insertedCompany = this.getOneCompany(result.rows);

      // 2. Insert into user_company
      if (company.contactPersonId instanceof UserId) {
        await client.query(
          `
              INSERT INTO user_company (user_id, company_id)
              VALUES ($1, $2)
            `,
          [company.contactPersonId.id, insertedCompany.id.id],
        );
      }

      // 3. Update the company record with the correct contact_person_id
      await client.query(
        `
      UPDATE company
      SET contact_person_id = $1
      WHERE id = $2
      `,
        [company.contactPersonId?.id ?? null, insertedCompany.id.id],
      );

      await client.query("COMMIT");

      return insertedCompany;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async update(company: Company): Promise<Company> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      // Insert into user_company if a user is the contact person
      if (company.contactPersonId instanceof UserId) {
        await client.query(
          `
          INSERT INTO user_company (user_id, company_id)
          VALUES ($1, $2)
          ON CONFLICT (user_id, company_id) DO NOTHING
          `,
          [company.contactPersonId.id, company.id.id],
        );
      }

      const result = await client.query(
        `
        UPDATE company
        SET tax_id = $1,
            name = $2,
            contact_person_id = $3,
            address_id = $4
        WHERE id = $5
        RETURNING id, tax_id, name, contact_person_id, address_id
        `,
        [
          company.taxId,
          company.name,
          company.contactPersonId?.id ?? null,
          company.addressId?.id ?? null,
          company.id.id,
        ],
      );

      const updatedCompany = this.getOneCompany(result.rows);
      await client.query("COMMIT");

      return updatedCompany;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
