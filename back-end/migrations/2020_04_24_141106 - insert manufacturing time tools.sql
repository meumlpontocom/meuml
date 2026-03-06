INSERT INTO meuml.tools
(id, date_created, date_modified, name, "key", price, html)
VALUES(38, '2020-04-24 14:10:16.000', '2020-04-24 14:10:16.000', 'Alterar Prazo de Envio', 'alter-manufacturing-time', 0.00, NULL);
INSERT INTO meuml.tools
(id, date_created, date_modified, name, "key", price, html)
VALUES(39, '2020-04-24 14:10:16.000', '2020-04-24 14:10:16.000', 'Alterar Prazo de Envio - Individual', 'alter-manufacturing-time-single', 0.00, NULL);


-- Auto-generated SQL script #202004241415
INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (6,38,1);
INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (9,39,0);
