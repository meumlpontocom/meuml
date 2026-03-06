CREATE TABLE shopee.categories (
	id bigint primary key ,
	parent_id bigint NULL,
	"name" varchar NULL,
	has_children boolean NULL,
	days_to_ship_min integer NULL,
	days_to_ship_max integer NULL,
	is_supp_sizechart varchar NULL
);
