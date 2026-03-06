INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (81,'2021-07-09 09:36:20.000','2021-07-09 09:36:20.000','Controle de Estoque - Reduzir Estoque ML','article-decrease-stock-ml',0.00);
INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (82,'2021-07-09 09:36:20.000','2021-07-09 09:36:20.000','Controle de Estoque - Reduzir Estoque SP','article-decrease-stock-sp',0.00);

INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (14,81,3);
INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (14,82,3);

INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (83,'2021-07-23 13:08:24.000','2021-07-23 13:08:24.000','Controle de Estoque - Aumentar Estoque ML','article-increase-stock-ml',0.00);
INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (84,'2021-07-23 13:08:24.000','2021-07-23 13:08:24.000','Controle de Estoque - Aumentar Estoque SP','article-increase-stock-sp',0.00);

INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (14,83,3);
INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (14,84,3);

INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (85,'2021-07-23 13:08:24.000','2021-07-23 13:08:24.000','Controle de Estoque - Operações Gerais','article-operations',0.00);
INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (14,85,3);