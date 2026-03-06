CREATE TABLE meuml.phones (
	id serial primary key,
	date_created timestamp(0) DEFAULT CURRENT_TIMESTAMP,
	date_modified timestamp(0) DEFAULT CURRENT_TIMESTAMP,
	user_id integer,
	is_confirmed boolean default false,
	confirmation_code char(4),
	country_code varchar,
	area_code varchar,
	phone_number varchar,
	topics text[],
	CONSTRAINT phones_user_id FOREIGN KEY(user_id) REFERENCES meuml.users(id)
);
CREATE INDEX phones_user_id_idx ON meuml.phones USING btree (user_id);

INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (77,'2021-07-02 09:36:20.000','2021-07-02 09:36:20.000','Notificação WhatsApp - Autenticação ML','whatsapp-auth',0.00);
INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (78,'2021-07-02 09:36:20.000','2021-07-02 09:36:20.000','Notificação WhatsApp - Nova Venda','whatsapp-orders',0.00);
INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (79,'2021-07-02 09:36:20.000','2021-07-02 09:36:20.000','Notificação WhatsApp - Nova Mensagem Pós-Venda','whatsapp-order-messages',0.00);
INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (80,'2021-07-02 09:36:20.000','2021-07-02 09:36:20.000','Notificação WhatsApp - Nova Pergunta','whatsapp-questions',0.00);

INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (1,77,0);
INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (8,80,0);
INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (10,78,0);
INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (10,79,0);
