CREATE SCHEMA shopee AUTHORIZATION postgres;


CREATE TABLE shopee.accounts (
	id bigint NULL,
	user_id integer NULL,
	date_created timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	access_token varchar NULL,
	access_token_expires_in timestamp NULL,
	refresh_token varchar NULL,
	refresh_token_expires_in timestamp NULL,
	shop_name varchar NULL,
	country char(2) NULL,
	shop_description text NULL,
	videos varchar NULL,
	images varchar NULL,
	disable_make_offer smallint NULL,
	enable_display_unitno boolean NULL,
	item_limit integer NULL,
	status varchar NULL,
	installment_status smallint NULL,
	sip_a_shops jsonb NULL,
	is_cb boolean NULL,
	non_pre_order_dts integer NULL,
	auth_time timestamp NULL,
	expire_time timestamp NULL,
	internal_status smallint NULL,
    CONSTRAINT shopee_account_user_fk FOREIGN KEY (user_id) REFERENCES meuml.users(id),
    CONSTRAINT shopee_account_pk PRIMARY KEY (id)
);
