-- Auto-generated SQL script #202005191602
INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (42,'2020-05-19 15:34:00.000','2020-05-19 15:34:00.000','Mercado Envios Flex','change-mercadoenvios-flex',0.00);
INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (43,'2020-05-19 15:34:00.000','2020-05-19 15:34:00.000','Mercado Envios Flex - Individual','change-mercadoenvios-flex-single',0.00);

INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (6,42,1);
INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (9,43,0);
