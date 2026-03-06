CREATE SCHEMA shopee_stage AUTHORIZATION postgres;

CREATE TABLE shopee_stage.items (
	item_id bigint NOT NULL,
	account_id bigint NOT NULL,
	date_created timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	external_data jsonb NULL,
	CONSTRAINT shopee_stage_items_pk PRIMARY KEY (item_id, account_id)
)
PARTITION BY LIST (account_id);

INSERT INTO meuml.tools (id,"name","key",price)
	VALUES (48,'Importa Anúncio Shopee','import-shopee-item',0);

ALTER TABLE meuml.process_items DROP CONSTRAINT fk_process_items_account_id;

CREATE TABLE shopee.advertisings (
	id bigint NOT NULL,
	account_id bigint NOT NULL,
	external_id varchar NOT NULL,
	item_sku varchar NULL,
	status varchar NULL,
	name varchar NULL,
	description varchar NULL,
	images varchar NULL,
	currency varchar NULL,
	has_variation boolean NULL,
	price numeric(15,2) NULL,
	stock integer NULL,
	create_time timestamp NULL,
	update_time timestamp NULL,
	weight numeric(15,2) NULL,
	category_id bigint NULL,
	original_price numeric(15,2) NULL,
	rating_star numeric(3,2),
	cmt_count integer NULL,
	sales integer NULL,
	views integer NULL,
	likes integer NULL,
	package_length numeric(15,2) NULL,
	package_width numeric(15,2) NULL,
	package_height numeric(15,2) NULL,
	days_to_ship integer NULL,
	size_chart varchar NULL,
	condition varchar NULL,
	discount_id integer NULL,
	is_2tier_item boolean NULL,
	tenures varchar NULL,
	reserved_stock integer NULL,
	is_pre_order boolean NULL,
	inflated_price numeric(15,2) NULL,
	inflated_original_price numeric(15,2) NULL,
	sip_item_price numeric(15,2) NULL,
	price_source varchar NULL,
	wholesales jsonb NULL,
	
	CONSTRAINT shopee_advertisings_account_fk FOREIGN KEY (account_id) REFERENCES shopee.accounts(id),
	CONSTRAINT shopee_advertisings_pk PRIMARY KEY (id)
);

CREATE TABLE shopee_stage.item_variations (
	item_id bigint NOT NULL,
	account_id bigint NOT NULL,
	external_data jsonb NULL,
	CONSTRAINT shopee_stage_item_variations_pk PRIMARY KEY (item_id, account_id)
)
PARTITION BY LIST (account_id);

-- CREATE TABLE shopee_stage.item_attributes (
-- 	item_id bigint NOT NULL,
-- 	account_id bigint NOT NULL,
-- 	external_data jsonb NULL,
-- 	CONSTRAINT shopee_stage_item_attributes_pk PRIMARY KEY (item_id, account_id)
-- )
-- PARTITION BY LIST (account_id);

-- CREATE TABLE shopee_stage.item_logistics (
-- 	item_id bigint NOT NULL,
-- 	account_id bigint NOT NULL,
-- 	external_data jsonb NULL,
-- 	CONSTRAINT shopee_stage_item_logistics_pk PRIMARY KEY (item_id, account_id)
-- )
-- PARTITION BY LIST (account_id);

CREATE TABLE shopee.variations (
	variation_id bigint NOT NULL,
	advertising_id bigint NOT NULL,
	variation_sku varchar NULL,
	name varchar NULL,
	price numeric(15,2) NULL,
	stock integer NULL,
	status varchar NULL,
	create_time timestamp NULL,
	update_time timestamp NULL,
	original_price numeric(15,2) NULL,
	discount_id integer NULL,
	reserved_stock integer NULL,
	inflated_price numeric(15,2) NULL,
	inflated_original_price numeric(15,2) NULL,
	sip_item_price numeric(15,2) NULL,
	price_source varchar NULL,
	
	CONSTRAINT shopee_variations_advertisings_fk FOREIGN KEY (advertising_id) REFERENCES shopee.advertisings(id) ON DELETE CASCADE,
	CONSTRAINT shopee_variations_pk PRIMARY KEY (variation_id)
);

-- CREATE TABLE shopee.attributes (
-- 	attribute_id bigint NOT NULL,
-- 	advertising_id bigint NOT NULL,
-- 	attribute_name varchar NULL,
-- 	is_mandatory boolean NULL,
-- 	attribute_type varchar NULL,
-- 	attribute_value varchar NULL,
	
-- 	CONSTRAINT shopee_attributes_advertisings_fk FOREIGN KEY (advertising_id) REFERENCES shopee.advertisings(id) ON DELETE CASCADE,
-- 	CONSTRAINT shopee_attributes_pk PRIMARY KEY (attribute_id)
-- );

-- CREATE TABLE shopee.logistics (
-- 	logistic_id bigint NOT NULL,
-- 	advertising_id bigint NOT NULL,
-- 	logistic_name varchar NULL,
-- 	enabled boolean NULL,
-- 	shipping_fee varchar NULL,
-- 	size_id varchar NULL,
-- 	is_free boolean NULL,
-- 	estimated_shipping_fee numeric(15,2) NULL,

-- 	CONSTRAINT shopee_logistics_advertisings_fk FOREIGN KEY (advertising_id) REFERENCES shopee.advertisings(id) ON DELETE CASCADE,
-- 	CONSTRAINT shopee_logistics_pk PRIMARY KEY (logistic_id)
-- );
