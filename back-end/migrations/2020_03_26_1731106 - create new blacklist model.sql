-- Drop table

-- DROP TABLE meli_stage.blacklist_orders;

CREATE TABLE meli_stage.blacklist_orders (
	account_id bigint NOT NULL,
	customer_id bigint NOT NULL,
	CONSTRAINT blacklist_orders_pk PRIMARY KEY (account_id, customer_id)
)
PARTITION BY LIST (account_id);

-- Permissions

ALTER TABLE meli_stage.blacklist_orders OWNER TO postgres;
GRANT ALL ON TABLE meli_stage.blacklist_orders TO postgres;



-- Drop table

-- DROP TABLE meli_stage.blacklist_questions;

CREATE TABLE meli_stage.blacklist_questions (
	account_id bigint NOT NULL,
	customer_id bigint NOT NULL,
	CONSTRAINT blacklist_questions_pk PRIMARY KEY (account_id, customer_id)
)
PARTITION BY LIST (account_id);

-- Permissions

ALTER TABLE meli_stage.blacklist_questions OWNER TO postgres;
GRANT ALL ON TABLE meli_stage.blacklist_questions TO postgres;



-- Drop table

-- DROP TABLE meuml.blacklists;

CREATE TABLE meuml.blacklists (
	id bigserial NOT NULL,
	date_created timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	account_id bigint NOT NULL,
	customer_id bigint NOT NULL,
	motive_id int4 NULL,
	motive_description varchar(2000) NULL,
	customer_nickname varchar(120) NULL,
	CONSTRAINT blacklists_pkey PRIMARY KEY (id),
	CONSTRAINT blacklists_unique UNIQUE (account_id, customer_id),
	CONSTRAINT fk_blacklists_account_id FOREIGN KEY (account_id) REFERENCES meuml.accounts(id),
	CONSTRAINT fk_blacklists_motive_id FOREIGN KEY (motive_id) REFERENCES meuml.blacklist_motives(id)
);

-- Permissions

ALTER TABLE meuml.blacklists OWNER TO postgres;
GRANT ALL ON TABLE meuml.blacklists TO postgres;



-- Drop table

-- DROP TABLE meuml.blacklist_orders;

CREATE TABLE meuml.blacklist_orders (
	account_id bigint NOT NULL,
	customer_id bigint NOT NULL,
	date_created timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT blacklist_orders_pk PRIMARY KEY (account_id, customer_id)
);

-- Permissions

ALTER TABLE meuml.blacklist_orders OWNER TO postgres;
GRANT ALL ON TABLE meuml.blacklist_orders TO postgres;



-- Drop table

-- DROP TABLE meuml.blacklist_questions;

CREATE TABLE meuml.blacklist_questions (
	account_id bigint NOT NULL,
	customer_id bigint NOT NULL,
	date_created timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT blacklist_questions_pk PRIMARY KEY (account_id, customer_id)
);

-- Permissions

ALTER TABLE meuml.blacklist_questions OWNER TO postgres;
GRANT ALL ON TABLE meuml.blacklist_questions TO postgres;



CREATE OR REPLACE VIEW meuml.v_blocks
AS SELECT x.account_id,
    x.customer_id,
    sum(
        CASE
            WHEN x.type = 'q'::text THEN 1
            ELSE 0
        END) AS questions,
    sum(
        CASE
            WHEN x.type = 'o'::text THEN 1
            ELSE 0
        END) AS bids
   FROM ( SELECT bo.account_id,
            bo.customer_id,
            'o'::text AS type
           FROM meuml.blacklist_orders bo
        UNION
         SELECT bq.account_id,
            bq.customer_id,
            'q'::text AS type
           FROM meuml.blacklist_questions bq) x
  GROUP BY x.account_id, x.customer_id;

-- Permissions

ALTER TABLE meuml.v_blocks OWNER TO postgres;
GRANT ALL ON TABLE meuml.v_blocks TO postgres;
