CREATE TABLE meuml.promotion_types (
	id smallserial primary key,
    key varchar not null,
	name varchar not null,
);


INSERT INTO meuml.promotion_types ("key","name")
	VALUES ('DEAL','Campanhas tradicionais');
INSERT INTO meuml.promotion_types ("key","name")
	VALUES ('MARKETPLACE_CAMPAIGN','Campanhas com participação');
INSERT INTO meuml.promotion_types ("key","name")
	VALUES ('DOD','Oferta do dia');
INSERT INTO meuml.promotion_types ("key","name")
	VALUES ('LIGHTNING','Oferta relâmpago');
INSERT INTO meuml.promotion_types ("key","name")
	VALUES ('PRICE_DISCOUNT','Descontos individuais');
INSERT INTO meuml.promotion_types ("key","name")
	VALUES ('VOLUME','Desconto por volume');
INSERT INTO meuml.promotion_types ("key","name")
	VALUES ('PRE_NEGOTIATED','Desconto pré-acordado por item');


CREATE TABLE meuml.promotions (
	id bigserial primary key,
	date_created timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP,
	account_id bigint NULL,
	promotion_type_id smallint NULL,
    external_id varchar NULL,
	status varchar NULL,
	"name" varchar NULL,
	start_date timestamp(0) NULL,
	finish_date timestamp(0) NULL,
	deadline_date timestamp(0) NULL,
	benefits jsonb null,
	offers jsonb null,
	CONSTRAINT promotion_account_fk FOREIGN KEY (account_id) REFERENCES meuml.accounts(id),
	CONSTRAINT promotion_type_fk FOREIGN KEY (promotion_type_id) REFERENCES meuml.promotion_types(id)
);
CREATE INDEX promotion_account_id_idx ON meuml.promotions USING btree (account_id);
CREATE INDEX promotion_promotion_type_id_idx ON meuml.promotions USING btree (promotion_type_id);


CREATE TABLE meuml.promotion_advertisings (
	id bigserial primary key,
	account_id bigint NULL,
	promotion_id bigint NULL,
	advertising_id varchar null,
    offer_id varchar null,
	status varchar NULL,
	price numeric(9,2) null,
	original_price numeric(9,2) null,
	max_original_price numeric(9,2) null,
    meli_percentage numeric(5,2) null,
    seller_percentage numeric(5,2) null,
    stock_min smallint null,
    stock_max smallint null,
	start_date timestamp(0) NULL,
	end_date timestamp(0) NULL,
	CONSTRAINT promotion_advertisings_promotion_account_fk FOREIGN KEY (account_id) REFERENCES meuml.accounts(id),
	CONSTRAINT promotion_advertisings_promotion_fk FOREIGN KEY (promotion_id) REFERENCES meuml.promotions(id)
);
CREATE INDEX promotion_advertisings_account_id_idx ON meuml.promotion_advertisings USING btree (account_id);
CREATE INDEX promotion_advertisings_promotion_id_idx ON meuml.promotion_advertisings USING btree (promotion_id);
CREATE INDEX promotion_advertisings_advertising_id_idx ON meuml.promotion_advertisings USING btree (advertising_id);


INSERT INTO meuml.tools
(id, date_created, date_modified, "name", "key", price, html)
VALUES(72, '2021-06-04 12:13:58.000', '2021-06-04 12:13:58.000', 'Sincronizar Promoção', 'import-promotion', 0.00, NULL);

INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (73,'2021-06-07 12:13:58.000','2021-06-07 12:13:58.000','Remover Promoção','promotion-remove-item',0.00);
INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (74,'2021-06-07 12:13:58.000','2021-06-07 12:13:58.000','Aplicar Promoção','promotion-apply-item',0.00);
INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (75,'2021-06-07 12:13:58.000','2021-06-07 12:13:58.000','Remover Promoção - Individual','promotion-remove-item-single',0.00);
INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (76,'2021-06-07 12:13:58.000','2021-06-07 12:13:58.000','Aplicar Promoção - Individual','promotion-apply-item-single',0.00);

INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (6,73,1);
INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (6,74,1);
INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (9,75,0);
INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (9,76,0);
