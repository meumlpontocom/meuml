INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (64,'2021-01-25 11:31:29.000','2021-01-25 11:31:29.000','Alterar Preço','alter-price-shopee',0);

INSERT INTO meuml.modules (id,date_created,date_modified,title,price)
	VALUES (12,'2021-01-25 17:08:11.000','2021-01-25 17:08:11.000','Anúncios Em Massa Shopee',19.90);

INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (12,64,1);

ALTER TABLE meuml.subscription_accounts DROP CONSTRAINT fk_subscriptions_accounts_account;
