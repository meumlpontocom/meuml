INSERT INTO meuml.access_types
(id, title)
VALUES(1, 'Subscription');
INSERT INTO meuml.access_types
(id, title)
VALUES(2, 'Credits');
INSERT INTO meuml.access_types
(id, title)
VALUES(0, 'Free');


INSERT INTO meuml.tools
(id, date_created, date_modified, "name", "key", price, html)
VALUES(18, '2020-03-09 11:21:00.000', '2020-03-09 11:21:00.000', 'Apagar Pergunta', 'delete-question', 0.00, NULL);
INSERT INTO meuml.tools
(id, date_created, date_modified, "name", "key", price, html)
VALUES(19, '2020-03-09 11:21:00.000', '2020-03-09 11:21:00.000', 'Responder Pergunta', 'answer-question', 0.00, NULL);
INSERT INTO meuml.tools
(id, date_created, date_modified, "name", "key", price, html)
VALUES(20, '2020-03-09 11:21:00.000', '2020-03-09 11:21:00.000', 'Posicionamento Diário de Anúncios', 'advertisings-positions', 0.00, NULL);
INSERT INTO meuml.tools
(id, date_created, date_modified, "name", "key", price, html)
VALUES(21, '2020-03-09 11:21:00.000', '2020-03-09 11:21:00.000', 'Visitas Diárias de Anúncios', 'advertisings-visits', 0.00, NULL);
INSERT INTO meuml.tools
(id, date_created, date_modified, "name", "key", price, html)
VALUES(22, '2020-03-09 11:21:00.000', '2020-03-09 11:21:00.000', 'Visitas Diárias de Contas', 'accounts-visits', 0.00, NULL);
INSERT INTO meuml.tools
(id, date_created, date_modified, "name", "key", price, html)
VALUES(23, '2020-03-10 10:35:00.000', '2020-03-10 10:35:00.000', 'Operações Lista de Bloqueios', 'crud-blacklist-list', 0.00, NULL);
INSERT INTO meuml.tools
(id, date_created, date_modified, "name", "key", price, html)
VALUES(24, '2020-03-10 10:35:00.000', '2020-03-10 10:35:00.000', 'Desbloquear Usuário', 'unblock-user', 0.00, NULL);
INSERT INTO meuml.tools
(id, date_created, date_modified, "name", "key", price, html)
VALUES(25, '2020-03-10 10:35:00.000', '2020-03-10 10:35:00.000', 'Consultar Pesos e Dimensões', 'categories', 0.00, NULL);
INSERT INTO meuml.tools
(id, date_created, date_modified, "name", "key", price, html)
VALUES(26, '2020-03-10 10:35:00.000', '2020-03-10 10:35:00.000', 'Condições para Ganhar - Catálogo', 'price-to-win-catalog', 0.00, NULL);
INSERT INTO meuml.tools
(id, date_created, date_modified, "name", "key", price, html)
VALUES(27, '2020-03-10 10:35:00.000', '2020-03-10 10:35:00.000', 'Atualizar Conta', 'account-update', 0.00, NULL);
INSERT INTO meuml.tools
(id, date_created, date_modified, "name", "key", price, html)
VALUES(28, '2019-12-18 10:08:00.000', '2019-12-18 10:08:00.000', 'Alterar Status', 'alter-status', 0.00, NULL);
INSERT INTO meuml.tools
(id, date_created, date_modified, "name", "key", price, html)
VALUES(29, '2020-03-17 10:42:54.000', '2020-03-17 10:42:54.000', 'Visualizar Lista de Novidades', 'show-notices', 0.00, NULL);
INSERT INTO meuml.tools
(id, date_created, date_modified, "name", "key", price, html)
VALUES(30, '2020-03-17 10:42:54.000', '2020-03-17 10:42:54.000', 'Controle de Operações', 'process-control', 0.00, NULL);
INSERT INTO meuml.tools
(id, date_created, date_modified, "name", "key", price, html)
VALUES(31, '2020-04-16 10:32:18.000', '2020-04-16 10:32:18.000', 'Aplicar Desconto - Individual', 'apply-discount-single', 0.00, NULL);
INSERT INTO meuml.tools
(id, date_created, date_modified, "name", "key", price, html)
VALUES(32, '2020-04-16 10:32:18.000', '2020-04-16 10:32:18.000', 'Remover Desconto - Individual', 'remove-discount-single', 0.00, NULL);
INSERT INTO meuml.tools
(id, date_created, date_modified, "name", "key", price, html)
VALUES(33, '2020-04-16 10:32:18.000', '2020-04-16 10:32:18.000', 'Alterar Preço do Anúncio - Individual', 'modify-advertising-price-single', 0.00, NULL);
INSERT INTO meuml.tools
(id, date_created, date_modified, "name", "key", price, html)
VALUES(34, '2020-04-16 10:32:18.000', '2020-04-16 10:32:18.000', 'Substituir Descrição de Texto - Individual', 'replace-description-single', 0.00, NULL);
INSERT INTO meuml.tools
(id, date_created, date_modified, "name", "key", price, html)
VALUES(35, '2020-04-16 10:32:18.000', '2020-04-16 10:32:18.000', 'Alterar Texto Fixo de Descrição - Individual', 'alter-fixed-description-single', 0.00, NULL);
INSERT INTO meuml.tools
(id, date_created, date_modified, "name", "key", price, html)
VALUES(36, '2020-04-16 10:32:18.000', '2020-04-16 10:32:18.000', 'Alterar Cabeçalho e Rodapé Descrição - Individual', 'alter-header-footer-single', 0.00, NULL);
INSERT INTO meuml.tools
(id, date_created, date_modified, "name", "key", price, html)
VALUES(37, '2020-04-16 10:32:18.000', '2020-04-16 10:32:18.000', 'Publicar Catálogo - Individual', 'publish-catalog-single', 0.00, NULL);
-- Auto-generated SQL script #202004271059
INSERT INTO meuml.tools (id,date_created,date_modified,"name","key",price)
	VALUES (40,'2019-12-18 10:08:00.000','2019-12-18 10:08:00.000','Alterar Status - Individual','alter-status-single',0.00);



