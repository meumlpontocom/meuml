CREATE TABLE meli_stage.webhooks (
	id bigserial primary key,
	account_id bigint NOT NULL,
	topic varchar NULL,
	resource varchar NULL,
	attempts smallint NULL,
	sent_at timestamp(0) NULL,
	received_at timestamp(0) NULL,
	inserted_at timestamp(0) DEFAULT CURRENT_TIMESTAMP,
	has_read boolean default false
);
CREATE INDEX webhooks_account_id_idx ON meli_stage.webhooks USING btree (account_id);
