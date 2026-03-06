CREATE TABLE meuml.variations (
  id bigint primary key,
  date_created timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP,
  date_modified timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP,
  account_id bigint not null,
  advertising_id varchar not null,
  price numeric(12,2),
  available_quantity integer,
  sold_quantity integer,
  sku varchar,
  seller_custom_field varchar,
  catalog_product_id varchar,
  inventory_id varchar,
  attributes jsonb,
  attribute_combinations jsonb,
  item_relations jsonb,
  picture_ids jsonb,
  sale_terms jsonb,
  CONSTRAINT variations_account_id_fk FOREIGN KEY (account_id) REFERENCES meuml.accounts(id)
);

CREATE INDEX variations_account_id_idx ON meuml.variations USING btree (account_id);
CREATE INDEX variations_advertising_id_idx ON meuml.variations USING btree (advertising_id);


INSERT INTO meuml.variations
	(id, date_created, date_modified, account_id, advertising_id, price, available_quantity, 
	sold_quantity, sku, seller_custom_field, catalog_product_id, inventory_id, 	
	"attributes", attribute_combinations, item_relations, picture_ids, sale_terms)
SELECT 
	(variation ->> 'id')::bigint as id, 
	date_created,
	last_updated as date_modified,
	account_id, 
	advertising_id, 
	(variation ->> 'price')::numeric(12,2) as price, 
	(variation ->> 'available_quantity')::integer as available_quantity, 
	(variation ->> 'sold_quantity')::integer as sold_quantity, 
	(SELECT (jsonb_path_query(
        variation -> 'attributes', 
        '$[*] ? (@.id == "SELLER_SKU")'
        )->> 'value_name'
    )) as sku,
	variation ->> 'seller_custom_field' as seller_custom_field, 
	variation ->> 'catalog_product_id' as catalog_product_id, 
	variation ->> 'inventory_id' as inventory_id, 
	variation -> 'attributes' as "attributes", 
	variation -> 'attribute_combinations' as attribute_combinations, 
	variation -> 'item_relations' as item_relations, 
	variation -> 'picture_ids' as picture_ids, 
	variation -> 'sale_terms' as sale_terms
FROM ( 
	SELECT 
		it.item_id as advertising_id, 
		it.account_id,
		((it.external_data ->> 'date_created')::timestamp without time zone) as date_created, 
		((it.external_data ->> 'last_updated')::timestamp without time zone) as last_updated, 
		jsonb_array_elements(it.external_data -> 'variations') as variation 
	FROM meli_stage.items it 
	WHERE jsonb_array_length(it.external_data -> 'variations') > 0
) subquery;