-- Drop table

-- DROP TABLE meuml.images;

CREATE TABLE meuml.images (
	id varchar NULL,
	account_id int8 NULL,
	title varchar NULL,
	image_url text NULL,
	CONSTRAINT images_fk FOREIGN KEY (account_id) REFERENCES meuml.accounts(id) ON DELETE CASCADE
);

ALTER TABLE meuml.images ADD CONSTRAINT images_pk PRIMARY KEY (id);
