CREATE TABLE historic.f_advertising_visits_hist (
	advertising_id varchar NOT NULL,
	data_id bigint NOT NULL,
	qtd_visitas bigint NOT NULL,
	account_id bigint NOT NULL,
    CONSTRAINT f_advertising_visits_hist_pk PRIMARY KEY (advertising_id, data_id)
) PARTITION BY RANGE (data_id);

CREATE INDEX f_advertising_visits_hist_account_id_idx ON historic.f_advertising_visits_hist USING btree (account_id);
CREATE INDEX f_advertising_visits_hist_data_id_idx ON historic.f_advertising_visits_hist USING btree (data_id);


CREATE TABLE historic.f_advertising_visits_hist_2018_1 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (1) TO (32);

CREATE TABLE historic.f_advertising_visits_hist_2018_2 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (32) TO (60);

CREATE TABLE historic.f_advertising_visits_hist_2018_3 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (60) TO (91);

CREATE TABLE historic.f_advertising_visits_hist_2018_4 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (91) TO (121);

CREATE TABLE historic.f_advertising_visits_hist_2018_5 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (121) TO (152);

CREATE TABLE historic.f_advertising_visits_hist_2018_6 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (152) TO (182);

CREATE TABLE historic.f_advertising_visits_hist_2018_7 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (182) TO (213);

CREATE TABLE historic.f_advertising_visits_hist_2018_8 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (213) TO (244);

CREATE TABLE historic.f_advertising_visits_hist_2018_9 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (244) TO (274);

CREATE TABLE historic.f_advertising_visits_hist_2018_10 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (274) TO (305);

CREATE TABLE historic.f_advertising_visits_hist_2018_11 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (305) TO (335);

CREATE TABLE historic.f_advertising_visits_hist_2018_12 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (335) TO (366);

CREATE TABLE historic.f_advertising_visits_hist_2019_1 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (366) TO (397);

CREATE TABLE historic.f_advertising_visits_hist_2019_2 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (397) TO (425);

CREATE TABLE historic.f_advertising_visits_hist_2019_3 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (425) TO (456);

CREATE TABLE historic.f_advertising_visits_hist_2019_4 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (456) TO (486);

CREATE TABLE historic.f_advertising_visits_hist_2019_5 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (486) TO (517);

CREATE TABLE historic.f_advertising_visits_hist_2019_6 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (517) TO (547);

CREATE TABLE historic.f_advertising_visits_hist_2019_7 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (547) TO (578);

CREATE TABLE historic.f_advertising_visits_hist_2019_8 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (578) TO (609);

CREATE TABLE historic.f_advertising_visits_hist_2019_9 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (609) TO (639);

CREATE TABLE historic.f_advertising_visits_hist_2019_10 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (639) TO (670);

CREATE TABLE historic.f_advertising_visits_hist_2019_11 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (670) TO (700);

CREATE TABLE historic.f_advertising_visits_hist_2019_12 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (700) TO (731);

CREATE TABLE historic.f_advertising_visits_hist_2020_1 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (731) TO (762);

CREATE TABLE historic.f_advertising_visits_hist_2020_2 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (762) TO (791);

CREATE TABLE historic.f_advertising_visits_hist_2020_3 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (791) TO (822);

CREATE TABLE historic.f_advertising_visits_hist_2020_4 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (822) TO (852);

CREATE TABLE historic.f_advertising_visits_hist_2020_5 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (852) TO (883);

CREATE TABLE historic.f_advertising_visits_hist_2020_6 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (883) TO (913);

CREATE TABLE historic.f_advertising_visits_hist_2020_7 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (913) TO (944);

CREATE TABLE historic.f_advertising_visits_hist_2020_8 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (944) TO (975);

CREATE TABLE historic.f_advertising_visits_hist_2020_9 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (975) TO (1005);

CREATE TABLE historic.f_advertising_visits_hist_2020_10 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (1005) TO (1036);

CREATE TABLE historic.f_advertising_visits_hist_2020_11 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (1036) TO (1066);

CREATE TABLE historic.f_advertising_visits_hist_2020_12 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (1066) TO (1097);

CREATE TABLE historic.f_advertising_visits_hist_2021_1 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (1097) TO (1128);

CREATE TABLE historic.f_advertising_visits_hist_2021_2 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (1128) TO (1156);

CREATE TABLE historic.f_advertising_visits_hist_2021_3 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (1156) TO (1187);

CREATE TABLE historic.f_advertising_visits_hist_2021_4 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (1187) TO (1217);

CREATE TABLE historic.f_advertising_visits_hist_2021_5 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (1217) TO (1248);

CREATE TABLE historic.f_advertising_visits_hist_2021_6 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (1248) TO (1278);

CREATE TABLE historic.f_advertising_visits_hist_2021_7 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (1278) TO (1309);

CREATE TABLE historic.f_advertising_visits_hist_2021_8 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (1309) TO (1340);

CREATE TABLE historic.f_advertising_visits_hist_2021_9 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (1340) TO (1370);

CREATE TABLE historic.f_advertising_visits_hist_2021_10 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (1370) TO (1401);

CREATE TABLE historic.f_advertising_visits_hist_2021_11 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (1401) TO (1431);

CREATE TABLE historic.f_advertising_visits_hist_2021_12 
partition OF historic.f_advertising_visits_hist 
FOR VALUES FROM (1431) TO (1462);