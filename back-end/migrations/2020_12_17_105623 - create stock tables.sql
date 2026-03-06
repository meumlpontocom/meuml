CREATE SCHEMA stock AUTHORIZATION postgres;


CREATE TABLE stock.warehouses (
	id serial primary key,
	user_id integer NULL,
	"name" varchar NULL,
	code varchar NULL, 
	CONSTRAINT warehouses_user_id
      FOREIGN KEY(user_id) 
	  REFERENCES meuml.users(id)
);
CREATE INDEX warehouses_user_id_idx ON stock.warehouses USING btree (user_id);


CREATE TABLE stock.article_variation (
	id bigserial PRIMARY KEY,
	user_id int8 NOT NULL,
	date_created timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	parent_sku varchar NULL,
	CONSTRAINT article_user_id
      FOREIGN KEY(user_id) 
	  REFERENCES meuml.users(id)
);
CREATE INDEX article_variation_user_id_idx ON stock.article_variation USING btree (user_id);


CREATE TABLE stock.article (
	id bigserial NOT NULL,
	user_id int8 NOT NULL,
	parent_id int8 NULL,
	"name" varchar NOT NULL,
	sku varchar NULL,
	description varchar NULL,
	date_created timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT article_pk PRIMARY KEY (id), 
	CONSTRAINT article_user_id
      FOREIGN KEY(user_id) 
	  REFERENCES meuml.users(id),
	CONSTRAINT article_parent_id
      FOREIGN KEY(parent_id) 
	  REFERENCES stock.article_variation(id)
);
CREATE INDEX article_sku_idx ON stock.article USING btree (sku);
CREATE INDEX article_user_id_idx ON stock.article USING btree (user_id);
CREATE INDEX article_parent_id_idx ON stock.article USING btree (parent_id);


CREATE TABLE stock.article_attr (
	id bigserial NOT NULL,
	date_created timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	article_id int8 NOT NULL,
	field varchar NULL,
	value varchar NULL,
	CONSTRAINT article_attr_pk PRIMARY KEY (id)
);
CREATE INDEX article_attr_article_id_idx ON stock.article_attr USING btree (article_id);
ALTER TABLE stock.article_attr ADD CONSTRAINT article_attr_fk FOREIGN KEY (article_id) REFERENCES stock.article(id) ON DELETE CASCADE;


CREATE TABLE stock.stock (
	id serial NOT NULL,
	article_id int8 NOT NULL,
	qtd_total int8 NOT NULL DEFAULT 0,
	qtd_available int8 NULL DEFAULT 0,
	qtd_reserved int8 NULL DEFAULT 0,
	date_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT stock_pk PRIMARY KEY (id)
);
CREATE INDEX stock_article_id_idx ON stock.stock USING btree (article_id);
ALTER TABLE stock.stock ADD CONSTRAINT stock_fk FOREIGN KEY (article_id) REFERENCES stock.article(id) ON DELETE CASCADE;


CREATE TABLE stock.stock_in (
	id serial NOT NULL,
	article_id int8 NOT NULL,
    warehouse_id int4 NULL,
	quantity int4 NOT NULL,
	price_buy numeric(15,2) NULL,
	expiration_date date NULL,
	buy_id int8 NULL,
	date_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT stock_in_pk PRIMARY KEY (id)
);
CREATE INDEX stock_in_article_id_idx ON stock.stock_in USING btree (article_id);
CREATE INDEX stock_in_warehouse_id_idx ON stock.stock_in USING btree (warehouse_id);
ALTER TABLE stock.stock_in ADD CONSTRAINT stock_in_fk FOREIGN KEY (article_id) REFERENCES stock.article(id) ON DELETE CASCADE;
ALTER TABLE stock.stock_in ADD CONSTRAINT stock_in_warehouse_id FOREIGN KEY (warehouse_id) REFERENCES stock.warehouses(id);


CREATE TABLE stock.stock_item (
	id serial NOT NULL,
	stock_id int8 NOT NULL,
    warehouse_id int4 NULL,
	quantity int8 NOT NULL,
	expiration_date date NULL,
	price_buy numeric(15,2) NULL,
	date_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	
	CONSTRAINT stock_item_pk PRIMARY KEY (id)
);
CREATE INDEX stock_item_stock_id_idx ON stock.stock_item USING btree (stock_id);
CREATE INDEX stock_item_warehouse_id_idx ON stock.stock_item USING btree (warehouse_id);
ALTER TABLE stock.stock_item ADD CONSTRAINT stock_in_warehouse_id FOREIGN KEY (warehouse_id) REFERENCES stock.warehouses(id);
ALTER TABLE stock.stock_item ADD CONSTRAINT stock_item_fk FOREIGN KEY (stock_id) REFERENCES stock.stock(id) ON DELETE CASCADE;


CREATE TABLE stock.stock_out (
	id serial NOT NULL,
	article_id int8 NOT NULL,
    warehouse_id int4 NULL,
	quantity int4 NOT NULL,
	price_sell numeric(15,2) NOT NULL,
	expiration_date date NULL,
	sell_id int8 NULL,
	date_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT stock_out_pk PRIMARY KEY (id)
);
CREATE INDEX stock_out_article_id_idx ON stock.stock_out USING btree (article_id);
CREATE INDEX stock_out_warehouse_id_idx ON stock.stock_out USING btree (warehouse_id);
ALTER TABLE stock.stock_out ADD CONSTRAINT stock_in_warehouse_id FOREIGN KEY (warehouse_id) REFERENCES stock.warehouses(id);
ALTER TABLE stock.stock_out ADD CONSTRAINT stock_out_fk FOREIGN KEY (article_id) REFERENCES stock.article(id) ON DELETE CASCADE;


CREATE TABLE stock.marketplaces (
	id serial primary key,
	"name" varchar NULL,
	abbreviation char(2) NULL
);
INSERT INTO stock.marketplaces ("name",abbreviation)
	VALUES ('Mercado Livre','ML');
INSERT INTO stock.marketplaces ("name",abbreviation)
	VALUES ('Shopee','SP');
INSERT INTO stock.marketplaces ("name",abbreviation)
	VALUES ('Venda pessoal','VP');
INSERT INTO stock.marketplaces ("name",abbreviation)
	VALUES ('Loja própria','LP');


CREATE TABLE stock.account_warehouse (
	id serial primary key,
	date_created timestamp default CURRENT_TIMESTAMP,
	date_modified timestamp default CURRENT_TIMESTAMP,
	user_id integer,
	marketplace_id integer,
	account_id bigint,
	warehouse_id integer, 
	CONSTRAINT account_warehouse_user_id
      FOREIGN KEY(user_id) 
	  REFERENCES meuml.users(id), 
	CONSTRAINT account_warehouse_marketplace_id
      FOREIGN KEY(marketplace_id) 
	  REFERENCES stock.marketplaces(id), 
	CONSTRAINT account_warehouse_warehouse_id
      FOREIGN KEY(warehouse_id) 
	  REFERENCES stock.warehouses(id)
);
CREATE INDEX account_warehouse_user_id_idx ON stock.account_warehouse USING btree (user_id);
CREATE INDEX account_warehouse_account_id_idx ON stock.account_warehouse USING btree (account_id);
CREATE INDEX account_warehouse_warehouse_id_idx ON stock.account_warehouse USING btree (warehouse_id);
