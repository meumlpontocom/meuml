-- Drop table

-- DROP TABLE meuml.order_shipments;

CREATE TABLE meuml.order_shipments (
	id int8 NOT NULL,
	id_stage int4 NULL,
	order_id int8 NOT NULL,
	order_date_created timestamp NOT NULL,
	account_id int8 NOT NULL,
	pack_id int8 NULL,
	
	status varchar NULL,
	substatus varchar NULL,
	date_created timestamp NOT NULL,
	last_updated timestamp NULL,
	
	declared_value numeric(15,2) NULL,
	"height" integer NULL,
	"width" integer NULL,
	"length" integer NULL,
	"weight" integer NULL,
	
	"type" varchar NULL,
	"mode" varchar NULL,
	logistic_type varchar NULL,
	
	source_site_id varchar NULL,
	source_market_place varchar NULL,
	source_application_id varchar NULL,
	
	tracking_method varchar NULL,
	tracking_number varchar NULL,
	
	origin_type varchar NULL,
	sender_id bigint NULL,
	sender_address_id bigint NULL,
	sender_zip_code varchar NULL,
	sender_street_name varchar NULL,
	sender_street_number varchar NULL,
	sender_address_comment varchar NULL,
	sender_neighboorhood varchar NULL,
	sender_city varchar NULL,
	sender_state varchar NULL,
	sender_country varchar NULL,
	sender_latitude decimal(10,6) NULL,
	sender_longitude decimal(10,6) NULL,
	
	destination_type varchar NULL,
	receiver_id bigint NULL,
	receiver_name varchar NULL,
	receiver_phone varchar NULL,
	destination_comments varchar null,
	receiver_address_id bigint NULL,
	receiver_zip_code varchar NULL,
	receiver_street_name varchar NULL,
	receiver_street_number varchar NULL,
	receiver_address_comment varchar NULL,
	receiver_neighboorhood varchar NULL,
	receiver_city varchar NULL,
	receiver_state varchar NULL,
	receiver_country varchar NULL,
	receiver_latitude decimal(10,6) NULL,
	receiver_longitude decimal(10,6) NULL,
	delivery_preference varchar null,

	shipping_option_id bigint NULL,
	shipping_method_id integer NULL,
	shipping_method_name varchar NULL,
	shipping_method_type varchar NULL,
	shipping_method_deliver_to varchar NULL,
	lead_time_currency_id varchar NULL,
	"cost" numeric(15,2) NULL,
	list_cost numeric(15,2) NULL,
	cost_type varchar NULL,

	lead_time_service_id integer NULL,
	delivery_type varchar NULL,
	estimated_delivery_time_type varchar NULL,
	estimated_delivery_time_from timestamp NULL,
	estimated_delivery_time_unit varchar NULL,
	estimated_delivery_time_to timestamp NULL,
	estimated_delivery_time_to_shipping integer NULL,
	pay_before timestamp NULL,
	estimated_delivery_time_from_shipping integer NULL,
	estimated_delivery_time_from_handling integer NULL,

	carrier_name varchar NULL,
	carrier_url varchar NULL,
	history jsonb NULL,

	CONSTRAINT order_shipments_pk PRIMARY KEY (id),
	CONSTRAINT order_shipments_account_fk FOREIGN KEY (account_id) REFERENCES meuml.accounts(id),
	CONSTRAINT order_shipments_fk FOREIGN KEY (order_id) REFERENCES meuml.orders(id)
);
CREATE INDEX order_shipments_account_id_idx ON meuml.order_shipments USING btree (account_id);
CREATE INDEX order_shipments_order_id_idx ON meuml.order_shipments USING btree (order_id);
CREATE INDEX order_shipments_pack_id_idx ON meuml.order_shipments USING btree (pack_id);
