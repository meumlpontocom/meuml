ALTER TABLE meli_stage.orders ALTER COLUMN order_id TYPE bigint USING order_id::bigint;
ALTER TABLE meli_stage.order_items ALTER COLUMN order_id TYPE bigint USING order_id::bigint;
ALTER TABLE meli_stage.order_messages ALTER COLUMN order_id TYPE bigint USING order_id::bigint;
ALTER TABLE meli_stage.order_payments ALTER COLUMN order_id TYPE bigint USING order_id::bigint;
ALTER TABLE meli_stage.order_shipments ALTER COLUMN order_id TYPE bigint USING order_id::bigint;

ALTER TABLE meli_stage.order_messages ALTER COLUMN id TYPE varchar USING id::varchar;
ALTER TABLE meuml.order_messages ALTER COLUMN id TYPE varchar USING id::varchar;

ALTER TABLE meuml.accounts ADD has_historical_orders bool NULL DEFAULT false;
