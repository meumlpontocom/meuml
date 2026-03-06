INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (88,'2022-01-24 17:59:06.000','2022-01-24 17:59:06.000','Marcar Anúncio para Avaliação de Catálogo','evaluate-eligibility',0.00);
INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (89,'2022-01-24 17:59:06.000','2022-01-24 17:59:06.000','Marcar Anúncio para Avaliação de Catálogo - Individual','evaluate-eligibility-single',0.00);

INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (6,88,1);
INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (9,89,0);
