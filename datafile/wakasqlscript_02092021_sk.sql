INSERT INTO waka.lookup_type (lookup_type, display_name, is_admin_owned, created_by) VALUES ('origin_charges_charge_item', 'Origin Charge Item', true, 1),('freight_management_charge_item', 'Freight Management Charge Item', true, 1),('ocean_freight_charge_item', 'Ocean Charge Item', true, 1),('import_duty_charge_item', 'Import Charge Item', true, 1),('destination_services_charge_item', 'Destination Charge Item', true, 1);

INSERT INTO waka.lookup_name (lookup_name,display_name, lookup_type_id, company_id,seq, created_by) VALUES
('supplier_booking_amendment_fee','Supplier Booking Amendment Fee',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),1,1);

INSERT INTO waka.lookup_name (lookup_name,display_name, lookup_type_id, company_id,seq, created_by) VALUES 
('supplier_booking_cancellation_fee','Supplier Booking Cancellation Fee',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),2,1),
('carrier_booking_fee','Carrier Booking Fee',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),3,1),
('carrier_booking_cancellation_fee','Carrier Booking Cancellation Fee',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),4,1),
('carrier_deadfreight','Carrier Deadfreight',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),5,1),
('equipment_management_fee','Equipment Management Fee',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),6,1),
('lcl_service_charge','LCL Service Charge',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),7,1),
('trucking_fee','Trucking Fee',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),8,1),
('documentation_fee','Documentation Fee',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),9,1),
('export_customs_clearance_fee','Export Customs Clearance Fee',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),10,1),
('late-come_application_fee','Late-come Application Fee',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),11,1),
('warehouse_unloading_charge','Warehouse Unloading Charge',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),12,1),
('warehouse_sorting_charge','Warehouse Sorting Charge',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),13,1),
('warehouse_gate_charge','Warehouse Gate Charge',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),14,1),
('warehouse_packing_charge','Warehouse Packing Charge',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),15,1),
('labour_charge','Labour Charge',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),16,1),
('palletisation_slipsheeting_charge','Palletisation/Slipsheeting Charge',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),17,1),
('scan_and_pack_charge','Scan and Pack Charge',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),18,1),
('goh_handling_charge','GOH Handling Charge',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),19,1),
('partitioning_charge','Partitioning Charge',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),20,1),
('warehouse_storage_fee','Warehouse Storage Fee',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),21,1),
('re-labelling_charge','Re-labelling Charge',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),22,1),
('repackaging_charge','Repackaging Charge',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),23,1),
('warehouse_material_charge','Warehouse Material Charge',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),24,1),
('qc_charge','QC Charge',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),25,1),
('qc_area_charge','QC Area Charge',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),26,1),
('qc_inspector_charge','QC Inspector Charge',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),27,1),
('ams_charge','AMS Charge',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),28,1),
('ens_charge','ENS Charge',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),29,1),
('aci_charge','ACI Charge',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),30,1),
('afr_charge','AFR Charge',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),31,1),
('terminal_handling_charge','Terminal Handling Charge (THC)',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),32,1),
('port_construction_charge','Port Construction Charge',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),33,1),
('port_security_charge_','Port Security Charge',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),34,1),
('port_congestion_surcharge','Port Congestion Surcharge',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),35,1),
('carrier_seal_charge','Carrier Seal Charge',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),36,1),
('vgm_fee','VGM Fee',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),37,1),
('vgm_amendment_fee','VGM Amendment Fee',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),38,1),
('carrier_b_l_fee','Carrier B/L Fee',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),39,1),
('carrier_b_l_amendment_fee','Carrier B/L Amendment Fee',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),40,1),
('telex_release','Telex Release',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),41,1),
('fcr_hbl_charge','FCR/HBL Charge',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),42,1),
('fcr_hbl_amendment_fee','FCR/HBL Amendment Fee',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),43,1),
('late_documentation_fee','Late Documentation Fee',(select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),44,1),
('cy_monitoring_fee','CY Monitoring Fee',(select lookup_type_id from waka.lookup_type where lookup_type='freight_management_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),1,1),
('handling_fee','Handling Fee',(select lookup_type_id from waka.lookup_type where lookup_type='freight_management_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),2,1),
('ocean_freight','Ocean Freight',(select lookup_type_id from waka.lookup_type where lookup_type='ocean_freight_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),1,1),
('low_sulphur_surcharge','Low Sulphur Surcharge (LSS)',(select lookup_type_id from waka.lookup_type where lookup_type='ocean_freight_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),2,1),
('import_duty_fee','Import Duty Fee',(select lookup_type_id from waka.lookup_type where lookup_type='import_duty_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),1,1),
('import_customs_clearance_fee','Import Customs Clearance Fee',(select lookup_type_id from waka.lookup_type where lookup_type='import_duty_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),2,1),
('customs_documentation_fee','Customs Documentation Fee',(select lookup_type_id from waka.lookup_type where lookup_type='import_duty_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),3,1),
('destination_terminal_handling_fee','Destination Terminal Handling Fee (DTHC)',(select lookup_type_id from waka.lookup_type where lookup_type='destination_services_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),1,1),
('port_construction_charge','Port Construction Charge',(select lookup_type_id from waka.lookup_type where lookup_type='destination_services_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),2,1),
('port_security_charge','Port Security Charge',(select lookup_type_id from waka.lookup_type where lookup_type='destination_services_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),3,1),
('port_congestion_surcharge','Port Congestion Surcharge',(select lookup_type_id from waka.lookup_type where lookup_type='destination_services_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),4,1),
('documentation_fee','Documentation Fee',(select lookup_type_id from waka.lookup_type where lookup_type='destination_services_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),5,1),
('agency_fee','Agency Fee',(select lookup_type_id from waka.lookup_type where lookup_type='destination_services_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),6,1),
('depot_handling_fee','Depot Handling Fee',(select lookup_type_id from waka.lookup_type where lookup_type='destination_services_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),7,1),
('detention_and_demurrage_fee','Detention and Demurrage Fee',(select lookup_type_id from waka.lookup_type where lookup_type='destination_services_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),8,1),
('lifting_charge','Lifting Charge',(select lookup_type_id from waka.lookup_type where lookup_type='destination_services_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),9,1),
('psa_portnet_processing_fee','PSA Portnet Processing Fee',(select lookup_type_id from waka.lookup_type where lookup_type='destination_services_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),10,1),
('import_processing_fee','Import Processing Fee',(select lookup_type_id from waka.lookup_type where lookup_type='destination_services_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),11,1),
('delivery_order_fee','Delivery Order Fee',(select lookup_type_id from waka.lookup_type where lookup_type='destination_services_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),12,1),
('container_haulage_charge','Container Haulage Charge',(select lookup_type_id from waka.lookup_type where lookup_type='destination_services_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),13,1),
('trucking_fee','Trucking Fee',(select lookup_type_id from waka.lookup_type where lookup_type='destination_services_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),14,1),
('fuel_surcharge','Fuel Surcharge',(select lookup_type_id from waka.lookup_type where lookup_type='destination_services_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),15,1),
('cleaning_charge','Cleaning Charge',(select lookup_type_id from waka.lookup_type where lookup_type='destination_services_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),16,1),
('warehouse_unloading_charge','Warehouse Unloading Charge',(select lookup_type_id from waka.lookup_type where lookup_type='destination_services_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),17,1),
('warehouse_sorting_charge','Warehouse Sorting Charge',(select lookup_type_id from waka.lookup_type where lookup_type='destination_services_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),18,1),
('warehouse_gate_charge','Warehouse Gate Charge',(select lookup_type_id from waka.lookup_type where lookup_type='destination_services_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),19,1),
('warehouse_packing_charge','Warehouse Packing Charge',(select lookup_type_id from waka.lookup_type where lookup_type='destination_services_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),20,1),
('labour_charge','Labour Charge',(select lookup_type_id from waka.lookup_type where lookup_type='destination_services_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),21,1),
('palletisation_slipsheeting_charge','Palletisation/Slipsheeting Charge',(select lookup_type_id from waka.lookup_type where lookup_type='destination_services_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),22,1),
('scan_and_pack_charge','Scan and Pack Charge',(select lookup_type_id from waka.lookup_type where lookup_type='destination_services_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),23,1),
('goh_handling_charge','GOH Handling Charge',(select lookup_type_id from waka.lookup_type where lookup_type='destination_services_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),24,1),
('warehouse_storage_fee','Warehouse Storage Fee',(select lookup_type_id from waka.lookup_type where lookup_type='destination_services_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),25,1),
('warehouse_material_charge','Warehouse Material Charge',(select lookup_type_id from waka.lookup_type where lookup_type='destination_services_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),26,1),
('gst','GST',(select lookup_type_id from waka.lookup_type where lookup_type='destination_services_charge_item' limit 1),(select company_id from waka.company where company_name='waka' limit 1),27,1);

--flyway for postgresql
--09-09-2021 SK
INSERT INTO waka.lookup_type (lookup_type, display_name, is_admin_owned, created_by) VALUES ('currency', 'Currency', true, 1);
INSERT INTO waka.lookup_name (lookup_name,display_name, lookup_type_id, company_id,seq, created_by) VALUES ('USD', 'US Dollar', (select lookup_type_id from waka.lookup_type where lookup_type='currency' limit 1),(select company_id from waka.company where company_name='waka' limit 1),1,1), ('CNY', 'Chinese Yuan', (select lookup_type_id from waka.lookup_type where lookup_type='currency' limit 1),(select company_id from waka.company where company_name='waka' limit 1),2,1),('HKD', 'Hong kong Dollar', (select lookup_type_id from waka.lookup_type where lookup_type='currency' limit 1),(select company_id from waka.company where company_name='waka' limit 1),3,1);

DROP TABLE IF EXISTS waka.sop_service_charges CASCADE;
create table waka.sop_service_charges (
	sop_service_charge_id SERIAL NOT NULL PRIMARY KEY,
	sop_id INT NOT NULL REFERENCES waka.sop(sop_id) ON DELETE CASCADE,
	service_charge_id INT NOT NULL REFERENCES waka.lookup_type(lookup_type_id) ON DELETE CASCADE,
	charge_item_id INT NOT NULL REFERENCES waka.lookup_name(lookup_name_id) ON DELETE CASCADE,
	charge_description VARCHAR,
	sop_port_id INT NULL REFERENCES waka.sop_port(sop_port_id) ON DELETE CASCADE,
	currency_id INT NOT NULL REFERENCES waka.lookup_name(lookup_name_id) ON DELETE CASCADE,
	uom VARCHAR NOT NULL, 
	unit_rate numeric NOT NULL,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ,
	unique(sop_id,service_charge_id,charge_item_id, sop_port_id)
);
-- as lookup type does not have grouping, the below table is used to get the group of service charge item.
DROP TABLE IF EXISTS waka.service_charges_grp;
create table waka.service_charges_grp (
	service_charge_id INT NOT NULL REFERENCES waka.lookup_type(lookup_type_id) ON DELETE CASCADE
);
INSERT INTO waka.service_charges_grp(service_charge_id) VALUES ((select lookup_type_id from waka.lookup_type where lookup_type='origin_charges_charge_item' limit 1)),((select lookup_type_id from waka.lookup_type where lookup_type='freight_management_charge_item' limit 1)),((select lookup_type_id from waka.lookup_type where lookup_type='ocean_freight_charge_item' limit 1)),((select lookup_type_id from waka.lookup_type where lookup_type='import_duty_charge_item' limit 1)),((select lookup_type_id from waka.lookup_type where lookup_type='destination_services_charge_item' limit 1));

DROP VIEW IF EXISTS waka.vw_sop_port;
CREATE OR REPLACE VIEW waka.vw_sop_port AS SELECT sp.sop_port_id, sp.origin_port_id, op.port_name origin_port, op.country as origin_country, sp.dest_port_id, dp.port_name dest_port, dp.country as dest_country, sp.sop_id FROM waka.sop_port sp JOIN waka.port op ON op.port_id = sp.origin_port_id JOIN waka.port dp ON dp.port_id = sp.dest_port_id ORDER BY 4,3,7,6 ;

--DROP VIEW IF EXISTS waka.vw_sop_service_charges_summary;
--CREATE OR REPLACE VIEW waka.vw_sop_service_charges_summary AS SELECT vsp.* FROM waka.vw_sop_port vsp LEFT JOIN waka.sop_service_charges ssc ON ssc.sop_id = sp.sop_id AND 

ALTER TABLE waka.services ADD COLUMN is_mandatory BOOLEAN DEFAULT false;
--sop_id - 29, pp_id - 230, ff_id 231, user_id - 29; 1810 to 1835 - china, 1980 - hongkong, 1730-1746 Australia, 2488-2533 US
-- temp insert query for port reference in other modules
INSERT INTO waka.sop_port (sop_id, principal_id, ff_id, origin_port_id, dest_port_id, created_by) VALUES
(29, 230, 231, 1810,1730,29),
(29, 230, 231, 1810,1731,29),
(29, 230, 231, 1810,1732,29),
(29, 230, 231, 1810,1733,29),
(29, 230, 231, 1810,1734,29),
(29, 230, 231, 1810,1735,29),
(29, 230, 231, 1810,1736,29),
(29, 230, 231, 1810,1737,29),
(29, 230, 231, 1810,1738,29),
(29, 230, 231, 1810,1739,29),
(29, 230, 231, 1810,1740,29),
(29, 230, 231, 1810,1741,29),
(29, 230, 231, 1810,1742,29),
(29, 230, 231, 1810,1743,29),
(29, 230, 231, 1810,1744,29),
(29, 230, 231, 1810,1745,29),
(29, 230, 231, 1810,1746,29),
(29, 230, 231, 1811,1730,29),
(29, 230, 231, 1811,1731,29),
(29, 230, 231, 1811,1732,29),
(29, 230, 231, 1811,1733,29),
(29, 230, 231, 1811,1734,29),
(29, 230, 231, 1811,1735,29),
(29, 230, 231, 1811,1736,29),
(29, 230, 231, 1811,1737,29),
(29, 230, 231, 1811,1738,29),
(29, 230, 231, 1811,1739,29),
(29, 230, 231, 1811,1740,29),
(29, 230, 231, 1811,1741,29),
(29, 230, 231, 1811,1742,29),
(29, 230, 231, 1811,1743,29),
(29, 230, 231, 1811,1744,29),
(29, 230, 231, 1811,1745,29),
(29, 230, 231, 1811,1746,29),
(29, 230, 231, 1980,1730,29),
(29, 230, 231, 1980,1731,29),
(29, 230, 231, 1980,1732,29),
(29, 230, 231, 1980,1733,29),
(29, 230, 231, 1980,1734,29),
(29, 230, 231, 1980,1735,29),
(29, 230, 231, 1980,1736,29),
(29, 230, 231, 1980,1737,29),
(29, 230, 231, 1980,1738,29),
(29, 230, 231, 1980,1739,29),
(29, 230, 231, 1980,1740,29),
(29, 230, 231, 1980,1741,29),
(29, 230, 231, 1980,1742,29),
(29, 230, 231, 1980,1743,29),
(29, 230, 231, 1980,1744,29),
(29, 230, 231, 1980,1745,29),
(29, 230, 231, 1980,1746,29);

DROP TABLE IF EXISTS waka.sop_stakeholder;
CREATE TABLE waka.sop_stakeholder(
	sop_stakeholder_id SERIAL NOT NULL PRIMARY KEY,
	sop_id INT NOT NULL REFERENCES waka.sop(sop_id) ON DELETE CASCADE,
    stakeholder_id INT NOT NULL REFERENCES waka.company(company_id) ON DELETE CASCADE,
	type_id INT NOT NULL REFERENCES waka.lookup_name(lookup_name_id) ON DELETE CASCADE,
	country_id INT NOT NULL REFERENCES waka.country(country_id) ON DELETE CASCADE,
	contract_id INT NOT NULL REFERENCES waka.contract(contract_id) ON DELETE CASCADE,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(), 
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ,
	UNIQUE (sop_id, stakeholder_id,type_id)
);
