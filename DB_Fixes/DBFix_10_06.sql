ALTER TABLE waka.sop_orgin_port_details DROP CONSTRAINT sop_orgin_port_details_free_storage_days_fkey;

ALTER TABLE waka.po_ingestion_schedule ADD COLUMN test_response JSON;

ALTER TABLE waka.po_ingestion_schedule ADD COLUMN test_response_time NUMERIC;

ALTER TABLE waka.po_ingestion_schedule ADD COLUMN test_response_size TEXT;

ALTER TABLE waka.po_ingestion_schedule ADD COLUMN req_body_type VARCHAR;

ALTER TABLE waka.po_ingestion_schedule ADD COLUMN request_parameters JSON;

ALTER TABLE waka.po_ingestion_schedule ADD COLUMN request_body VARCHAR;

ALTER TABLE waka.lookup_name ADD CONSTRAINT unique_display_name UNIQUE(lookup_type_id,company_id,display_name);

ALTER TABLE waka.po_ingestion_schedule ADD COLUMN scheduler_uid TEXT;