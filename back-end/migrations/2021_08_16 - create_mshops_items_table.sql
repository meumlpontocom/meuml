CREATE TABLE meli_stage.mshops_items (
	item_id varchar(22) NOT NULL,
	account_id int8 NOT NULL,
	external_data jsonb NULL,
	status int4 NULL,
	CONSTRAINT mshops_items_json_pkey PRIMARY KEY (item_id, account_id)
)
PARTITION BY LIST (account_id);
CREATE INDEX mshops_items_status_idx ON ONLY meli_stage.mshops_items USING btree (status);