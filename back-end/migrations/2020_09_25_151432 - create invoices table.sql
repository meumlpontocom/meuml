CREATE TABLE meuml.invoices (
	id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL,
    internal_order_id INTEGER NULL,
    external_id VARCHAR NOT NULL,
    status VARCHAR NOT NULL,
    date_created timestamp NULL DEFAULT CURRENT_TIMESTAMP;
    date_modified timestamp NULL DEFAULT CURRENT_TIMESTAMP;
    CONSTRAINT invoices_client_fk FOREIGN KEY (client_id) REFERENCES meuml.clients(id),
    CONSTRAINT invoices_internal_order_fk FOREIGN KEY (internal_order_id) REFERENCES meuml.internal_orders(id)
);
CREATE INDEX invoices_client_idx ON meuml.invoices USING btree (client_id);
CREATE INDEX invoices_internal_order_idx ON meuml.invoices USING btree (internal_order_id);

