CREATE TABLE meli_stage.webhooks_pjbank (
	id bigserial primary key,
	date_created timestamp(0) DEFAULT CURRENT_TIMESTAMP,
	internal_order_id varchar,
	"type" varchar,
	"data" jsonb
);
