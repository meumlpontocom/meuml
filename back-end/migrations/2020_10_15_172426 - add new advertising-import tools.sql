INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (50,'2019-07-30 20:07:09.000','2019-07-30 20:07:09.000','Importar Anúncio - Pausados','import-item-paused',0.00);
INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (51,'2019-07-30 20:07:09.000','2019-07-30 20:07:09.000','Importar Anúncio - Finalizados','import-item-closed',0.00);
INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (52,'2019-07-30 20:07:09.000','2019-07-30 20:07:09.000','Importar Anúncio - Outros','import-item-others',0.00);
UPDATE meuml.tools
	SET "name"='Importar Anúncio - Ativos'
	WHERE id=1;


ALTER TABLE meli_stage.items ADD status integer NULL;
CREATE INDEX items_status_idx ON ONLY meli_stage.items USING btree (status);
