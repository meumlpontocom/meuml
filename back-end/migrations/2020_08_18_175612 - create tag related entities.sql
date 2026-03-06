create table meuml.taggable_relations (
	id serial primary key,
    table_name varchar not null,
	display_name varchar not null
);


INSERT INTO meuml.taggable_relations (table_name,display_name)
	VALUES ('meuml.advertisings','Anúncios');


create table meuml.tags (
	id bigserial primary key,
	user_id bigint not null,
	name varchar not null,
	CONSTRAINT tag_user_fk FOREIGN KEY (user_id) REFERENCES meuml.users(id)
);


create table meuml.tagged_items (
	id bigserial primary key,
	tag_id bigint,
	type_id integer,
	item_id varchar,
	CONSTRAINT tagged_relation_fk FOREIGN KEY (type_id) REFERENCES meuml.taggable_relations(id)
);


INSERT INTO meuml.tools (id,"name","key",price)
	VALUES (46,'Aplicar Tag','tag-items',0);
INSERT INTO meuml.tools (id,"name","key",price)
	VALUES (47,'Remover Tag','untag-items',0);


INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (6,46,0);
INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (6,47,0);
