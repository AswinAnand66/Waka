INSERT INTO waka.sub_modules (sub_module_name, module_id, icon, table_reference) VALUES ('Map Services', 1, 'settings_input_antenna', 'map_services');
UPDATE waka.sub_modules SET seq = 1 WHERE sub_module_id = 30;
UPDATE waka.sub_modules SET seq = 2 WHERE sub_module_id = 34;
UPDATE waka.sub_modules SET seq = 3 WHERE sub_module_id = 37;
UPDATE waka.sub_modules SET seq = 4 WHERE sub_module_id = 59;
UPDATE waka.sub_modules SET table_reference = 'third_party_services'  WHERE sub_module_id = 37;


DROP TABLE IF EXISTS waka.po_transactions_temp;
CREATE TABLE waka.po_transactions_temp (
	pot_id SERIAL PRIMARY KEY,
	date DATE,
	shift_batch VARCHAR,
	mfg_qty INT,
	attachement_path VARCHAR,
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

UPDATE waka.sub_modules SET sub_module_name = 'Map Enabled Services' WHERE sub_module_name = 'Map Services';
UPDATE waka.sub_modules SET sub_module_name = 'Services' WHERE sub_module_name = 'Third Party Services';

ALTER TABLE waka.waka.po_ingestion ADD COLUMN cargo_ready_date JSON;
ALTER TABLE waka.waka.po_ingestion ADD COLUMN shipment_date JSON;
ALTER TABLE waka.waka.po_ingestion ADD COLUMN delivery_date JSON;

UPDATE waka.carrier SET fields = '[{"group":"Arrange periodic updates of the Sailing Schedule","fields":["field0"],"field0":{"type":"inlineedit","field":[{"pretext":"Receive an updated sailing schedule every","value":2,"posttext":"weeks","range":[1,4],"controlname":"PUSSMaintain","child":[]}]}},{"group":"Sailing Schedule Details","fields":["field0"],"field0":{"type":"chipset","field":[{"fieldname":"","selLabel":"Selected details must be mentioned in the sailing schedule","options":["VGM Cutoff","SI Cutoff","CFS Opening","CFS Closing","CY Opening","CY Closing","Carrier Name","Service Routes","Vessel Name","Voyage","Loading Port","Discharging Port","ETD","ETA"],"value":["Carrier Name","Service Routes","Vessel Name","Voyage","Loading Port","Discharging Port","ETD","ETA"],"controlname":"DUForcast","unselLabel":"Add more details","child":[]}]}},{"group":"Email sailing schedule to the selected parties","label":"Selected parties must be notified on the sailing schedule via email","fields":["field0"],"field0":{"type":"select-users","field":[{"fieldname":"Principal Details","placeholder":"Select Principal Users","options":[],"methodName":"getConsigneeContacts","value":[],"controlname":"EmailSailPrincipal","child":[{"type":"chipset","field":[{"fieldname":"","selLabel":"","value":[],"options":[],"unselLabel":"","controlname":"DocDispToPartyPrincipalUsers","child":[]}]}]},{"fieldname":"Freight Forwarder Details","placeholder":"Select Forwarder Users","options":[],"methodName":"getFFContacts","value":[],"controlname":"EmailSailForwarder","child":[{"type":"chipset","field":[{"fieldname":"","selLabel":"","value":[],"options":[],"unselLabel":"","controlname":"DocDispToPartyForwarderUsers","child":[]}]}]}]}},{"group":"Sailing schedule reminder via email","fields":["field0"],"field0":{"type":"inlineedit","is_alert":true,"field":[{"pretext":"Selected parties must receive a sailing schedule email every","value":7,"posttext":"","range":[0,30],"controlname":"ForSelNoShow","child":[{"type":"select","field":[{"fieldname":"Select Day","placeholder":"Select Type","posttext":"of the week","options":["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],"methodName":"getDay","value":[],"controlname":"CFDay","child":[]}]}]}]}}]' WHERE control_name = 'SSMaintain';