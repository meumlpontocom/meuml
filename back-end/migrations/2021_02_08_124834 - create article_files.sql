CREATE TABLE stock.article_images (
	id bigserial NOT NULL,
	date_created timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	article_id int8 NOT NULL,
	image_id int8 NOT NULL,
	is_main_image boolean DEFAULT false,
	CONSTRAINT article_images_pk PRIMARY KEY (id),
	CONSTRAINT shopee_stage_order_items_unique UNIQUE (article_id, image_id)
);
CREATE INDEX article_images_article_id_idx ON stock.article_images USING btree (article_id);
ALTER TABLE stock.article_images ADD CONSTRAINT article_images_article_fk FOREIGN KEY (article_id) REFERENCES stock.article(id) ON DELETE CASCADE;
ALTER TABLE stock.article_images ADD CONSTRAINT article_images_file_fk FOREIGN KEY (image_id) REFERENCES meuml.files(id) ON DELETE CASCADE;
