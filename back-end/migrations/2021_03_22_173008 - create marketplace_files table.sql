CREATE TABLE meuml.marketplace_files (
	id serial NOT NULL,
	date_created timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP,
	platform bpchar(2) NULL,
	user_id int4 NULL,
	"name" varchar NULL,
	content_type varchar NULL,
	"size" int8 NULL,
	"path" varchar NULL,
	"url" varchar NULL,
	CONSTRAINT marketplace_files_pkey PRIMARY KEY (id)
);
CREATE INDEX marketplace_files_user_id_idx ON meuml.marketplace_files USING btree (user_id);
