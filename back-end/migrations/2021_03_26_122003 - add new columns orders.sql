ALTER TABLE meuml.orders ADD taxes_currency_id varchar NULL;
ALTER TABLE meuml.orders ADD taxes_amount numeric(15,2) NULL;

ALTER TABLE meuml.order_shipments ADD lead_time_cost numeric(15,2) NULL;
ALTER TABLE meuml.order_shipments ADD carrier_name varchar NULL;
ALTER TABLE meuml.order_shipments ADD carrier_url varchar NULL;
