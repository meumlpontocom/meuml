
ALTER TABLE meli_stage.order_items DROP CONSTRAINT order_items_staging_pkey;
ALTER TABLE meli_stage.order_items ADD CONSTRAINT order_items_pk PRIMARY KEY (id,account_id,order_id);


ALTER TABLE meli_stage.orders ADD stage_status integer NULL DEFAULT 0;
ALTER TABLE meli_stage.order_items ADD stage_status integer NULL DEFAULT 0;
ALTER TABLE meli_stage.order_messages ADD stage_status integer NULL DEFAULT 0;
ALTER TABLE meli_stage.order_payments ADD stage_status integer NULL DEFAULT 0;
ALTER TABLE meli_stage.order_shipments ADD stage_status integer NULL DEFAULT 0;

