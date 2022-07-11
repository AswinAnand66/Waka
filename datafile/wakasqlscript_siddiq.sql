INSERT INTO waka.lookup_name (lookup_type_id, company_id, lookup_name, display_name, seq, created_by) VALUES (5,1,'registered','registered',7,1); --Added Registered Company Address type in Lookup
Delete from waka.lookup_name where lookup_name_id = 6; -- Removed Office Category in Lookup

DROP TABLE IF EXISTS waka.roles;
CREATE TABLE waka.roles (
	role_id SERIAL PRIMARY KEY,
	role_name VARCHAR NOT NULL, 
	company_id INT NOT NULL REFERENCES waka.company(company_id) ON DELETE CASCADE,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ
);	

DROP TABLE IF EXISTS waka.role_module_mapping;
CREATE TABLE waka.role_module_mapping (
	rmm_id SERIAL PRIMARY KEY,
	role_id INT NOT NULL REFERENCES waka.roles(role_id) ON DELETE CASCADE,
	module_id INT NOT NULL REFERENCES waka.modules(module_id) ON DELETE CASCADE,
	sub_module_id INT NOT NULL REFERENCES waka.sub_modules(sub_module_id) ON DELETE CASCADE,
	view_role BOOLEAN NOT NULL DEFAULT FALSE,
	create_role BOOLEAN NOT NULL DEFAULT FALSE,
	update_role BOOLEAN NOT NULL DEFAULT FALSE,
	delete_role BOOLEAN NOT NULL DEFAULT FALSE,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ
);	

INSERT INTO waka.sub_modules (sub_module_name, module_id, created_on) VALUES 
('Invite Company', (SELECT module_id FROM waka.modules WHERE module_name = 'Company'), now()), 
('Invite Contact', (SELECT module_id FROM waka.modules WHERE module_name = 'Company'), now()),
('Stakeholders', (SELECT module_id FROM waka.modules WHERE module_name = 'SOP'), now()),
('Services', (SELECT module_id FROM waka.modules WHERE module_name = 'SOP'), now()),
('PO Booking', (SELECT module_id FROM waka.modules WHERE module_name = 'SOP'), now()),
('Documents', (SELECT module_id FROM waka.modules WHERE module_name = 'SOP'), now()),
('Carrier', (SELECT module_id FROM waka.modules WHERE module_name = 'SOP'), now()),
('Cargo Handling', (SELECT module_id FROM waka.modules WHERE module_name = 'SOP'), now()),
('Service Charges',(SELECT module_id FROM waka.modules WHERE module_name = 'SOP'), now()),
('Landing Cost', (SELECT module_id FROM waka.modules WHERE module_name = 'SOP'), now());

DROP TABLE IF EXISTS waka.module_permissions;
CREATE TABLE waka.module_permissions (
	mp_id SERIAL PRIMARY KEY,
	sub_module_id INT NOT NULL REFERENCES waka.sub_modules(sub_module_id) ON DELETE CASCADE,
	allowed_permission varchar[],
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ
);

INSERT INTO waka.module_permissions (sub_module_id, allowed_permission,created_by,created_on) VALUES 
((SELECT sub_module_id FROM waka.sub_modules WHERE sub_module_name = 'Roles'), ARRAY ['view','create','update','delete'],1,now()), 
((SELECT sub_module_id FROM waka.sub_modules WHERE sub_module_name = 'Invite Company'), ARRAY ['view','create','update','delete'],1,now()),
((SELECT sub_module_id FROM waka.sub_modules WHERE sub_module_name = 'Invite Contact'), ARRAY ['view','create','update','delete'],1,now()), 
((SELECT sub_module_id FROM waka.sub_modules WHERE sub_module_name = 'Stakeholders'), ARRAY ['view','create','update','delete'],1,now()),
((SELECT sub_module_id FROM waka.sub_modules WHERE sub_module_name = 'Services'), ARRAY ['view','create','update','delete'],1,now()),
((SELECT sub_module_id FROM waka.sub_modules WHERE sub_module_name = 'PO Booking'), ARRAY ['view','create','update','delete'],1,now()),
((SELECT sub_module_id FROM waka.sub_modules WHERE sub_module_name = 'Documents'), ARRAY ['view','create','update','delete'],1,now()),
((SELECT sub_module_id FROM waka.sub_modules WHERE sub_module_name = 'Carrier'), ARRAY ['view','create','update','delete'],1,now()),
((SELECT sub_module_id FROM waka.sub_modules WHERE sub_module_name = 'Cargo Handling'), ARRAY ['view','create','update','delete'],1,now()),
((SELECT sub_module_id FROM waka.sub_modules WHERE sub_module_name = 'Service Charges'), ARRAY ['view','create','update','delete'],1,now()),
((SELECT sub_module_id FROM waka.sub_modules WHERE sub_module_name = 'Landing Cost'),  ARRAY ['view','create','update','delete'],1,now());