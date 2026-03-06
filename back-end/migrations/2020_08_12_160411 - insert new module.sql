INSERT INTO meuml.modules
(title, price)
VALUES('Gerenciador de Vendas', 14.90);

INSERT INTO meuml.tools ("name","key",price)
	VALUES ('Dashboard','dashboard',0);

INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (10,45,0);

INSERT INTO meuml.package_modules (package_id,module_id)
	VALUES (1,10);
