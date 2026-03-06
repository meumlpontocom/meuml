-- Drop table

-- DROP TABLE meuml.access_types;

CREATE TABLE meuml.access_types (
	id serial NOT NULL,
	title varchar(50) NULL,
	CONSTRAINT types_pkey PRIMARY KEY (id)
);


-- Drop table

-- DROP TABLE meuml.account_multiplier;

CREATE TABLE meuml.account_multiplier (
	id serial NOT NULL,
	accounts int2 NULL,
	mutiplier numeric(5,2) NULL,
	CONSTRAINT account_multiplier_pkey PRIMARY KEY (id)
);


-- Drop table

-- DROP TABLE meuml.credits;

CREATE TABLE meuml.credits (
	id serial NOT NULL,
	date_created timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	user_id int4 NULL,
	amount numeric(22,2) NULL,
	CONSTRAINT credits_pkey PRIMARY KEY (id),
	CONSTRAINT unique_user_id UNIQUE (user_id),
	CONSTRAINT fk_credits_users FOREIGN KEY (user_id) REFERENCES meuml.users(id)
);


-- Drop table

-- DROP TABLE meuml.modules;

CREATE TABLE meuml.modules (
	id serial NOT NULL,
	date_created timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	title varchar(50) NULL,
	price numeric(22,2) NULL,
	CONSTRAINT modules_pkey PRIMARY KEY (id)
);


-- Drop table

-- DROP TABLE meuml.packages;

CREATE TABLE meuml.packages (
	id serial NOT NULL,
	date_created timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	title varchar(50) NOT NULL,
	price numeric(22,2) NOT NULL,
	CONSTRAINT packages_pkey PRIMARY KEY (id)
);


-- Drop table

-- DROP TABLE meuml.package_modules;

CREATE TABLE meuml.package_modules (
	package_id int4 NOT NULL,
	module_id int4 NOT NULL,
	CONSTRAINT package_modules_pkey PRIMARY KEY (package_id, module_id),
	CONSTRAINT fk_package_modules_module FOREIGN KEY (module_id) REFERENCES meuml.modules(id),
	CONSTRAINT fk_package_modules_package FOREIGN KEY (package_id) REFERENCES meuml.packages(id)
);


-- Drop table

-- DROP TABLE meuml.module_tasks;

CREATE TABLE meuml.module_tasks (
	module_id int4 NOT NULL,
	tool_id int4 NOT NULL,
	access_type int4 NULL,
	CONSTRAINT module_tasks_pkey PRIMARY KEY (module_id, tool_id),
	CONSTRAINT fk_modules_tasks_access_type FOREIGN KEY (access_type) REFERENCES meuml.access_types(id) NOT VALID,
	CONSTRAINT fk_modules_tasks_module FOREIGN KEY (module_id) REFERENCES meuml.modules(id),
	CONSTRAINT fk_modules_tasks_tool FOREIGN KEY (tool_id) REFERENCES meuml.tools(id)
);


-- Drop table

-- DROP TABLE meuml.internal_orders;

CREATE TABLE meuml.internal_orders (
	id serial NOT NULL,
	user_id int4 NULL,
	accounts_id varchar(200) NULL,
	package_id int4 NULL,
	modules_id varchar(100) NULL,
	total_price numeric(22,2) NULL,
	access_type int4 NULL,
	date_created timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	renewals int4 NULL,
	renewed_subscription_id int4 NULL,
	CONSTRAINT internal_orders_pk PRIMARY KEY (id),
	CONSTRAINT internal_orders_fk FOREIGN KEY (user_id) REFERENCES meuml.users(id),
	CONSTRAINT internal_orders_fk_1 FOREIGN KEY (package_id) REFERENCES meuml.packages(id),
	CONSTRAINT internal_orders_fk_2 FOREIGN KEY (access_type) REFERENCES meuml.access_types(id)
);


-- Drop table

-- DROP TABLE meuml.gateways;

CREATE TABLE meuml.gateways (
	id serial NOT NULL,
	date_created timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	title varchar(100) NULL,
	CONSTRAINT gateways_pkey PRIMARY KEY (id)
);


-- Drop table

-- DROP TABLE meuml.credit_transactions;

