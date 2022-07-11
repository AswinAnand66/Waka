UPDATE waka.po_booking SET fields = '[ { "group": "Generate Booking Confirmation for Supplier", "fields": [ "field0" ], "field0": { "type": "inlineedit", "field": [ { "pretext": "Generate booking confirmation", "value": 21, "posttext": "days prior to", "range": [ 1, 365 ], "controlname": "RemainderToGenerate", "child": [ { "type": "select", "field": [ { "fieldname": "Select Data Type", "options": [ "Cargo Ready Date", "Contract Shipment Date" ], "value": "Cargo Ready Date", "controlname": "POPSelectDataType", "child": [] } ] } ] } ] } }, { "group": "Include Estimated Sailing Information in Booking Confirmation", "label": "", "fields": [ "field0" ], "field0": { "type": "multi", "field": [ { "fieldname": "Include Estimated Sailing Information in Booking Confirmation", "label": "Estimated Sailing information will provide context for the booking confirmation", "value": true, "controlname": "SBIESIinBookConfirm", "child": [] } ] } } ]' WHERE control_name = 'GBCToSupplier';

CREATE TABLE waka.shipment_booking (
	sb_id SERIAL PRIMARY KEY,
	supplier_id INT,
	consignee_id INT,
	ff_id INT,
	origin_port_id INT,
	dest_port_id INT,
	shipment_group _varchar,
	ref_date DATE,
	ref_type VARCHAR,
	total_cbm NUMERIC,
	total_teu INT,
	total_weight_kgs NUMERIC,
	ship_date timestamp,
	delivery_date timestamp,
	cargo_ready_date timestamp,
	created_by INT,
	modified_by INT,
	modified_on INT,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE waka.shipment_booking ADD CONSTRAINT shipment_booking_created_by_fkey FOREIGN KEY (created_by) REFERENCES waka.login_user(user_id) ON DELETE CASCADE;
ALTER TABLE waka.shipment_booking ADD CONSTRAINT shipment_booking_modified_on_fkey FOREIGN KEY (modified_on) REFERENCES waka.login_user(user_id) ON DELETE CASCADE;

CREATE TABLE waka.shipment_booking_details (
	sbd_id SERIAL PRIMARY KEY,
	sb_id INT NOT NULL,
	po_id INT,
	order_number INT,
	product VARCHAR,
	product_description VARCHAR,
	product_category VARCHAR,
	po_qty INT,
	shipment_qty INT,
	unit INT,
	weight INT,
	cbm INT,
	created_by INT NOT NULL,
	modified_by INT,
	modified_on INT,
	created_on timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE waka.shipment_booking_details ADD CONSTRAINT shipment_booking_details_created_by_fkey FOREIGN KEY (created_by) REFERENCES waka.login_user(user_id) ON DELETE CASCADE;
ALTER TABLE waka.shipment_booking_details ADD CONSTRAINT shipment_booking_details_modified_on_fkey FOREIGN KEY (modified_on) REFERENCES waka.login_user(user_id) ON DELETE CASCADE;
ALTER TABLE waka.shipment_booking_details ADD CONSTRAINT shipment_booking_details_sb_id_fkey FOREIGN KEY (sb_id) REFERENCES waka.shipment_booking(sb_id) ON DELETE CASCADE;