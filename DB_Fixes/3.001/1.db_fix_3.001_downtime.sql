SELECT '1.DB-Fix - 3.001 Downtime Started - '||now();

SELECT '-- siddiq - 2022-04-26 - [';

INSERT INTO waka.sub_modules (sub_module_name, module_id, icon, table_refere) VALUES ('Map Services', 1, 'settings_input_antenna', 'map_services');
UPDATE waka.sub_modules SET seq = 1 WHERE sub_module_id = 30;
UPDATE waka.sub_modules SET seq = 2 WHERE sub_module_id = 34;
UPDATE waka.sub_modules SET seq = 3 WHERE sub_module_id = 37;
UPDATE waka.sub_modules SET seq = 4 WHERE sub_module_id = 59;
UPDATE waka.sub_modules SET table_reference = 'third_party_services'  WHERE sub_module_id = 37;


DROP TABLE IF EXISTS waka.po_transactions_temp;
/*CREATE TABLE waka.po_transactions_temp (
	pot_id SERIAL PRIMARY KEY,
	date DATE,
	shift_batch VARCHAR,
	mfg_qty INT,
	attachement_path VARCHAR,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now()
);*/

DROP TABLE IF EXISTS waka.po_transactions;
CREATE TABLE waka.po_transactions (
	pot_id SERIAL PRIMARY KEY,
	product VARCHAR,
	product_description VARCHAR,
	supplier_ref_id INT NOT NULL REFERENCES waka.company(company_id) ON DELETE CASCADE,
	transaction_date DATE,
	shift_batch VARCHAR,
	mfg_qty INT,
	attachment_file_path VARCHAR,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TABLE IF EXISTS waka.map_services_temp;
CREATE TABLE waka.map_services_temp (
	ms_id SERIAL PRIMARY KEY,
	account_type_id INT REFERENCES waka.lookup_name(lookup_name_id) ON DELETE CASCADE,
	service_type_id INT[],
	selected_services JSON,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE waka.poi_master_error_temp ADD COLUMN ref_code VARCHAR;

ALTER TABLE waka.company_invite ADD COLUMN poi_master_error_id INT NULL REFERENCES waka.poi_master_error_temp(poi_me_id);


DROP TABLE IF EXISTS waka.po_raw;
CREATE TABLE waka.po_raw (
	po_raw_id SERIAL PRIMARY KEY,
	poisrs_id INT NOT NULL REFERENCES waka.poi_scheduler_running_status(poisrs_id) ON DELETE CASCADE,
	company_id INT NOT NULL REFERENCES waka.company(company_id) ON DELETE CASCADE,
	ordernumber VARCHAR,
	consigneecode VARCHAR,
	consigneename VARCHAR,
	suppliername VARCHAR,
	suppliercode VARCHAR,
	factorycode VARCHAR,
	factoryname VARCHAR,
	buyername VARCHAR,
	incoterms VARCHAR,
	category VARCHAR,
	transportmode VARCHAR,
	originportcode VARCHAR,
	originportname VARCHAR,
	destinationportcode VARCHAR,
	destinationportname VARCHAR,
	destinationdccode VARCHAR,
	destinationdcname VARCHAR,
	shipdate VARCHAR,
	deliverydate VARCHAR,
	product VARCHAR,
	description VARCHAR,
	productcategory VARCHAR,
	commoditycode VARCHAR,
	sku VARCHAR,
	colour VARCHAR,
	primarysize VARCHAR,
	secondarysize VARCHAR,
	quantity VARCHAR,
	cartons VARCHAR,
	cube VARCHAR,
	weight VARCHAR,
	packtype VARCHAR,
	created_by INT NOT NULL REFERENCES  waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now()
);

SELECT '-- siddiq - 2022-04-26 - ]';

SELECT '1.DB-Fix - 3.001 Downtime Completed - '||now();
