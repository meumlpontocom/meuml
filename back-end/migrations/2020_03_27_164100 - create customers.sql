-- meuml.customers definition

-- Drop table

-- DROP TABLE meuml.customers;

CREATE TABLE meuml.customers (
	id bigint NULL,
	external_name varchar(50) NULL,	
	registration_date timestamp(6) NULL,
	country_id varchar(2) NULL,
	state varchar(50) NULL,
	city varchar(50) NULL,
	user_type varchar(30) NULL,
	tags varchar(100) NULL,
	logo varchar(100) NULL,
	points int4 NULL,
	site_id varchar(3) NULL,
	permalink varchar(100) NULL,
	level_id varchar(50) NULL,
	power_seller_status varchar(50) NULL,
	seller_transactions_total int4 NULL,
	seller_transactions_canceled int4 NULL,
	seller_transactions_completed int4 NULL,
	seller_ratings_negative int4 NULL,
	seller_ratings_neutral int4 NULL,
	seller_ratings_positive int4 NULL,
	buyer_tags varchar(100) NULL,
	buyer_site_status varchar(30) NULL,
	CONSTRAINT customers_pkey PRIMARY KEY (id)
);
