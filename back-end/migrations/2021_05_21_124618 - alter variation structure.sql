ALTER TABLE stock.article ADD is_parent boolean set default NULL;
ALTER TABLE stock.article ADD from_marketplace_id int NULL;
ALTER TABLE stock.article ADD from_advertising_id varchar NULL;

ALTER TABLE stock.article DROP CONSTRAINT article_parent_id;
update stock.article set parent_id = null;
ALTER TABLE stock.article ADD CONSTRAINT article_fk FOREIGN KEY (parent_id) REFERENCES stock.article(id) ON DELETE CASCADE;

drop table stock.article_variation;
