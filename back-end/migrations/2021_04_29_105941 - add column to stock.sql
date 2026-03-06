ALTER TABLE stock.stock_out ADD marketplace_id integer NOT NULL;
ALTER TABLE stock.stock_out ADD CONSTRAINT stock_out_marketplace_fk FOREIGN KEY (marketplace_id) REFERENCES stock.marketplaces(id);
ALTER TABLE stock.stock_out ADD account_id bigint NULL;
ALTER TABLE stock.stock_out DROP COLUMN expiration_date;
ALTER TABLE stock.stock_out ALTER COLUMN sell_id TYPE varchar USING sell_id::varchar;
ALTER TABLE stock.stock_out ADD order_status varchar NULL;

ALTER TABLE stock.stock ADD CONSTRAINT stock_un UNIQUE (article_id);

ALTER TABLE stock.stock_item ADD qtd_total integer NULL;
ALTER TABLE stock.stock_item ADD qtd_available integer NULL;
ALTER TABLE stock.stock_item ADD qtd_reserved integer NULL;
ALTER TABLE stock.stock_item DROP COLUMN quantity;

CREATE TABLE stock.stock_out_item (
	id bigserial primary key,
	stock_out_id integer NULL,
	stock_item_id integer NULL,
	quantity integer NULL,
	CONSTRAINT stock_out_item_out_fk FOREIGN KEY (stock_out_id) REFERENCES stock.stock_out(id),
	CONSTRAINT stock_out_item_item_fk FOREIGN KEY (stock_item_id) REFERENCES stock.stock_item(id)
);

ALTER TABLE stock.article ADD CONSTRAINT article_un UNIQUE (user_id,sku);
ALTER TABLE stock.article ADD has_expiration_date boolean default false;

ALTER TABLE stock.stock_in ALTER COLUMN buy_id TYPE varchar USING buy_id::varchar;