INSERT INTO meuml.packages
(id, date_created, date_modified, title, price)
VALUES(1, '2020-03-17 10:22:28.779', '2020-03-17 10:22:28.779', 'Gratuito', 0.00);
INSERT INTO meuml.packages
(id, date_created, date_modified, title, price)
VALUES(2, '2020-03-17 10:22:28.881', '2020-03-17 10:22:28.881', 'Profissional', 24.90);


INSERT INTO meuml.modules
(id, date_created, date_modified, title, price)
VALUES(1, '2020-03-17 10:23:49.855', '2020-03-17 10:23:49.855', 'Contas', 0.00);
INSERT INTO meuml.modules
(id, date_created, date_modified, title, price)
VALUES(2, '2020-03-17 10:23:49.930', '2020-03-17 10:23:49.930', 'Novidades', 0.00);
INSERT INTO meuml.modules
(id, date_created, date_modified, title, price)
VALUES(3, '2020-03-17 10:23:49.947', '2020-03-17 10:23:49.947', 'Pesos e Dimensões', 0.00);
INSERT INTO meuml.modules
(id, date_created, date_modified, title, price)
VALUES(4, '2020-03-17 10:23:49.965', '2020-03-17 10:23:49.965', 'Processos', 0.00);
INSERT INTO meuml.modules
(id, date_created, date_modified, title, price)
VALUES(5, '2020-03-17 10:23:49.982', '2020-03-17 10:23:49.982', 'Bloqueios', 0.00);
INSERT INTO meuml.modules
(id, date_created, date_modified, title, price)
VALUES(6, '2020-03-17 10:24:54.752', '2020-03-17 10:24:54.752', 'Anúncios Em Massa', 14.90);
INSERT INTO meuml.modules
(id, date_created, date_modified, title, price)
VALUES(7, '2020-03-17 10:24:54.769', '2020-03-17 10:24:54.769', 'Posicionamento', 14.90);
INSERT INTO meuml.modules
(id, date_created, date_modified, title, price)
VALUES(8, '2020-03-17 10:24:54.795', '2020-03-17 10:24:54.795', 'Perguntas', 6.90);
INSERT INTO meuml.modules
(id, date_created, date_modified, title, price)
VALUES(9, '2020-04-16 10:32:18.000', '2020-04-16 10:32:18.000', 'Anúncios Individuais', 0.00);


INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(4, 30, 0);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(2, 29, 0);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(6, 28, 1);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(1, 27, 0);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(6, 26, 1);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(3, 25, 0);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(5, 24, 0);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(5, 23, 0);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(7, 22, 1);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(7, 21, 1);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(7, 20, 1);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(8, 19, 1);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(8, 18, 1);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(6, 17, 1);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(6, 16, 1);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(6, 15, 1);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(6, 14, 1);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(6, 13, 1);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(6, 12, 1);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(5, 11, 0);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(5, 10, 0);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(8, 9, 1);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(5, 8, 0);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(5, 7, 0);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(5, 6, 0);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(1, 5, 0);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(1, 4, 0);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(1, 3, 0);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(6, 2, 1);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(1, 1, 0);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(9, 31, 0);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(9, 32, 0);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(9, 33, 0);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(9, 34, 0);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(9, 35, 0);
INSERT INTO meuml.module_tasks
(module_id, tool_id, access_type)
VALUES(9, 36, 0);
-- Auto-generated SQL script #202004241415
INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (6,40,0);
INSERT INTO meuml.module_tasks (module_id,tool_id,access_type)
	VALUES (9,40,0);




INSERT INTO meuml.package_modules
(package_id, module_id)
VALUES(1, 1);
INSERT INTO meuml.package_modules
(package_id, module_id)
VALUES(1, 2);
INSERT INTO meuml.package_modules
(package_id, module_id)
VALUES(1, 3);
INSERT INTO meuml.package_modules
(package_id, module_id)
VALUES(1, 4);
INSERT INTO meuml.package_modules
(package_id, module_id)
VALUES(1, 5);
INSERT INTO meuml.package_modules
(package_id, module_id)
VALUES(2, 1);
INSERT INTO meuml.package_modules
(package_id, module_id)
VALUES(2, 2);
INSERT INTO meuml.package_modules
(package_id, module_id)
VALUES(2, 3);
INSERT INTO meuml.package_modules
(package_id, module_id)
VALUES(2, 4);
INSERT INTO meuml.package_modules
(package_id, module_id)
VALUES(2, 5);
INSERT INTO meuml.package_modules
(package_id, module_id)
VALUES(2, 6);
INSERT INTO meuml.package_modules
(package_id, module_id)
VALUES(2, 7);
INSERT INTO meuml.package_modules
(package_id, module_id)
VALUES(2, 8);
INSERT INTO meuml.package_modules
(package_id, module_id)
VALUES(1, 9);
INSERT INTO meuml.package_modules
(package_id, module_id)
VALUES(2, 9);


INSERT INTO meuml.gateways
(id, date_created, date_modified, title)
VALUES(1, '2020-03-19 11:54:31.685', '2020-03-19 11:54:31.685', 'PJBank');


INSERT INTO meuml.account_multiplier
(id, accounts, mutiplier)
VALUES(1, -1, 5.00);
INSERT INTO meuml.account_multiplier
(id, accounts, mutiplier)
VALUES(2, 1, 1.00);
INSERT INTO meuml.account_multiplier
(id, accounts, mutiplier)
VALUES(3, 2, 1.90);
INSERT INTO meuml.account_multiplier
(id, accounts, mutiplier)
VALUES(4, 3, 2.70);
INSERT INTO meuml.account_multiplier
(id, accounts, mutiplier)
VALUES(5, 4, 3.40);
INSERT INTO meuml.account_multiplier
(id, accounts, mutiplier)
VALUES(6, 5, 4.00);
