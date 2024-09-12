import { Pool } from "pg";
import { CompanyAddress, CompanyAddressId } from "../model";
import { getPool } from "../dbPool";
import { CreateCompanyAddressDto } from "../dtos/CreateCompanyAddress.dto";

export function getCompanyAddressRepository(): CompanyAddressRepository {
  return new CompanyAddressRepositoryImpl(getPool());
}

export interface CompanyAddressRepository {
  create(address: CreateCompanyAddressDto): Promise<CompanyAddress>;
  update(address: CompanyAddress): Promise<CompanyAddress>;
  getById(id: CompanyAddressId): Promise<CompanyAddress | null>;
  getAll(): Promise<CompanyAddress[]>;
}

class CompanyAddressRepositoryImpl implements CompanyAddressRepository {
  pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  private getOneCompanyAddress(rows: any[]): CompanyAddress {
    const address = this.getOptionalCompanyAddress(rows);
    if (address === null) {
      throw new Error("CompanyAddress not found");
    } else {
      return address;
    }
  }

  private getOptionalCompanyAddress(rows: any[]): CompanyAddress | null {
    if (rows.length === 0) {
      return null;
    } else if (rows.length > 1) {
      throw new Error("Multiple company address found");
    } else {
      const address = CompanyAddress.fromBackend(rows[0]);
      if (address instanceof Error) {
        throw address;
      }
      return address;
    }
  }

  private getCompanyAddressList(rows: any[]): CompanyAddress[] {
    return rows.map((r) => {
      const address = CompanyAddress.fromBackend(r);
      if (address instanceof Error) {
        throw address;
      }
      return address;
    });
  }

  async getAll(): Promise<CompanyAddress[]> {
    const result = await this.pool.query(`
      SELECT id, company_name, street_address_1, street_address_2, city, state_province, postal_code, country
      FROM temp_company_address
    `);

    return this.getCompanyAddressList(result.rows);
  }

  async getById(id: CompanyAddressId): Promise<CompanyAddress | null> {
    const result = await this.pool.query(
      `
      SELECT id, company_name, street_address_1, street_address_2, city, state_province, postal_code, country
      FROM temp_company_address
      WHERE id = $1
      `,
      [id.id],
    );

    return this.getOptionalCompanyAddress(result.rows);
  }

  async create(address: CreateCompanyAddressDto): Promise<CompanyAddress> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(
        `
                    INSERT INTO temp_company_address (company_name, street_address_1, street_address_2, city,
                                                        state_province, postal_code, country)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING id, company_name, street_address_1, street_address_2, city, state_province, postal_code, country
                `,
        [
          address.companyName,
          address.streetAddress1,
          address.streetAddress2,
          address.city,
          address.stateProvince,
          address.postalCode,
          address.country,
        ],
      );

      return this.getOneCompanyAddress(result.rows);
    } finally {
      client.release();
    }
  }

  async update(address: CompanyAddress): Promise<CompanyAddress> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(
        `
                UPDATE temp_company_address
                SET
                    company_name = $1,
                    street_address_1 = $2,
                    street_address_2 = $3,
                    city = $4,
                    state_province = $5,
                    postal_code = $6,
                    country = $7
                WHERE id = $8
                RETURNING id, company_name, street_address_1, street_address_2, city, state_province, postal_code, country
            `,
        [
          address.companyName,
          address.streetAddress1,
          address.streetAddress2,
          address.city,
          address.stateProvince,
          address.postalCode,
          address.country,
          address.id.id,
        ],
      );

      return this.getOneCompanyAddress(result.rows);
    } finally {
      client.release();
    }
  }
}
