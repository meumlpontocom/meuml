DROP TABLE IF EXISTS meuml.order_items;
DROP TABLE IF EXISTS meuml.order_messages;
DROP TABLE IF EXISTS meuml.order_shipments;
DROP TABLE IF EXISTS meuml.order_payments;
DROP TABLE IF EXISTS meuml.orders;


CREATE TABLE meuml.orders (
	id bigint NOT NULL,
	account_id bigint NOT NULL,
	status varchar NULL,
	status_detail varchar NULL,
	comments varchar NULL,
	fullfilled boolean NULL,
	pickup_id bigint NULL,
	paid_amount numeric(22,2) NULL,
	total_amount numeric(22,2) NULL,
	total_amount_with_shipping numeric(22,2) NULL,
	date_created timestamp NULL,
	last_updated timestamp NULL,
	date_closed timestamp NULL,
	expiration_date timestamp NULL,
	date_last_updated timestamp NULL,
	manufacturing_ending_date timestamp NULL,
	buyer_id bigint NULL,
	buyer_nickname varchar NULL,
	buyer_first_name varchar NULL,
	buyer_last_name varchar NULL,
	feedback_sale_id bigint NULL,
	feedback_sale_rating varchar NULL,
	feedback_sale_status varchar NULL,
	feedback_sale_fulfilled boolean NULL,
	feedback_sale_date timestamp NULL,
	feedback_purchase_id bigint NULL,
	feedback_purchase_rating varchar NULL,
	feedback_purchase_status varchar NULL,
	feedback_purchase_fulfilled boolean NULL,
	feedback_purchase_date timestamp NULL,
	CONSTRAINT orders_account_fk FOREIGN KEY (account_id) REFERENCES meuml.accounts(id),
	CONSTRAINT orders_pk PRIMARY KEY (id, date_created)
)
PARTITION BY RANGE (date_created);


CREATE TABLE meuml.order_payments (
	id bigint NOT NULL,
	order_id bigint NOT NULL,
	order_date_created timestamp NOT NULL,
	account_id bigint NOT NULL,
	payer_id bigint NOT NULL,
	date_created timestamp NULL,
	date_last_modified timestamp NULL,
	date_approved timestamp NULL,
	status varchar NULL,
	status_detail varchar NULL,
	payment_type varchar NULL,
	payment_method_id varchar NULL,
	card_id varchar NULL,
	total_paid_amount numeric(22,2) NULL,
	shipping_cost numeric(22,2) NULL,
	installments integer NULL,
	installment_amount numeric(22,2) NULL,
	transaction_amount numeric(22,2) NULL,
	overpaid_amount numeric(22,2) NULL,
	CONSTRAINT order_payments_order_fk FOREIGN KEY (order_id, order_date_created) REFERENCES meuml.orders(id, date_created),
	CONSTRAINT order_payments_account_fk FOREIGN KEY (account_id) REFERENCES meuml.accounts(id),
	CONSTRAINT order_payments_pk PRIMARY KEY (id, date_created)
)
PARTITION BY RANGE (date_created);


CREATE TABLE meuml.order_shipments (
	id bigint NOT NULL,
	order_id bigint NOT NULL,
	order_date_created timestamp NOT NULL,
	account_id bigint NOT NULL,
	date_created timestamp NULL,
	last_updated timestamp NULL,
	mode varchar NULL,
	status varchar NULL,
	substatus varchar NULL,
	type varchar NULL,
	logistic_type varchar NULL,
	tracking_method varchar NULL,
  	tracking_number varchar NULL,
	comments text NULL,
	base_cost numeric(22,2) NULL,
	date_shipped timestamp NULL,
    date_handling timestamp NULL,
    date_returned timestamp NULL,
    date_cancelled timestamp NULL,
    date_delivered timestamp NULL,
    date_first_visit timestamp NULL,
    date_not_delivered timestamp NULL,
    date_ready_to_ship timestamp NULL,
	shipping_option_id bigint NULL,
    shipping_option_cost numeric(22,2) NULL,
    shipping_option_name varchar NULL,
    list_cost numeric(22,2),
	estimated_delivery_time_from timestamp NULL,
	estimated_delivery_time_to timestamp NULL,
	receiver_id	bigint NULL,
	receiver_name varchar NULL,
	receiver_zip_code varchar NULL,
	receiver_street_name varchar NULL,
	receiver_street_number varchar NULL,
	receiver_city varchar NULL,
	receiver_state varchar NULL,
	receiver_country varchar NULL,
	substatus_history jsonb NULL,
	CONSTRAINT order_shipments_order_fk FOREIGN KEY (order_id, order_date_created) REFERENCES meuml.orders(id, date_created),
	CONSTRAINT order_shipments_account_fk FOREIGN KEY (account_id) REFERENCES meuml.accounts(id),
	CONSTRAINT order_shipments_pk PRIMARY KEY (id, date_created)
)
PARTITION BY RANGE (date_created);


