INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (69,'2021-05-14 12:13:06.000','2021-05-14 12:13:06.000','Controle de Estoque - Importar Anúncios ML','article-import-mercadolibre',0.00);
INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (70,'2021-05-14 12:13:06.000','2021-05-14 12:13:06.000','Controle de Estoque - Importar Anúncios SP','article-import-shopee',0.00);

INSERT INTO meuml.modules (id,date_created,date_modified,title,price,user_module)
	VALUES (14,'2021-02-12 09:51:49.000','2021-02-12 09:51:49.000','Controle de Estoque',19.90,true);

INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (14,69,3);
INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (14,70,3);


ALTER TABLE meuml.advertisings ADD "attributes" jsonb NULL;

ALTER TABLE stock.stock ALTER COLUMN qtd_total DROP NOT NULL;
ALTER TABLE stock.stock ALTER COLUMN qtd_total SET DEFAULT 0;

ALTER TABLE stock.stock_in ALTER COLUMN quantity DROP NOT NULL;
ALTER TABLE stock.stock_in ALTER COLUMN quantity SET DEFAULT 0;

ALTER TABLE stock.stock_item ALTER COLUMN qtd_available SET DEFAULT 0;
ALTER TABLE stock.stock_item ALTER COLUMN qtd_reserved SET DEFAULT 0;
ALTER TABLE stock.stock_item ALTER COLUMN qtd_total SET DEFAULT 0;
