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

---- 19-09-2021 SK upto this updated to wakatech.com
alter table waka.modules add column is_visible BOOLEAN DEFAULT true;
alter table history.modules add column is_visible BOOLEAN DEFAULT true;

alter table waka.modules add column seq smallint;
alter table history.modules add column seq smallint;

update waka.modules set seq = 1 where module_name = 'Admin';
update waka.modules set seq = 2 where module_name = 'Company';
update waka.modules set seq = 2 where module_name = 'SOP';
update waka.modules set seq = 4 where module_name = 'Order Confirmation';
update waka.modules set module_name = 'Manage Orders' where module_name = 'Order Confirmation';

update waka.modules set icon ='assignment', svg =null where module_name ='SOP';
 
-- 27-10-2021
truncate table waka.sop_pob restart identity;
truncate table waka.po_booking restart identity cascade;
INSERT INTO waka.po_booking (grp, grp_seq, html_template, sub_grp, sub_grp_seq, pob_name, control_name, pob_seq, ui_img_file_name, has_child, view_text, fields, created_by) VALUES
('PO Management',1,'template2','Purchase Order Placement',1,'Purchase Order Placement','POPlacement',1,null, true,null,'[{"group":"Purchase Order Posting","fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"PO must be posted to waka platform", "value":7, "posttext":"Days prior to", "range":[0,30],"controlname":"DatePriorCRD", "child":[{"type":"select", "field":[{"fieldname":"Select Data Type", "options":["Cargo Ready Date","Contract Shipment Date","Into DC Date"], "value":null, "controlname":"POPSelectDataType", "child":[]}]}]}]}},{"group":"Exception Alert for Purchase Order Uploaded","label":"The selected parties must be notified incase of an exception alert", "fields":["field0"], "field0":{"type":"select", "field":[{"fieldname":"Principal Details", "placeholder":"Select Principal Users", "options":[], "methodName":"getConsigneeContacts", "value":[], "controlname":"POPPUEPrincipal", "child":[]},{"fieldname":"Freight Forwarder", "placeholder":"Select Frieght Forwarder Users", "options":[], "methodName":"getFFContacts", "value":[], "controlname":"POPPUEForwarder", "child":[]}]}}]',1),
('PO Management',1,'template2','Purchase Order Confirmation',2,'Purchase Order Confirmation','POConfirmation',1,null, true,null,'[{"group":"Receive PO Confirmation by Supplier", "fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Once the principal''s PO is received, the supplier must send an order confirmation within","value":"21 Days", "posttext":"Days", "range":[0,30], "controlname":"POConfirmationBySupplier", "child":[]}]}},{"group":"Require Principal''s Reconfirmation for updates on PO details during order confirmation", "fields":["field0"], "field0":{"type":"chipset", "field":[{"fieldname":"", "selLabel":"Selected details will require approval from the principal on the updated PO details","value":["Cargo Ready Date","Loading Port","Discharching Port","Product/Item Number","Quantity","Unit Price"],"options":["Cargo Ready Date","Loading Port","Discharching Port","Product/Item Number","Quantity","Unit Price","Fumigation","Scan-and-Pack","Re-labeling","Repackaging","Compliance Check","Cargo Pick-up/Trucking","Crating","Palletisation and Slip Sheeting","Garment-on-Hanger (GOH)"], "controlname":"RRCCargoReadyDate","unselLabel":"Add more details", "child":[]}]}}]',1),
('PO Management',1,'template2','Purchase Order Progress Check',3,'Purchase Order Progress Check','ProgressCheck',1,null, true,null,'[{"group":"Purchase Order Progress Check", "fields":["field0", "field1"], "field0":{"type":"inlineedit", "field":[{"pretext":"Progress check updates must be provided by the supplier","value":"14", "posttext":" Days prior to", "controlname":"DateOfProgressCheck", "range":[0,30], "child":[{"type":"select", "field":[{"fieldname":"Select Data Type", "options":["Cargo Ready Date","Contract Shipment Date","Into DC Date"], "value":null, "controlname":"POPSelectDataType", "child":[]}]}]}]}}]',1),
('PO Support',2,'template2','Inspection or Testing Requirements',1,'Inspection or Testing Requirements','TestingRequirements',1,null, true,null,'[{"group":"Inspection/testing standards for supplier", "fields":["field0"], "field0":{"type":"select", "field":[{"fieldname":"Select standard type", "options":["Follow PO Instructions","Set Instructions for all POs"], "value":null, "controlname":"ITRStandType", "child":[]}]}},{"group":"Instructions", "fields":["field0"], "field0":{"type":"chipset", "field":[{"fieldname":"",  "selLabel":"Selected Instructions","options":["Sampling","Production","Shipment"], "value":[], "controlname":"ApplyAbvSeleTo","unselLabel":"Add Instructions", "child":[]}]}}]',1),
('Supply Chain Support',3,'template2','Manage Supply Chain Module',1,'Manage Supply Chain Module','ManageSupplyChainModule',1,null,false,null,null,1),
('Shipment Booking',4,'template2','Data for Booking Confirmation',1,'Data from Booking Confirmation','DataBookingConfirmation',1,null, true,null,'[{"group":"General Details for Booking Confirmation", "fields":["field0"], "field0":{"type":"chipset", "field":[{"fieldname":"","selLabel":"Selected details will be added to the booking confirmation data", "value":["Forwarder Booking Confirmation Number","PO Number","Item Number/SKU Number","Product Description","Ship Mode","Vessel Name","Quantity per each Item Number","Number of cartons per each Item Number","Volume per each Item Number","Total Volume per FCL Container","Total Number of Container and Size for FCL Shipment","Cargo Ready Date","Cargo Delivery Window","Voyage"],"options":["Forwarder Booking Confirmation Number","PO Number","Item Number/SKU Number","Product Description","Ship Mode","Vessel Name","Quantity per each Item Number","Number of cartons per each Item Number","Volume per each Item Number","Total Volume per FCL Container","Total Number of Container and Size for FCL Shipment","Cargo Ready Date","Cargo Delivery Window","Voyage","Equipment Type","Loading Port","Discharging Port","Place of Destination","Factory Nane","Factory Contact Person"],"unselLabel":"Add more details", "controlname": "GDForBookingConfirmation", "child":[]}]}},{"group":"Packaging Details for Booking Confirmation", "fields":["field0"], "field0":{"type":"chipset", "field":[{"fieldname":"","selLabel":"Selected details will be added to the booking confirmation data", "value":["Carton Type","Carton Length","Carton Depth","Piece per Inner","Inner per Outer"],"options":["Carton Type","Carton Length","Carton Depth","Piece per Inner","Inner per Outer","Inner Carton EAN","Outer Carton EAN"],"unselLabel":"Add more details", "controlname": "PDForBookingConf", "child":[]}]}}]',1),
('Shipment Booking',4,'template2','PO Grouping Criteria for Booking Confirmation',2,'PO Grouping Criteria for Booking Confirmation','POGroupingCriteriaBookingConfirmation',1,null, true,null,'[{"group":"Grouping Criteria", "fields":["field0"], "field0":{"type":"chipset", "field":[{"fieldname":"","selLabel":"Selected are the mandatory details to group your POs for Booking Confirmation", "value":["Supplier","Loading Port","Discharging Port","Shipment Window","Transport Mode","Ship Mode"],"options":["Supplier","Loading Port","Discharging Port","Shipment Window","Transport Mode","Ship Mode","Incoterms","PO Number","Item Type","Assortment","Pack Type","Distribution Center","HS Code","Fumigation","Compliance Check","Palletisation/Slip Sheeting","Re-Labeling","Scan-and-Pack","Repackaging"],"unselLabel":"Add more details", "controlname": "SBGrpingCriteria", "child":[]}]}}, {"group":"Packaging Details for Booking Confirmation", "fields":["field0"], "field0":{"type":"chipset", "field":[{"fieldname":"","selLabel":"Selected details will be added to the booking confirmation data", "value":["Carton Type","Carton Length","Carton Depth","Piece per Inner","Inner per Outer"],"options":["Carton Type","Carton Length","Carton Depth","Piece per Inner","Inner per Outer","Inner Carton EAN","Outer Carton EAN"],"unselLabel":"Add more details", "controlname": "PDForBookingConf", "child":[]}]}}]',1),
('Shipment Booking',4,'template2','Generate Booking Confirmation to the Supplier',3,'Generate Booking Confirmation to the Supplier','GBCToSupplier',1,null, true,null,'[{"group":"Reminder to Generate Booking Confirmation","fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Reminder to generate booking confirmation between", "value":7, "posttext":"", "range":[0,30],"controlname":"RemainderToGenerate", "child":[]},{"pretext":"and", "value":7, "posttext":"days prior to", "range":[0,30], "controlname":"SBinlineEditDaysPriorTo", "child":[{"type":"select", "field":[{"fieldname":"Select Data Type", "options":["Cargo Ready Date","Contract Shipment Date","Into DC Date"], "value":null, "controlname":"POPSelectDataType", "child":[]}]}]}]}},{"group":"Include Estimated Sailing Information in Booking Confirmation","label":"Estimated Sailing informationation will provide context for the booking confirmation", "fields":["field0"], "field0":{"type":"multi", "field":[{"fieldname":"Include Estimated Sailing Information in Booking Confirmation", "value":true, "controlname":"SBIESIinBookConfirm", "child":[]}]}}]',1),
('Shipment Booking',4,'template2','Purchase Order Booking Reconfirmation by Supplier',4,'Purchase Order Booking Reconfirmation by Supplier','PORCToSupplier',1,null, true,null,'[{"group":"Final Booking Confirmation Release to Supplier","fields":["field0","field1"], "field0":{"type":"inlineedit", "field":[{"pretext":"Reminder to release final booking confirmation for FCL", "value":7, "posttext":"days prior to ETD of Vessel", "range":[0,30],"controlname":"RemainderToReleaseFBCforFCL", "child":[]}]},"field1":{"type":"inlineedit", "field":[{"pretext":"Reminder to release final booking confirmation for LCL", "value":7, "posttext":"days prior to CFS Cut off Date", "range":[0,30], "controlname": "DaysPriorToCFSforLCL", "child":[]}]}},{"group":"Require Principal''s Reconfirmation for updates on PO details during booking confirmation","label":"", "fields":["field0"], "field0":{"type":"chipset", "field":[{"fieldname":"","selLabel":"Selected details will require approval from the principal on the updated PO details", "value":["Quantity","Volume"], "options":["Quantity","Volume","Gross Weight"],"unselLabel":"Add more details", "controlname":"SBIESIinBookConfirm", "child":[]}]}}]',1),
('Shipment Booking',4,'template2','Final Booking Confirmation Details',5,'Final Booking Confirmation Details','SBFBCDetails',1,null, true,null,'[{"group":"Required final booking confirmation details for FCL","label":"", "fields":["field0"], "field0":{"type":"chipset", "field":[{"fieldname":"","selLabel":"Selected details will be shown in final booking confirmation for FCL", "value":["VGM Cutoff","ENS/AMS Cutoff","Shipment Instructions Cutoff","CY Cutoff"], "options":["VGM Cutoff","ENS/AMS Cutoff","Shipment Instructions Cutoff","CY Cutoff","Cargo Ready Date","Vessel Name","Vessel Voyage","Cargo Volume","Cargo Gross Weight","Container Type"],"unselLabel":"Add more details", "controlname": "SBRFBCFCL", "child":[]}]}},{"group":"Required final booking confirmation details for LCL","label":"", "fields":["field0"], "field0":{"type":"chipset", "field":[{"fieldname":"","selLabel":"Selected details will be shown in final booking confirmation for LCL", "value":["VGM Cutoff","ENS/AMS Cutoff","CFS Cutoff"], "options":["VGM Cutoff","ENS/AMS Cutoff","Cargo Delivery Window","CFS Cutoff","Cargo Ready Date","Vessel Name","Vessel Voyage","Cargo Volume","Cargo Gross Weight"],"unselLabel":"Add more details", "controlname": "SBRFBCLCL", "child":[]}]}}]',1),
('Shipment Authorization',5,'template2','Require authorisation on discrepancy between Purchase Order and Booking Confirmation',1,'Require authorisation on discrepancy between Purchase Order and Booking Confirmation','SARADBPOBC',1,null, true,null,'[{"group":"Require shipment authorization","label":"", "fields":["field0"], "field0":{"type":"chipset", "field":[{"fieldname":"","selLabel":"Selected details will require authorization on discrepancy", "value":["Loading Port","Discharging Port","Quantity Tolerance","Cargo Ready Date"], "options":["Loading Port","Discharging Port","Quantity Tolerance","Cargo Ready Date"],"unselLabel":"Add more details", "controlname": "SARSA", "child":[]}]}}]',1),
('Shipment Authorization',5,'template2','Booking Re-Confirmation by Supplier',2,'Booking Re-Confirmation by Supplier','SABRCBySupplier',1,null, true,null,'[{"group":"Allowed Quantity Variance at Booking Confirmation","fields":["field0"], "field0":{"type":"inlineedit", "validation":"@@SABRCAQV@@<@@SABRCAQVSecondValue@@", "field":[{"pretext":"Accepeted quanitity variance lies between", "value":-10, "posttext":"", "range":[-10,30],"controlname":"SABRCAQV", "child":[]},{"pretext":"%  to ", "value":10, "posttext":"%", "range":[0,30], "controlname":"SABRCAQVSecondValue", "child":[]}]}}]',1),
('Shipment Authorization',5,'template2','Require Shipment Re-authorization by Principal',3,'Require Shipment Re-authorization by Principal','SARSRAByPrincipal',1,null, true,null,'[{"group":"Manage discrepancy of shipment authorized details","label":"", "fields":["field0"], "field0":{"type":"chipset", "field":[{"fieldname":"","selLabel":"Selected details require re-authorization from principal if shipment authorized details are modified", "value":["ETD","ETA","Loading Port","Discharging Port"], "options":["ETD","ETA","Loading Port","Discharging Port","Product/Item Number","Quantity"],"unselLabel":"Add more details", "controlname": "SARSRAByPrincipalchipset", "child":[]}]}}]',1),
('Shipment Authorization',5,'template2','Timing of Quality Check Approval',4,'Timing of Quality Check Approval','TimingQCA',1,null,false,null,null,1);

