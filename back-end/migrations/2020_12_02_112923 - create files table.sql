CREATE TABLE meuml.files (
	id bigserial primary key,
	date_created timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP,
	user_id integer NULL,
	parent_id bigint NULL,
	name varchar NULL,
    is_directory boolean NULL DEFAULT FALSE,
	content_type varchar NULL,
	"size" bigint NULL,
    path varchar NULL,
    url varchar NULL,
	thumbnail_url varchar NULL
);
ALTER TABLE meuml.files ADD CONSTRAINT files_fk FOREIGN KEY (parent_id) REFERENCES meuml.files(id) ON DELETE CASCADE;

CREATE INDEX files_user_id_idx ON meuml.files (user_id);
CREATE INDEX files_parent_id_idx ON meuml.files (parent_id);
CREATE INDEX files_id_idx ON meuml.files (cast(id AS varchar));

INSERT INTO meuml.taggable_relations (table_name,display_name)
	VALUES ('shopee.advertisings','Anúncios SP');
INSERT INTO meuml.taggable_relations (table_name,display_name)
	VALUES ('meuml.files','Arquivos');
