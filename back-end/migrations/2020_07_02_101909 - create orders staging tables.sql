CREATE TABLE meli_stage.orders (
	order_id varchar(22) NOT NULL,
	account_id bigint NOT NULL,
	external_data jsonb NULL,
	date_created timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT orders_staging_pkey PRIMARY KEY (order_id, account_id)
)
PARTITION BY LIST (account_id);


CREATE TABLE meli_stage.order_items (
	id text NOT NULL,
	account_id bigint NOT NULL,
	order_id varchar(22) NOT NULL,
	external_data jsonb NULL,
	date_created timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT order_items_staging_pkey PRIMARY KEY (id, account_id)
)
PARTITION BY LIST (account_id);


CREATE TABLE meli_stage.order_messages (
	id bigint NOT NULL,
	account_id bigint NOT NULL,
	order_id varchar(22) NOT NULL,
	external_data jsonb NULL,
	date_created timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT order_messages_staging_pkey PRIMARY KEY (id, account_id)
)
PARTITION BY LIST (account_id);


CREATE TABLE meli_stage.order_payments (
	id bigint NOT NULL,
	account_id bigint NOT NULL,
	order_id varchar(22) NOT NULL,
	external_data jsonb NULL,
	date_created timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT order_payments_staging_pkey PRIMARY KEY (id, account_id)
)
PARTITION BY LIST (account_id);


CREATE TABLE meli_stage.order_shipments (
	id bigint NOT NULL,
	account_id bigint NOT NULL,
	order_id varchar(22) NOT NULL,
	external_data jsonb NULL,
	date_created timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT order_shipments_staging_pkey PRIMARY KEY (id, account_id)
)
PARTITION BY LIST (account_id);
