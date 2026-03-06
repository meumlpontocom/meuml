CREATE TABLE meuml.vacations (
	id serial PRIMARY KEY,
	date_created timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP,
	user_id int NULL,
	account_id bigint NULL,
	vacation_type int NULL,
	tag_id bigint NULL,
	tag_name varchar NULL,
	starts_at timestamp(0) NULL,
	ends_at timestamp(0) NULL,
	has_started bool NULL DEFAULT FALSE,
	has_finished bool NULL DEFAULT FALSE,
	switch_types bool NULL DEFAULT FALSE,
	pending_start bool NULL DEFAULT FALSE,
	pending_finish bool NULL DEFAULT FALSE,
	CONSTRAINT vacations_user_id
      FOREIGN KEY(user_id) 
	  REFERENCES meuml.users(id),
	CONSTRAINT vacations_account_id
      FOREIGN KEY(account_id) 
	  REFERENCES meuml.accounts(id)
);
COMMENT ON COLUMN meuml.vacations.vacation_type IS '1 - pausar / 2 - prazo de envio';

-- CREATE TABLE meuml.vacation_accounts (
-- 	id serial PRIMARY KEY,
-- 	vacation_id int,
-- 	account_id bigint,
-- 	CONSTRAINT vacation_accounts_vacation_id
--       FOREIGN KEY(vacation_id) 
-- 	  REFERENCES meuml.vacations(id) ON DELETE CASCADE, 
-- 	CONSTRAINT vacation_accounts_account_id
--       FOREIGN KEY(account_id) 
-- 	  REFERENCES meuml.accounts(id)
-- );

INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (58,'2020-12-10 10:21:39.000','2020-12-10 10:21:39.000','Ativar Modo Férias - aplicar tag Férias','vacation-apply-tag',0);

INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (6,58,1);

INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (59,'2020-12-10 10:21:39.000','2020-12-10 10:21:39.000','Ativar Modo Férias - pausar anúncios','vacation-pause',0.00);
INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (60,'2020-12-10 10:21:39.000','2020-12-10 10:21:39.000','Ativar Modo Férias - atualizar prazo de envio','vacation-manufacturing-time',0.00);

INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (61,'2020-12-10 10:21:39.000','2020-12-10 10:21:39.000','Desativar Modo Férias - ativar anúncios','vacation-unpause',0.00);
INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (62,'2020-12-10 10:21:39.000','2020-12-10 10:21:39.000','Desativar Modo Férias - remover prazo de envio','vacation-remove-manufacturing-time',0.00);

ALTER TABLE meuml.processes ADD related_id bigint NULL;
