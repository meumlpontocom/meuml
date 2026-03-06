-- Drop table

-- DROP TABLE meuml.images_advertisings;

CREATE TABLE meuml.images_advertisings (
	image_id varchar NOT NULL,
	advertising_id varchar NOT NULL,
	account_id int8 NULL,
	CONSTRAINT images_advertisings_pk PRIMARY KEY (image_id, advertising_id)
);
