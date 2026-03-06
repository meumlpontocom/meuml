-- Auto-generated SQL script #202004271253
DELETE FROM meuml.module_tasks
	WHERE module_id=4 AND tool_id=30;


-- Auto-generated SQL script #202004271253
DELETE FROM meuml.tools
	WHERE id=30;


-- Auto-generated SQL script #202004271256
DELETE FROM meuml.package_modules
	WHERE package_id=1 AND module_id=4;
DELETE FROM meuml.package_modules
	WHERE package_id=2 AND module_id=4;


-- Auto-generated SQL script #202004271254
DELETE FROM meuml.modules
	WHERE id=4;
