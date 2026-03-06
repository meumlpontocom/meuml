ALTER TABLE meuml.modules ADD user_module boolean NULL DEFAULT false;

UPDATE meuml.modules set user_module = false;

INSERT INTO meuml.access_types (id,title)
	VALUES (3,'User Subscription');

INSERT INTO meuml.modules (id,date_created,date_modified,title,price,platform,user_module)
	VALUES (13,'2021-02-12 09:51:49.000','2021-02-12 09:51:49.000','Armazenamento de Imagens',19.90,null,true);

INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (65,'2021-02-12 09:51:49.000','2021-02-12 09:51:49.000','Gerenciar Imagens','manage-images',0.00);

INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (13,65,3);
