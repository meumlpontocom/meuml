ALTER TABLE meuml.internal_orders ADD client_id integer NULL;

ALTER TABLE meuml.internal_orders ADD CONSTRAINT internal_orders_clients_fk FOREIGN KEY (client_id) REFERENCES meuml.clients(id);