--20-10-2021 changes
alter table waka.sop alter column valid_from drop not null;
alter table waka.sop alter column valid_to drop not null;
---updated after 24-10-2021
--mainly to get the company name and details for the contact who have been invited by a company level
DROP VIEW IF EXISTS my_company CASCADE;
CREATE VIEW my_company AS (SELECT sq.user_id, sq.company_id, sq.office_category_id, ln.lookup_name as office_category FROM (SELECT cc.user_id, cc.company_id, c.office_category_id FROM waka.company_contact cc JOIN waka.company c ON c.company_id = cc.company_id UNION SELECT owned_by, company_id, office_category_id from waka.company) as sq JOIN waka.lookup_name ln ON ln.lookup_name_id = sq.office_category_id); 
 -- to get the company details of my company its owner and license details
 DROP VIEW IF EXISTS vw_my_company_and_type CASCADE;
 CREATE VIEW vw_my_company_and_type AS (SELECT sq.user_id, sq.company_id, c.company_name, sq.company_type_id, ln.lookup_name as company_type, c.owned_by, sq.office_category_id, oc.lookup_name as office_category, CASE WHEN COALESCE(cl.cl_id,0) > 0 THEN true ELSE false END is_licensed FROM (SELECT mc.user_id, mc.company_id, ci.invited_company_type_id company_type_id, mc.office_category_id from my_company mc JOIN waka.company_invite ci ON mc.company_id = ci.invited_company_id  UNION SELECT mc.user_id, mc.company_id, ci.invitee_company_type_id company_type_id, mc.office_category_id from my_company mc JOIN waka.company_invite ci ON mc.company_id = ci.invitee_company_id) as sq JOIN waka.company c ON c.company_id = sq.company_id JOIN waka.lookup_name ln ON ln.lookup_name_id = sq.company_type_id LEFT JOIN waka.company_license cl ON cl.company_id = sq.company_id AND cl.is_approved JOIN waka.lookup_name oc ON oc.lookup_name_id = sq.office_category_id);
