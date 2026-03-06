ALTER TABLE meuml.order_shipments ALTER COLUMN shipping_option_id TYPE varchar USING shipping_option_id::varchar;
