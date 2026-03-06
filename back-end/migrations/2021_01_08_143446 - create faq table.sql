ALTER TABLE meuml.users ADD is_admin boolean NULL DEFAULT false;

CREATE TABLE meuml.faq (
	id serial primary key,
	date_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    hide_question boolean DEFAULT FALSE,
    position smallint not null,
    question text NULL,
    answer text NULL,
    videol_url text NULL
);
