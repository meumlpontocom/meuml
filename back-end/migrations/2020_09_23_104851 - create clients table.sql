
CREATE TABLE meuml.clients (
	id SERIAL, 
	user_id INTEGER NOT NULL,
    cpf_cnpj VARCHAR NOT NULL, 
    razao_social VARCHAR NULL,
    inscricao_municipal VARCHAR NULL,
    email VARCHAR NULL,
    descricao_cidade VARCHAR NULL,
    cep VARCHAR NULL,
    tipo_logradouro VARCHAR NULL,
    logradouro VARCHAR NULL,
    tipo_bairro VARCHAR NULL,
    codigo_cidade VARCHAR NULL,
    complemento VARCHAR NULL,
    estado VARCHAR NULL,
    numero VARCHAR NULL,
    bairro VARCHAR NULL,
	CONSTRAINT clients_user_fk FOREIGN KEY (user_id) REFERENCES meuml.users(id),
    CONSTRAINT clients_cnpf_cnpj_unq UNIQUE (cpf_cnpj),
	CONSTRAINT clients_pk PRIMARY KEY (id)
);
CREATE INDEX clients_user_idx ON meuml.clients USING btree (user_id);
CREATE INDEX clients_cpf_cnpj_idx ON meuml.clients USING btree (cpf_cnpj);
