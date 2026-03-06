ALTER TABLE meuml.orders ADD buyer_doc_type varchar NULL;
ALTER TABLE meuml.orders ADD buyer_doc_number varchar NULL;
ALTER TABLE meuml.orders ADD buyer_phone_area varchar NULL;
ALTER TABLE meuml.orders ADD buyer_phone_number varchar NULL;
ALTER TABLE meuml.orders ADD buyer_email varchar NULL;
ALTER TABLE meuml.orders ADD buyer_points integer NULL;

ALTER TABLE meuml.order_shipments ADD receiver_phone varchar NULL;
