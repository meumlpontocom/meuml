INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (86,'2022-01-24 17:59:06.000','2022-01-24 17:59:06.000','Associar Medidas - Anúncio','link-chart-advertisings',0.00);
INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (87,'2022-01-24 17:59:06.000','2022-01-24 17:59:06.000','Associar Medidas - Anúncio - Individual','link-chart-advertisings-single',0.00);

INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (6,86,1);
INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (9,87,0);
