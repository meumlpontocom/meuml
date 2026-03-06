CREATE TABLE meuml.catalog_price_to_win (
	id varchar primary key,
	date_created timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP,
	account_id bigint not null,
	catalog_product_id varchar NULL,
	current_price numeric(9,2) NULL,
	price_to_win numeric(9,2) NULL,
	status varchar NULL,
	competitors_sharing_first_place varchar NULL,
	visit_share varchar NULL,
	consistent boolean NULL,
	boosts jsonb NULL,
	winner_id varchar NULL,
	winner_price numeric(9,2) NULL,
	winner_boosts jsonb NULL,
	reason jsonb NULL,
--	CONSTRAINT catalog_price_to_win_advertising_id_fk FOREIGN KEY (id) REFERENCES meuml.advertisings(external_id) ON DELETE CASCADE,
	CONSTRAINT catalog_price_to_win_account_id_fk FOREIGN KEY (account_id) REFERENCES meuml.accounts(id)
);
CREATE INDEX catalog_price_to_win_account_id_idx ON meuml.catalog_price_to_win USING btree (account_id);
