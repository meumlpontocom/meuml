INSERT INTO meuml.tools
(id, date_created, date_modified, name, "key", price, html)
VALUES(44, '2020-06-16 14:33:39.814', '2020-06-16 14:33:39.814', 'Replicar Anúncios', 'duplicate-advertisings', 0.25, NULL);

INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (9,44,2);