CREATE TABLE meuml.credit_transactions (
	id serial NOT NULL,
	date_created timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	user_id int4 NOT NULL,
	process_item_id int4 NULL,
	amount numeric(22,2) NOT NULL,
	deposit bool NOT NULL,
	internal_order_id int4 NULL,
	CONSTRAINT credit_transactions_pkey PRIMARY KEY (id),
	CONSTRAINT fk_credit_transactions_internal_order FOREIGN KEY (internal_order_id) REFERENCES meuml.internal_orders(id),
	CONSTRAINT fk_credit_transactions_process_item FOREIGN KEY (process_item_id) REFERENCES meuml.process_items(id) NOT VALID,
	CONSTRAINT fk_credit_transactions_user FOREIGN KEY (user_id) REFERENCES meuml.users(id)
);


-- Drop table

-- DROP TABLE meuml.boleto_transactions;

CREATE TABLE meuml.boleto_transactions (
	id serial NOT NULL,
	date_created timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	user_id int4 NULL,
	internal_order_id int4 NULL,
	gateway_id int4 NULL,
	external_id varchar(50) NULL,
	amount numeric(22,2) NULL,
	expires_at timestamp NULL,
	status varchar(30) NULL,
	message varchar(200) NULL,
	finalized bool NULL DEFAULT false,
	url text NULL,
	CONSTRAINT boleto_transactions_pk PRIMARY KEY (id),
	CONSTRAINT boleto_transactions_fk FOREIGN KEY (user_id) REFERENCES meuml.users(id),
	CONSTRAINT boleto_transactions_fk_1 FOREIGN KEY (internal_order_id) REFERENCES meuml.internal_orders(id),
	CONSTRAINT boleto_transactions_fk_2 FOREIGN KEY (gateway_id) REFERENCES meuml.gateways(id)
);


-- Drop table

-- DROP TABLE meuml.creditcard_transactions;

CREATE TABLE meuml.creditcard_transactions (
	id serial NOT NULL,
	date_created timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	user_id int4 NULL,
	internal_order_id int4 NULL,
	gateway_id int4 NULL,
	external_id varchar(50) NULL,
	amount numeric(22,2) NULL,
	card_brand varchar(20) NULL,
	card_number_truncated varchar(20) NULL,
	card_token varchar(50) NULL,
	canceled bpchar(1) NULL,
	message varchar(200) NULL,
	authorized bpchar(1) NULL,
	CONSTRAINT creditcard_transactions_pk PRIMARY KEY (id),
	CONSTRAINT creditcard_transactions_fk FOREIGN KEY (user_id) REFERENCES meuml.users(id),
	CONSTRAINT creditcard_transactions_fk_1 FOREIGN KEY (internal_order_id) REFERENCES meuml.internal_orders(id),
	CONSTRAINT creditcard_transactions_fk_2 FOREIGN KEY (gateway_id) REFERENCES meuml.gateways(id)
);


-- Drop table

-- DROP TABLE meuml.subscriptions;

CREATE TABLE meuml.subscriptions (
	id serial NOT NULL,
	date_created timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	expiration_date timestamp NOT NULL,
	price numeric(22,2) NULL,
	modules varchar(100) NULL,
	package_id int4 NULL,
	user_id int4 NOT NULL,
	internal_order_id int4 NULL,
	CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
	CONSTRAINT fk_subscriptions_packages FOREIGN KEY (package_id) REFERENCES meuml.packages(id) NOT VALID,
	CONSTRAINT fk_subscriptions_users FOREIGN KEY (user_id) REFERENCES meuml.users(id) NOT VALID,
	CONSTRAINT subscriptions_fk FOREIGN KEY (internal_order_id) REFERENCES meuml.internal_orders(id)
);


-- Drop table

-- DROP TABLE meuml.subscription_accounts;

CREATE TABLE meuml.subscription_accounts (
	subscription_id int4 NOT NULL,
	account_id int8 NOT NULL,
	CONSTRAINT subscription_accounts_pkey PRIMARY KEY (subscription_id, account_id),
	CONSTRAINT fk_subscriptions_accounts_account FOREIGN KEY (account_id) REFERENCES meuml.accounts(id) ON DELETE CASCADE,
	CONSTRAINT fk_subscriptions_accounts_subscription FOREIGN KEY (subscription_id) REFERENCES meuml.subscriptions(id) ON DELETE CASCADE
);
