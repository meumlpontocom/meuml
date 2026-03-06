INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (71,'2021-05-26 10:38:21.000','2021-05-26 10:38:21.000','Controle de Estoque - Editar SKU','article-sku-edit',0.00);

INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (14,71,3);

ALTER TABLE stock.article ADD from_variation_id bigint NULL;
