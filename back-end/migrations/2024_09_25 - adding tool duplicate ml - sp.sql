INSERT INTO meuml.tools (id, name, key, price, date_created, date_modified)
	VALUES (92, 'Replicar Anúncios ML - SP', 'duplicate-advertisings-ml-sp', 0.25, NOW(), NOW());

INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (11,92,2);