CREATE TABLE meuml.order_messages (
	id bigint NOT NULL,
	order_id bigint NOT NULL,
	order_date_created timestamp NOT NULL,
	account_id bigint NOT NULL,
	client_id bigint NULL,
	from_user_id bigint NULL,
	from_email varchar NULL,
	from_name varchar NULL,
	status varchar NULL,
	text text NULL,
	date_created timestamp NULL,
	date_available timestamp NULL,
	date_received timestamp NULL,
	date_notified timestamp NULL,
	date_read timestamp NULL,
	moderation_status varchar NULL,
	moderation_reason varchar NULL,
	moderation_date timestamp NULL,
	moderation_by varchar NULL,
	message_attachments jsonb NULL,
	CONSTRAINT order_messages_order_fk FOREIGN KEY (order_id, order_date_created) REFERENCES meuml.orders(id, date_created),
	CONSTRAINT order_messages_account_fk FOREIGN KEY (account_id) REFERENCES meuml.accounts(id),
	CONSTRAINT order_messages_pk PRIMARY KEY (id, date_created)
)
PARTITION BY RANGE (date_created);


CREATE TABLE meuml.order_items (
	id varchar NOT NULL, 
	order_id bigint NOT NULL,
	order_date_created timestamp NOT NULL, 
	account_id bigint NOT NULL, 
	dimensions varchar NULL, 
	description text NULL,
	title varchar NULL,
	warranty varchar NULL,
	condition varchar NULL,
	seller_sku varchar NULL,
	category_id varchar NULL,
	variation_id bigint NULL,
	seller_custom_field varchar NULL,
	variation_attributes jsonb NULL,
	quantity integer NULL,
	sale_fee numeric(22,2) NULL,
	unit_price numeric(22,2) NULL,
	currency_id varchar NULL,
	full_unit_price numeric(22,2) NULL,
	listing_type_id varchar NULL,
	manufacturing_days varchar NULL,
	CONSTRAINT order_items_order_fk FOREIGN KEY (order_id, order_date_created) REFERENCES meuml.orders(id, date_created),
	CONSTRAINT order_items_account_fk FOREIGN KEY (account_id) REFERENCES meuml.accounts(id),
	CONSTRAINT order_items_pk PRIMARY KEY (id, order_id, order_date_created)
)
PARTITION BY RANGE (order_date_created);


CREATE INDEX order_account_id_idx ON meuml.orders (account_id);

CREATE INDEX order_payments_account_id_idx ON meuml.order_payments (account_id);
CREATE INDEX order_shipments_account_id_idx ON meuml.order_shipments (account_id);
CREATE INDEX order_messages_account_id_idx ON meuml.order_messages (account_id);
CREATE INDEX order_items_account_id_idx ON meuml.order_items (account_id);

CREATE INDEX order_payments_order_id_idx ON meuml.order_payments (order_id);
CREATE INDEX order_shipments_order_id_idx ON meuml.order_shipments (order_id);
CREATE INDEX order_messages_order_id_idx ON meuml.order_messages (order_id);
CREATE INDEX order_items_order_id_idx ON meuml.order_items (order_id);