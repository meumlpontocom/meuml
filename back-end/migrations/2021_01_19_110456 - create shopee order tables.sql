INSERT INTO meuml.tools
(id, date_created, date_modified, name, "key", price, html)
VALUES(63, '2021-01-19 11:04:56', '2021-01-19 11:04:56', 'Importar Vendas Shopee', 'import-shopee-orders', 0.00, NULL);


CREATE TABLE shopee_stage.orders (
	order_id varchar NOT NULL,
	account_id int8 NOT NULL,
	date_created timestamp DEFAULT CURRENT_TIMESTAMP,
	external_data jsonb NULL,
	CONSTRAINT shopee_stage_orders_pk PRIMARY KEY (order_id, account_id)
)
PARTITION BY LIST (account_id);


CREATE TABLE shopee_stage.order_items (
	order_id varchar NOT NULL,
	account_id int8 NOT NULL,
    item_id int8 NOT NULL,
	variation_id int8 NULL,
	date_created timestamp DEFAULT CURRENT_TIMESTAMP,
	external_data jsonb NULL,
    CONSTRAINT shopee_stage_order_items_unique UNIQUE (order_id, account_id, item_id, variation_id)
)
PARTITION BY LIST (account_id);


CREATE TABLE shopee.orders (
	id varchar primary key,
    account_id bigint,
    create_time timestamp,
    update_time timestamp,
    country char(2),
    currency char(3),
    cod boolean,
    tracking_no varchar,
    days_to_ship integer, 
    recipient_address_name varchar,
    recipient_address_phone varchar,
    recipient_address_town varchar,
    recipient_address_district varchar,
    recipient_address_city varchar,
    recipient_address_state varchar,
    recipient_address_country char(2),
    recipient_address_zipcode varchar,
    recipient_address_full_address varchar,
    estimated_shipping_fee numeric(12,2),
    actual_shipping_cost numeric(12,2),
    total_amount numeric(12,2),
    escrow_amount numeric(12,2),
    order_status varchar,
    shipping_carrier varchar,
    payment_method varchar,
    goods_to_declare boolean,
    message_to_seller varchar,
    note varchar,
    note_update_time timestamp, 
    pay_time integer,
    dropshipper varchar,
    credit_card_number varchar,
    buyer_username varchar,
    dropshipper_phone varchar,
    ship_by_date integer,
    is_split_up boolean,
    buyer_cancel_reason varchar,
    cancel_by varchar,
    fm_tn varchar,
    cancel_reason varchar,
    escrow_tax numeric(12,2),
    is_actual_shipping_fee_confirmed boolean,
    buyer_cpf_id varchar,
    order_flag varchar,
    lm_tn varchar
);
CREATE INDEX orders_account_id_idx ON shopee.orders USING btree (account_id);


CREATE TABLE shopee.order_items (
    id bigserial primary key,
    order_id varchar,
    item_id bigint,
    item_name varchar,
    item_sku varchar,
    variation_id bigint,
    variation_name varchar,
    variation_sku varchar,
    variation_quantity_purchased integer,
    variation_original_price numeric(12,2),
    variation_discounted_price numeric(12,2),
    is_wholesale boolean,
    weight numeric(12,2),
    is_add_on_deal boolean,
    is_main_item boolean,
    add_on_deal_id integer,
    promotion_type varchar,
    promotion_id integer
);
CREATE INDEX order_items_order_id_idx ON shopee.order_items USING btree (order_id);
