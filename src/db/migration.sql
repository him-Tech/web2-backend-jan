CREATE TABLE IF NOT EXISTS github_owner
(
    id                SERIAL,
    github_id         INTEGER PRIMARY KEY,
    github_type       VARCHAR(127) NOT NULL,
    github_login      VARCHAR(255) NOT NULL,
    github_html_url   VARCHAR(510) NOT NULL,
    github_avatar_url VARCHAR(510) NOT NULL
);

CREATE TABLE IF NOT EXISTS github_repository
(
    id                 SERIAL,
    github_id          INTEGER PRIMARY KEY,
    github_owner_id    INTEGER      NOT NULL,
    github_html_url    VARCHAR(510) NOT NULL,
    github_name        VARCHAR(255) NOT NULL,
    github_description VARCHAR(510) NOT NULL,
    CONSTRAINT fk_github_owner FOREIGN KEY (github_owner_id) REFERENCES github_owner (github_id) ON DELETE RESTRICT
);

-- TODO: deal with the date format
-- github_created_at TIMESTAMP,
-- github_closed_at TIMESTAMP,
CREATE TABLE IF NOT EXISTS github_issue
(
    id                      SERIAL,
    github_id               INTEGER PRIMARY KEY,
    github_number           INTEGER       NOT NULL,
    github_repository_id    INTEGER       NOT NULL,
    github_title            VARCHAR(510)  NOT NULL,
    github_body             VARCHAR(1020) NOT NULL,
    github_open_by_owner_id INTEGER,
    github_html_url         VARCHAR(510)  NOT NULL,
    github_created_at       VARCHAR(510),
    github_closed_at        VARCHAR(510),
    CONSTRAINT fk_github_repository FOREIGN KEY (github_repository_id) REFERENCES github_repository (github_id) ON DELETE RESTRICT,
    CONSTRAINT fk_github_open_by_owner FOREIGN KEY (github_open_by_owner_id) REFERENCES github_owner (github_id) ON DELETE RESTRICT
);

-- User authentication tables --

-- from passportjs.org
CREATE TABLE IF NOT EXISTS "user_session"
(
    "sid"    character varying NOT NULL COLLATE "default",
    "sess"   json              NOT NULL,
    "expire" TIMESTAMP         NOT NULL
) WITH (OIDS= FALSE);
ALTER TABLE "user_session"
    ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX "IDX_session_expire" ON "user_session" ("expire");

CREATE TABLE IF NOT EXISTS "app_user"
(
    "id"                SERIAL PRIMARY KEY NOT NULL,
    "provider"          VARCHAR(50),         -- Optional, used for third-party users
    "third_party_id"    VARCHAR(100) UNIQUE, -- Optional, used for third-party users
    "name"              VARCHAR(255),
    "email"             VARCHAR(255) UNIQUE,
    "is_email_verified" BOOLEAN            NOT NULL,
    "hashed_password"   VARCHAR(255),        -- Optional, used for local users
    "role"              VARCHAR(50)        NOT NULL DEFAULT 'ser',
    "created_at"        TIMESTAMP          NOT NULL DEFAULT now(),
    "updated_at"        TIMESTAMP          NOT NULL DEFAULT now(),
    github_owner_id     INTEGER,
    CONSTRAINT fk_github_owner FOREIGN KEY (github_owner_id) REFERENCES github_owner (github_id) ON DELETE SET NULL,

    CONSTRAINT chk_provider CHECK (
            (provider IS NOT NULL AND third_party_id IS NOT NULL) OR
            (provider IS NULL AND third_party_id IS NULL)
        ),
    CONSTRAINT chk_github_provider_data CHECK (
            (provider = 'github' AND github_owner_id IS NOT NULL) OR
            (provider <> 'github' AND github_owner_id IS NULL)
        )
);

CREATE TABLE IF NOT EXISTS temp_company_address
(
    id               SERIAL PRIMARY KEY,
    company_name     VARCHAR(255),
    street_address_1 VARCHAR(255),
    street_address_2 VARCHAR(255),
    city             VARCHAR(100),
    state_province   VARCHAR(100),
    postal_code      VARCHAR(20),
    country          VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS company
(
    id                SERIAL PRIMARY KEY,
    tax_id            VARCHAR(50) UNIQUE,
    name              VARCHAR(255),
    contact_person_id INTEGER,
    address_id        INTEGER,
    CONSTRAINT fk_address FOREIGN KEY (address_id) REFERENCES temp_company_address (id) ON DELETE RESTRICT
    -- Foreign key constraints for contact persons will be added later
);

-- Junction tables for many-to-many relationships

CREATE TABLE IF NOT EXISTS user_company
(
    user_id    INTEGER,
    company_id INTEGER,
    PRIMARY KEY (user_id, company_id),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES "app_user" (id) ON DELETE CASCADE,
    CONSTRAINT fk_company FOREIGN KEY (company_id) REFERENCES "company" (id) ON DELETE CASCADE
);

ALTER TABLE company
    ADD CONSTRAINT fk_contact_person_user FOREIGN KEY (contact_person_id, id) REFERENCES user_company (user_id, company_id) ON DELETE SET NULL
