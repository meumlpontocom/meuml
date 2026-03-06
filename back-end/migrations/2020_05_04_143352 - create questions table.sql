-- Drop table

-- DROP TABLE meuml.questions;

CREATE TABLE meuml.questions (
	account_id int8 NOT NULL,
	unanswered_questions int4 NULL,
	CONSTRAINT questions_pk PRIMARY KEY (account_id),
	CONSTRAINT questions_fk FOREIGN KEY (account_id) REFERENCES meuml.accounts(id)
);