--03-11-2021 missing COLUMNS
alter table waka.company add column perviewurl varchar;
alter table waka.company alter column company_local_name drop not null;
--02-11-2021 changes
TRUNCATE TABLE waka.cargo_handling restart identity cascade;
TRUNCATE TABLE waka.sop_ch restart identity CASCADE;

INSERT INTO waka.cargo_handling (grp, grp_seq, html_template, sub_grp, sub_grp_seq, ch_name, control_name, ch_seq, ui_img_file_name, has_child, view_text, fields, created_by) VALUES 
('Cargo Requirements',1,'template2','Free Storage Details for LCL',1,'Free Storage Details for LCL','LCLFreeStorage',1,null, true,null,'[{"group":"Free Storage Details for LCL", "fields":["field0"], "field0":{"type":"table", "field":[{"source":"sop_port", "child":[]}]}}]',1),
('Cargo Requirements',1,'template2','LCL Closing',2,'LCL Closing','LCLClosing',1,null, true,null,'[{"group":"LCL Closing Remainder", "fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Reminder to notify supplier for LCL closing", "value":0, "posttext":"days prior to CY closing", "range":[0,30],"controlname":"CRRNSLCLCl", "child":[]}]}}]',1),
('Cargo Requirements',1,'template2','LCL Receiving Conditions',3,'LCL Receiving Conditions','CRLCLRecvCond',1,null, true,null,'[{"group":"LCL Receiving Conditions", "fields":["field0","field1","field2","field3"], "field0":{"type":"multi", "field":[{"fieldname":"Do not allow partial shipment", "value":true, "controlname":"CRDNAPShip", "child": []}]},"field1":{"type":"inlineedit","subgroup":"LCL Receiving Quantity Variance Tolerance", "field":[{"pretext":"Accepted quanitity variance ranges between", "value":90, "posttext":"%", "range":[0,100],"controlname":"CRLCLRCAQVRFROM", "child":[]},{"pretext":" to ", "value":98, "posttext":"%", "range":[0,100],"controlname":"CRLCLRCAQVRTo", "child":[]}]},"field2":{"type":"multi","field":[{"fieldname":"No cargo with metal strapping around the outer cartons can be accepted", "value":true, "controlname":"NCWMSAOutCar", "child": []},{"fieldname":"Deliver cargo to Forwarder''s nominated CFS premises, with required document by the Cargo Ready Date as per the booking form", "value":true, "controlname":"DCFNCFSPRDBYCRD", "child": []},{"fieldname":"All export cartons must have attached Shipping Marks for identification, as specified by Principal", "value":true, "controlname":"AECMHASMFI", "child": []}]},"field3":{"type":"text", "field":[{"fieldname":"Others","placeholder":"Type Other Conditions", "value":null, "controlname":"CRLCLRecvOthers", "child":[]}]}}]',1),
('Cargo Requirements',1,'template2','Allow Early Delivery for LCL',4,'Allow Early Delivery for LCL','CRAEDLCL',1,null, true,null,'[{"group":"Allow Early Delivery for LCL", "fields":["field0"], "field0":{"type":"select", "field":[{"fieldname":"Select action", "options":["Always reject","Upon principal''s approval"], "value":"Always reject", "controlname":"CRAEDLCLOptions", "child":[]}]}}]',1),
('Cargo Requirements',1,'template2','General Cargo Requirements',5,'General Cargo Requirements','CRGCR',1,null, true,null,'[{"group":"Scan-and-Pack/Palletisation Closing", "fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Reminder to notify service provider for scan-and-pack/palletisation closing", "value":10, "posttext":"days prior to LCL Closing", "range":[0,30],"controlname":"CRGCRRNSPSPP", "child":[]}]}},{"group":"Handling shortfall or no-show against booking confirmation from suppliers", "fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Reminder to notify the principal in case there is a shortfall or no-show against a booking confirmation within", "value":10, "posttext":"hours", "range":[0,48],"controlname":"CRGCRRPrinShortfall", "child":[]}]}},{"group":"Action required when a Cargo is damaged", "fields":["field0"], "field0":{"type":"select", "field":[{"fieldname":"Select type of action required to be performed", "options":["Require principal approval","As per freight forwarder"], "value":"Require principal approval", "controlname":"CRGCRARDamageCargo", "child":[]}]}}]',1),
('Value Added Services',2,'template2','Fumigation',1,'Fumigation','VASFumigation',1,null, true,null,null,1),
('Value Added Services',2,'template2','Scan-and-Pack',2,'Scan-and-Pack','VASSandP',1,null, true,null,'[{"group":"Store Allocation", "fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Store allocation for scan-and-pack is performed", "value":null, "posttext":"", "range":[],"controlname":"VASNoShow", "child":[{"type":"select", "field":[{"fieldname":"Select type", "options":["By Store","By SKU"], "value":"By Store", "controlname":"VASSPSAlloc", "child":[]}]}]}]}}]',1),
('Value Added Services',2,'template2','Compliance Check',3,'Compliance Check','VASCompCheck',1,null, true,null,'[{"group":"Quantity % of Check", "fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Acceptable quantity percentage for compliance check is", "value":5, "posttext":"%", "range":[0,100], "controlname":"VASCCAcceptableQP", "child":[]}]}},{"group":"Instructions for Compliance Check", "fields":["field0"], "field0":{"type":"text", "field":[{"fieldname":"Type Instructions","placeholder":"Type Instructions", "value":null, "controlname":"VASIFCompCheck", "child":[]}]}},{"group":"Result % Accepted", "fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Acceptable result percentage for compliance check is", "value":98, "posttext":"%", "range":[0,100], "controlname":"VASARPCompCheck", "child":[]}]}}]',1),
('Value Added Services',2,'template2','Re-labeling',4,'Re-labeling','VASReLabel',1,null, true,null,'[{"group":"Supply of New Label", "fields":["field0"], "field0":{"type":"multi", "field":[{"fieldname":"Supply of New Label", "value":true, "controlname":"VASRLSNL", "child":[]}]}},{"group":"Re-labeling Instructions", "fields":["field0"], "field0":{"type":"text", "field":[{"fieldname":"Type Instructions","placeholder":"Type Instructions", "value":null, "controlname":"VASRLTInst", "child":[]}]}}]',1),
('Value Added Services',2,'template2','Repackaging',5,'Repackaging','VASRePack',1,null, true,null,'[{"group":"Supply of New Packages", "fields":["field0"], "field0":{"type":"multi", "field":[{"fieldname":"Supply of New Packages", "value":true, "controlname":"VASRPack", "child":[]}]}},{"group":"Re-packaging Instructions", "fields":["field0"], "field0":{"type":"text", "field":[{"fieldname":"Type Instructions","placeholder":"Type Instructions", "value":null, "controlname":"VASRPInst", "child":[]}]}}]',1),
('Value Added Services',2,'template2','Palletisation/Slipsheeting',6,'Palletisation/Slipsheeting','VASPS',1,null, true,null,'[{"group":null, "fields":["field0"], "field0":{"type":"multi", "field":[{"fieldname":"Supply of Wooden Pallet", "value":true, "controlname":"VASPSSWP", "child": [{"type":"inlineedit", "field":[{"pretext":"Dimensions : Length", "value":100, "posttext":"cm, ", "range":[100,300],"controlname":"VASPSWPLenDimen", "child":[]},{"pretext":" Width", "value":100, "posttext":"cm, ", "range":[100,300],"controlname":"VASPSWPWidthDimen", "child":[]},{"pretext":"Height", "value":100, "posttext":"cm", "range":[100,300], "controlname": "VASPSWPHtDimen", "child":[]}]},{"type":"select", "field":[{"fieldname":"Pallet handling requirement: ", "placeholder":"Select Type", "options":["2 Way","4 Way"], "value":"4 Way", "controlname":"VASSPSAlloc", "child":[]}]}]}]}},{"group":null, "fields":["field0"], "field0":{"type":"multi", "field":[{"fieldname":"Supply of Plastic Pallet", "value":true, "controlname":"VASPSSPP", "child": [{"type":"inlineedit", "field":[{"pretext":"Dimensions : Length", "value":100, "posttext":"cm,", "range":[100,300], "controlname":"VASPSPPLenDimen", "child":[]},{"pretext":" Width", "value":100, "posttext":"cm", "range":[100,300], "controlname":"VASPSPPWidthDimen", "child":[]},{"pretext":" Height", "value":100, "posttext":"cm", "range":[100,300], "controlname": "VASPSPPHtDimen", "child":[]}]},{"type":"select", "field":[{"fieldname":"Pallet handling requirement: ", "placeholder":"Select Type", "options":["2 Way","4 Way"], "value":"4 Way", "controlname":"VASSPPPSAlloc", "child":[]}]}]}]}},{"group":null, "fields":["field0"], "field0":{"type":"multi", "field":[{"fieldname":"Supply of Pallet Box", "value":true, "controlname":"VASPSSPB", "child": [{"type":"inlineedit", "field":[{"pretext":"Dimensions : Length", "value":100, "posttext":"cm,", "range":[100,300],"controlname":"VASPSPBLenDimen", "child":[]},{"pretext":" Width", "value":100, "posttext":"cm", "range":[100,300],"controlname":"VASPSPBWidthDimen", "child":[]},{"pretext":" Height", "value":100, "posttext":"cm", "range":[100,300], "controlname": "VASPSPBHtDimen", "child":[]}]},{"type":"select", "field":[{"fieldname":"Pallet handling requirement: ", "placeholder":"Select Type", "options":["2 Way","4 Way"], "value":"4 Way", "controlname":"VASSPPBSAlloc", "child":[]}]}]}]}},{"group":null, "fields":["field0"], "field0":{"type":"multi", "field":[{"fieldname":"Supply of Slipsheet", "value":true, "controlname":"VASPSSSS", "child": [{"type":"inlineedit", "field":[{"pretext":"Dimensions : Length", "value":100, "posttext":"cm,", "range":[100,300],"controlname":"VASPSSSLenDimen", "child":[]},{"pretext":" Width", "value":100, "posttext":"cm", "range":[100,300],"controlname":"VASPSSSWidthDimen", "child":[]}, {"pretext":" Height", "value":100, "posttext":"cm", "range":[100,300], "controlname": "VASPSSSHtDimen", "child":[]}]}]}]}},{"group":"Palletisation/Slipsheeting Instructions", "fields":["field0"], "field0":{"type":"select", "field":[{"fieldname":"Select Instruction", "options":["By SKU","By Store", "By Quantity"], "value":"By Store", "controlname":"VASPSInst", "child":[]}]}}]',1),
('Value Added Services',2,'template2','Garment on Hanger (GOH)',7,'Garment on Hanger (GOH)','VASGOH',1,null, true,null,'[{"group":"Garment on Hanger (GOH)","label":"", "fields":["field0"], "field0":{"type":"chipset", "field":[{"fieldname":"","selLabel":"Selected types of GOH Equipment", "value":["String System","Bar System","Mobile Trolley","GOH Cartons"], "options":["String System","Bar System","Mobile Trolley","GOH Cartons"],"unselLabel":"Add more details", "controlname": "VASGOHChipset", "child":[]}]}}]',1),
('Value Added Services',2,'template2','Crating',8,'Crating','VASCrating',1,null, true,null,'[{"group":"Supply of Crates", "fields":["field0"], "field0":{"type":"multi", "field":[{"fieldname":"Supply of Crates", "value":true, "controlname":"VASSOCrates", "child":[]}]}},{"group":"Crates Instructions", "fields":["field0"], "field0":{"type":"text", "field":[{"fieldname":"Type Instructions","placeholder":"Type Instructions", "value":null, "controlname":"VASCratingInst", "child":[]}]}}]',1),
('Value Added Services',2,'template2','Packaging Control',1,'Packaging Control','VASPackControl',1,null, true,null,'[{"group":"Packaging Control Instructions", "fields":["field0"], "field0":{"type":"text", "field":[{"fieldname":"Type Instructions","placeholder":"Type Instructions", "value":null, "controlname":"VASPCInst", "child":[]}]}}]',1),
('Cargo Consolidations',3,'template2','Split PO into Multiple Container',1,'Split PO into Multiple Container','CCSPOMC',1,null, true,null,null,1),
('Cargo Consolidations',3,'template2','Light Load',2,'Light Load','CCLightLoad',1,null, true,null,'[{"group":"Light Load Instructions", "fields":["field0"], "field0":{"type":"text", "field":[{"fieldname":"Type Instructions","placeholder":"Type Instructions", "value":null, "controlname":"CCLLInst", "child":[]}]}}]',1),
('Cargo Consolidations',3,'template2','Mix Load',3,'Mix Load','CCMixLoad',1,null, true,null,'[{"group":"Mix Load Instructions", "fields":["field0"], "field0":{"type":"text", "field":[{"fieldname":"Type Instructions","placeholder":"Type Instructions", "value":null, "controlname":"CCMLInst", "child":[]}]}}]',1),
('Cargo Consolidations',3,'template2','Allow Loading with Mix-Packaging',4,'Allow Loading with Mix-Packaging','CCALWMP',1,null, true,null,null,1),
('Cargo Consolidations',3,'template2','Other Consolidation Instructions',5,'Other Consolidation Instructions','CCOConsInst',1,null, true,null,'[{"group":"Type Other Consolidation Instructions", "fields":["field0"], "field0":{"type":"text", "field":[{"fieldname":"Type Instructions","placeholder":"Type Instructions", "value":null, "controlname":"CCOCInst", "child":[]}]}}]',1);
---Incase of removal of lookup type and lookup name TABLE
INSERT INTO waka.lookup_type (lookup_type, display_name, is_admin_owned,is_active, created_by) VALUES 
('account_type','Account Type',true, true,1),
('sop_status', 'SOP Status',false,true,1),
('document','Document',true,true,1),
('office_category','office category',false,true,1),
('address_type','address type',false, true,1),
('registration_type','Registration',true, true,1),
('service_type','Services',true,true,1),
('communication_instruction', 'Communication',true,true,1),
('origin_charges_charge_item','Origin Charge Item',true,true,1),
('freight_management_charge_item','Freight Management Charge Item',true,true,1),
('ocean_freight_charge_item','Ocean Charge Item', true,true,1),
('import_duty_charge_item','Import Charge Item',true,true,1),
('destination_services_charge_item','Destination Charge Item',true,true,1),
('currency','Currency',true,true,1);


