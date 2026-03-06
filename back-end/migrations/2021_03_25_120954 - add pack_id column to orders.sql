ALTER TABLE meuml.orders ADD pack_id bigint NULL;
CREATE INDEX orders_pack_id_idx ON meuml.orders USING btree (pack_id);

ALTER TABLE meuml.order_items ADD pack_id bigint NULL;
CREATE INDEX order_items_pack_id_idx ON meuml.order_items USING btree (pack_id);

ALTER TABLE meuml.order_payments ADD pack_id bigint NULL;
CREATE INDEX order_payments_pack_id_idx ON meuml.order_payments USING btree (pack_id);

ALTER TABLE meuml.order_shipments ADD pack_id bigint NULL;
CREATE INDEX order_shipments_pack_id_idx ON meuml.order_shipments USING btree (pack_id);
