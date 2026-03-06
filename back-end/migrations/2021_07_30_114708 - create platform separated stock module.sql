UPDATE meuml.modules
	SET platform='ML',user_module=false,title='Controle de Estoque ML'
	WHERE id=14;

UPDATE meuml.module_tasks
	SET access_type=1
	WHERE module_id=14 AND tool_id=71;
UPDATE meuml.module_tasks
	SET access_type=1
	WHERE module_id=14 AND tool_id=69;
UPDATE meuml.module_tasks
	SET access_type=1
	WHERE module_id=14 AND tool_id=70;
UPDATE meuml.module_tasks
	SET access_type=1
	WHERE module_id=14 AND tool_id=81;
UPDATE meuml.module_tasks
	SET access_type=1
	WHERE module_id=14 AND tool_id=82;
UPDATE meuml.module_tasks
	SET access_type=1
	WHERE module_id=14 AND tool_id=83;
UPDATE meuml.module_tasks
	SET access_type=1
	WHERE module_id=14 AND tool_id=84;
UPDATE meuml.module_tasks
	SET access_type=1
	WHERE module_id=14 AND tool_id=85;

INSERT INTO meuml.modules (id,date_created,date_modified,title,price,platform,user_module)
	VALUES (15,'2021-02-12 09:51:49.000','2021-02-12 09:51:49.000','Controle de Estoque SP',19.90,'SP',false);

INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (15,71,1);
INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (15,69,1);
INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (15,70,1);
INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (15,81,1);
INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (15,82,1);
INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (15,83,1);
INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (15,84,1);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(15, 85, 1);

DELETE FROM meuml.module_tasks
	WHERE module_id=15 AND tool_id=69;
DELETE FROM meuml.module_tasks
	WHERE module_id=14 AND tool_id=70;
DELETE FROM meuml.module_tasks
	WHERE module_id=15 AND tool_id=81;
DELETE FROM meuml.module_tasks
	WHERE module_id=14 AND tool_id=82;
DELETE FROM meuml.module_tasks
	WHERE module_id=15 AND tool_id=83;
DELETE FROM meuml.module_tasks
	WHERE module_id=14 AND tool_id=84;