select ln.lookup_name,ln.display_name, ln.lookup_type_id, lt.lookup_type,ln.seq,ln.is_active from waka.lookup_name ln join waka.lookup_type lt on lt.lookup_type_id = ln.lookup_type_id
INSERT INTO waka.lookup_name (lookup_name, display_name, lookup_type_id, seq, created_by) VALUES
('Consignee','Consignee',1,1,1),
('Freight Forwarder','Freight Forwarder',1,2,1),
('Shipper','Shipper',1,3,1),
('Carrier','Carrier',1,4,1),
('Enterprise','Enterprise',1,5,1),
('Vendor','Vendor',1,6,1),
('Notify','Notify Party',1,7,1),
('China and Origin Service Provider','China and Origin Service Provider',1,11,1),
('Destination Service Provider','Destination Service Provider',1,13,1),
('Draft','Draft',2,1,1),
('Approved','Approved',2,2,1),
('Active','Active',2,3,1),
('Closed','Closed',2,4,1),
('Inactive','Inactive',2,6,1),
('Lead','Lead',2,7,1),
('Government Documents','Government Documents',3,1,1),
('General','General',3,2,1),
('Commercial Documents','Commercial Documents',3,3,1),
('Commercial Invoice','Commercial Invoice',3,4,1),
('Container Manifest','Container Manifest',3,5,1),
('GSP Form A','GSP Form A',3,6,1),
('S/A Approval','S/A Approval',3,7,1),
('Commodity-specific','Commodity-specific',3,8,1),
('MSDS','MSDS',3,9,1),
('Electrical Licence','Electrical Licence',3,10,1),
('Fumigation Certificate','Fumigation Certificate',3,11,1),
('Packing List','Packing List',3,12,1),
('Shipping Documents','Shipping Documents',3,13,1),
('Forwarders Cargo Receipt','Forwarders Cargo Receipt',3,14,1),
('Document Dispatch','Document Dispatch',3,15,1),
('Dispatch Parties','Dispatch Parties',3,16,1),
('Principal','Principal',3,17,1),
('Certificate of Origin','Certificate of Origin',3,18,1),
('Oversea Agent','Oversea Agent',3,19,1),
('Others','Others',3,20,1),
('','',3,21,1),
('Example','Lead',3,22,1),
('Team Lead','Lead',3,23,1),
('sample','Lead',3,24,1),
('head quarters','head quarters',4,1,1),
('Regional office','Regional office',4,2,1),
('zonal office','zonal office',4,3,1),
('branch office','branch office',4,4,1),
('divisional office','divisional office',4,5,1),
('Team Lead','Lead',4,6,1),
('Sub-Branch','Sub-Branch',4,7,1),
('communication','communication',5,1,1),
('billing','billing',5,2,1),
('dispatch','dispatch',5,3,1),
('Example','Lead',5,4,1),
('office Category','Office Category',5,5,1),
('Client Address','Client Address',5,6,1),
('registered','registered',5,7,1),
('CIN','CIN',6,1,1),
('GSTIN','GSTIN',6,2,1),
('Origin Logistics Services','Origin Logistics Services',7,1,1),
('Vendor Management','Vendor Management',7,2,1),
('QC Centre at Origin','QC Centre at Origin',7,3,1),
('Freight Management','Freight Management',7,4,1),
('NVOCC','NVOCC',7,5,1),
('Destination Services','Destination Services',7,6,1),
('Shipment Tracking Services','Shipment Tracking Services',7,7,1),
('supplier_booking_amendment_fee','Supplier Booking Amendment Fee',9,1,1),
('supplier_booking_cancellation_fee','Supplier Booking Cancellation Fee',9,2,1),
('carrier_booking_fee','Carrier Booking Fee',9,3,1),
('carrier_booking_cancellation_fee','Carrier Booking Cancellation Fee',9,4,1),
('carrier_deadfreight','Carrier Deadfreight',9,5,1),
('equipment_management_fee','Equipment Management Fee',9,6,1),
('lcl_service_charge','LCL Service Charge',9,7,1),
('trucking_fee','Trucking Fee',9,8,1),
('documentation_fee','Documentation Fee',9,9,1),
('export_customs_clearance_fee','Export Customs Clearance Fee',9,10,1),
('late-come_application_fee','Late-come Application Fee',9,11,1),
('warehouse_unloading_charge','Warehouse Unloading Charge',9,12,1),
('warehouse_sorting_charge','Warehouse Sorting Charge',9,13,1),
('warehouse_gate_charge','Warehouse Gate Charge',9,14,1),
('warehouse_packing_charge','Warehouse Packing Charge',9,15,1),
('labour_charge','Labour Charge',9,16,1),
('palletisation_slipsheeting_charge','Palletisation/Slipsheeting Charge',9,17,1),
('scan_and_pack_charge','Scan and Pack Charge',9,18,1),
('goh_handling_charge','GOH Handling Charge',9,19,1),
('partitioning_charge','Partitioning Charge',9,20,1),
('warehouse_storage_fee','Warehouse Storage Fee',9,21,1),
('re-labelling_charge','Re-labelling Charge',9,22,1),
('repackaging_charge','Repackaging Charge',9,23,1),
('warehouse_material_charge','Warehouse Material Charge',9,24,1),
('qc_charge','QC Charge',9,25,1),
('qc_area_charge','QC Area Charge',9,26,1),
('qc_inspector_charge','QC Inspector Charge',9,27,1),
('ams_charge','AMS Charge',9,28,1),
('ens_charge','ENS Charge',9,29,1),
('aci_charge','ACI Charge',9,30,1),
('afr_charge','AFR Charge',9,31,1),
('terminal_handling_charge','Terminal Handling Charge (THC)',9,32,1),
('port_construction_charge','Port Construction Charge',9,33,1),
('port_security_charge_','Port Security Charge',9,34,1),
('port_congestion_surcharge','Port Congestion Surcharge',9,35,1),
('carrier_seal_charge','Carrier Seal Charge',9,36,1),
('vgm_fee','VGM Fee',9,37,1),
('vgm_amendment_fee','VGM Amendment Fee',9,38,1),
('carrier_b_l_fee','Carrier B/L Fee',9,39,1),
('carrier_b_l_amendment_fee','Carrier B/L Amendment Fee',9,40,1),
('telex_release','Telex Release',9,41,1),
('fcr_hbl_charge','FCR/HBL Charge',9,42,1),
('fcr_hbl_amendment_fee','FCR/HBL Amendment Fee',9,43,1),
('late_documentation_fee','Late Documentation Fee',9,44,1),
('cy_monitoring_fee','CY Monitoring Fee',10,1,1),
('handling_fee','Handling Fee',10,2,1),
('ocean_freight','Ocean Freight',11,1,1),
('low_sulphur_surcharge','Low Sulphur Surcharge (LSS)',11,2,1),
('import_duty_fee','Import Duty Fee',12,1,1),
('import_customs_clearance_fee','Import Customs Clearance Fee',12,2,1),
('customs_documentation_fee','Customs Documentation Fee',12,3,1),
('destination_terminal_handling_fee','Destination Terminal Handling Fee (DTHC)',13,1,1),
('port_construction_charge','Port Construction Charge',13,2,1),
('port_security_charge','Port Security Charge',13,3,1),
('port_congestion_surcharge','Port Congestion Surcharge',13,4,1),
('documentation_fee','Documentation Fee',13,5,1),
('agency_fee','Agency Fee',13,6,1),
('depot_handling_fee','Depot Handling Fee',13,7,1),
('detention_and_demurrage_fee','Detention and Demurrage Fee',13,8,1),
('lifting_charge','Lifting Charge',13,9,1),
('psa_portnet_processing_fee','PSA Portnet Processing Fee',13,10,1),
('import_processing_fee','Import Processing Fee',13,11,1),
('delivery_order_fee','Delivery Order Fee',13,12,1),
('container_haulage_charge','Container Haulage Charge',13,13,1),
('trucking_fee','Trucking Fee',13,14,1),
('fuel_surcharge','Fuel Surcharge',13,15,1),
('cleaning_charge','Cleaning Charge',13,16,1),
('warehouse_unloading_charge','Warehouse Unloading Charge',13,17,1),
('warehouse_sorting_charge','Warehouse Sorting Charge',13,18,1),
('warehouse_gate_charge','Warehouse Gate Charge',13,19,1),
('warehouse_packing_charge','Warehouse Packing Charge',13,20,1),
('labour_charge','Labour Charge',13,21,1),
('palletisation_slipsheeting_charge','Palletisation/Slipsheeting Charge',13,22,1),
('scan_and_pack_charge','Scan and Pack Charge',13,23,1),
('goh_handling_charge','GOH Handling Charge',13,24,1),
('warehouse_storage_fee','Warehouse Storage Fee',13,25,1),
('warehouse_material_charge','Warehouse Material Charge',13,26,1),
('gst','GST',13,27,1),
('USD','US Dollar',14,1,1),
('CNY','Chinese Yuan',14,2,1),
('HKD','Hong kong Dollar',14,3,1);

-- while upgrading issues faced and resolved with below script
alter table waka.contact_invite alter column designation drop not null;
alter table waka.contact_invite alter column department drop not null;

----Upto this upto date in waka.

