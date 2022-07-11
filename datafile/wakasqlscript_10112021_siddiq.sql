--SOP LANDING COST TABLE STRUCTURE
DROP TABLE IF EXISTS waka.landing_cost;
CREATE TABLE waka.landing_cost(
	lc_id SERIAL PRIMARY KEY,
	html_template VARCHAR DEFAULT 'template1',
	grp VARCHAR NOT NULL,
	grp_seq INT,
	sub_grp VARCHAR,
	sub_grp_seq INT,
	lc_name VARCHAR NOT NULL,
	control_name VARCHAR NOT NULL UNIQUE,
	lc_seq INT,
	ui_img_file_name varchar,
	has_child BOOLEAN NOT NULL default false,
	fields JSON,
	view_text VARCHAR,
	is_deleted BOOLEAN DEFAULT false,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ
);

DROP TABLE IF EXISTS waka.sop_lc;
CREATE TABLE waka.sop_lc(
	sop_lc_id SERIAL PRIMARY KEY,
	sop_id INT NOT NULL REFERENCES waka.sop(sop_id) ON DELETE CASCADE,
    lc_id INT NOT NULL REFERENCES waka.landing_cost(lc_id) ON DELETE CASCADE,
	fields JSON NULL,
	--is_selected boolean default false,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ,
	UNIQUE (sop_id, lc_id)
);

INSERT INTO waka.landing_cost (grp, grp_seq, html_template, sub_grp, sub_grp_seq, lc_name, control_name, lc_seq, ui_img_file_name, has_child, view_text, fields, created_by) VALUES
('General Landed Cost',1,'template2','General Landed Cost',1,'General Landed Cost','GenLandCost',1,null, true,null,'[{"group":"General Landed Cost", "fields":["field0"], "field0":{"type":"chipset", "field":[{"fieldname":"", "selLabel":"Selected details are required to estimate the landed cost","value":["EXW Price of Product","FOB Price of Product","C&F Price of Product","CIF Price of Product"],"options":["EXW Price of Product","FOB Price of Product","C&F Price of Product","CIF Price of Product","Company Load (Overhead Allocation) Factor","Total Amount"], "controlname":"GenLandCostName","unselLabel":"Add more details", "child":[]}]}}]',1),
('Origin Services Landed Cost',2,'template2','Origin Services Landed Cost',2,'Origin Services Landed Cost','OrgSerLandCost',1,null, true,null,'[{"group":"Origin Services Landed Cost", "fields":["field0","field1"], "field0":{"type":"multi", "field":[{"fieldname":"Trucking cost from EXW to FOB", "value":true, "controlname":"TruckCost", "child": []}]}, "field1":{"type":"multi","field":[{"fieldname":"Local FOB Charges", "value":true, "controlname":"LocalFob", "child": [{"type":"chipset","field":[{"fieldname":"", "selLabel":"Selected details are required for local FOB charges","value":["Carrier’s THC","Carrier’s Other Charges"],"options":["Carrier’s THC","Carrier’s Other Charges","Air Terminal Charges","Air Forwarder Charges"], "controlname":"OrgSerLandCostFob","unselLabel":"Add more details", "child":[]}]}]}]}}]',1),
('Freight Services Landed Cost',3,'template2','Freight Services Landed Cost',3,'Freight Services Landed Cost','FriSerLandCost',1,null, true,null,'[{"group":"Freight Services Landed Cost", "fields":["field0"], "field0":{"type":"chipset", "field":[{"fieldname":"", "selLabel":"Selected details are required for the freight landed cost","value":["LCL Ocean Freight","Ocean Freight Per 20’","Ocean Freight Per 40’","Ocean Freight Per 45’","Airfreight Per KG","LCL Railfreight"],"options":["LCL Ocean Freight","Ocean Freight Per 20’","Ocean Freight Per 40’","Ocean Freight Per 45’","Airfreight Per KG","LCL Railfreight","Railfreight Per 20’","Railfreight Per 40’","Railfreight Per Wagon","LTL Roadfreight","Roadfreight Per 20’","Roadfreight Per 40’","Roadfreight Per 45’"], "controlname":"FriSerLandCostName","unselLabel":"Add more details", "child":[]}]}}]',1),
('Import Duty Landed Cost',4,'template2','Import Duty Landed Cost',4,'Import Duty Landed Cost','ImpDutyLandCost',1,null, true,null,'[{"group":"Import Duty Landed Cost", "fields":["field0"], "field0":{"type":"chipset", "field":[{"fieldname":"", "selLabel":"Selected details are required for the import duty cost","value":["Import HS Code of Product","Import Duty Rate for Product"],"options":["Import HS Code of Product","Import Duty Rate for Product"], "controlname":"ImpDutyLandCostName","unselLabel":"Add more details", "child":[]}]}}]',1),
('Import Handling Landed Cost',5,'template2','Import Handling Landed Cost',4,'Import Handling Landed Cost','ImpHandLandCost',1,null, true,null,'[{"group":"Import Handling Landed Cost", "fields":["field0"], "field0":{"type":"chipset", "field":[{"fieldname":"", "selLabel":"Selected details are required for the import handling cost","value":["Import Handling","Trucking Cost at Destination","DC Handling Cost"],"options":["Import Handling","Trucking Cost at Destination","DC Handling Cost"], "controlname":"ImpHandLandCostName","unselLabel":"Add more details", "child":[]}]}}]',1);

--Page Access Table structure.
DROP TABLE IF EXISTS waka.page_access;
CREATE TABLE waka.page_access(
	pa_id SERIAL PRIMARY KEY,
	user_id INT NOT NULL,
	email VARCHAR NOT NULL,
	name VARCHAR NOT NULL,
	ip_address VARCHAR NOT NULL,
	url VARCHAR NOT NULL,
	page_name VARCHAR NOT NULL,
	start_time TIMESTAMPTZ NOT NULL,
	end_time TIMESTAMPTZ NOT NULL,
	duration_ms INT NOT NULL,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SOP SERVICE CHARGES INVOICE TABLE STRUCTURE
DROP TABLE IF EXISTS waka.service_charges_inv;
CREATE TABLE waka.service_charges_inv(
	sci_id SERIAL PRIMARY KEY,
	html_template VARCHAR DEFAULT 'template1',
	grp VARCHAR NOT NULL,
	grp_seq INT,
	sub_grp VARCHAR,
	sub_grp_seq INT,
	invoice_name VARCHAR NOT NULL,
	control_name VARCHAR NOT NULL UNIQUE,
	invoice_seq INT,
	ui_img_file_name varchar,
	has_child BOOLEAN NOT NULL default false,
	fields JSON,
	view_text VARCHAR,
	is_deleted BOOLEAN DEFAULT false,
	is_alert BOOLEAN DEFAULT false,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ
);

DROP TABLE IF EXISTS waka.sop_sch_inv;
CREATE TABLE waka.sop_sch_inv(
	ssi_id SERIAL PRIMARY KEY,
	sop_port_id INT NOT NULL REFERENCES waka.sop_port(sop_port_id) ON DELETE CASCADE,
	sop_id INT NOT NULL REFERENCES waka.sop(sop_id) ON DELETE CASCADE,
    sci_id INT NOT NULL REFERENCES waka.service_charges_inv(sci_id) ON DELETE CASCADE,
	fields JSON NULL,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ,
	UNIQUE (sop_id, sci_id, sop_port_id)
);

truncate table waka.service_charges_inv restart identity cascade;
INSERT INTO waka.service_charges_inv (grp, grp_seq, html_template, sub_grp, sub_grp_seq, invoice_name, control_name, invoice_seq, ui_img_file_name, has_child, view_text, fields, is_alert, created_by) VALUES
('Origin Services Payment Terms',1,'template2','Origin Services Payment Terms',1,'Origin Services Payment Terms','OrgSerPayTerms',1,null,true,null,'[{"group":"Origin Services Payment Terms","fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Raise an invoice for origin office after", "value":7, "posttext":"days of delivery", "range":[0,30],"controlname":"OrgSerOrgOfficeRaiseInc", "child":[]}]}},{"group":"", "fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Payment term for the origin office is","value":7,"posttext":null,"range":[0,30],"controlname":"IncSelNoShow", "child":[{"type":"select", "field":[{"fieldname":"Select Term", "placeholder":"Select Terms", "options":["COD","Credit Term"], "methodName":"getTerms", "value":"", "controlname":"OrgserOrgOfficeSelectTerm", "child":[{"type":"inlineedit", "field":[{"pretext":"Credit Term is due for payment", "value":7, "posttext":"days after the delivery", "range":[0,30],"controlname":"OrgSerOrgOffCreditDue", "child":[]}]}]}]}]}]}},{"group":"","fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Raise an invoice for destination office after", "value":7, "posttext":"days of delivery", "range":[0,30],"controlname":"OrgSerDestOfficeRaiseInc", "child":[]}]}},{"group":"", "fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Raise an invoice for destination office after","value":7,"posttext":null,"range":[0,30],"controlname":"IncSelNoShow", "child":[{"type":"select", "field":[{"fieldname":"Select Term", "placeholder":"Select Terms", "options":["COD","Credit Term"], "methodName":"getTerms", "value":[], "controlname":"OrgSerDestOfficeSelectTerm", "child":[{"type":"inlineedit", "field":[{"pretext":"Credit Term is due for payment", "value":7, "posttext":"days after the delivery", "range":[0,30],"controlname":"OrgSerDestOffCreditDue", "child":[]}]}]}]}]}]}}]',false,1),
('Freight Management Payment Terms',2,'template2','Freight Management Payment Terms',1,'Freight Management Payment Terms','FriManPayTerms',2,null, true,null,'[{"group":"Freight Management Payment Terms","fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Raise an invoice for origin office after", "value":7, "posttext":"days of delivery", "range":[0,30],"controlname":"FriManOrgOfficeRaiseInc", "child":[]}]}},{"group":"", "fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Payment term for the origin office is","value":7,"posttext":null,"range":[0,30],"controlname":"IncSelNoShow", "child":[{"type":"select", "field":[{"fieldname":"Select Term", "placeholder":"Select Terms", "options":["COD","Credit Term"], "methodName":"getTerms", "value":[], "controlname":"FriManOrgOfficeSelectTerm", "child":[{"type":"inlineedit", "field":[{"pretext":"Credit Term is due for payment","value":7, "posttext":"days after the delivery", "range":[0,30],"controlname":"FriSerOrgOffCreditDue", "child":[]}]}]}]}]}]}},{"group":"","fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Raise an invoice for destination office after", "value":7, "posttext":"days of delivery", "range":[0,30],"controlname":"FriSerDestOfficeRaiseInc", "child":[]}]}},{"group":"", "fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Raise an invoice for destination office after","value":7,"posttext":null,"range":[0,30],"controlname":"IncSelNoShow", "child":[{"type":"select", "field":[{"fieldname":"Select Term", "placeholder":"Select Terms", "options":["COD","Credit Term"], "methodName":"getTerms", "value":[], "controlname":"FriSerDestOfficeSelectTerm", "child":[{"type":"inlineedit", "field":[{"pretext":"Credit Term is due for payment", "value":7, "posttext":"days after the delivery", "range":[0,30],"controlname":"FriSerDestOffCreditDue", "child":[]}]}]}]}]}]}}]',false,1),
('Ocean Freight Payment Terms',3,'template2','Ocean Freight Payment Terms',1,'Ocean Freight Payment Terms','OceanFriPayTerms',3,null, true,null,'[{"group":"Ocean Freight Payment Terms","fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Raise an invoice for origin office after", "value":7, "posttext":"days of delivery", "range":[0,30],"controlname":"OceanFriOrgOfficeRaiseInc", "child":[]}]}},{"group":"", "fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Payment term for the origin office is","value":7,"posttext":null,"range":[0,30],"controlname":"IncSelNoShow", "child":[{"type":"select", "field":[{"fieldname":"Select Term", "placeholder":"Select Terms", "options":["COD","Credit Term"], "methodName":"getTerms", "value":[], "controlname":"OceanFriOrgOfficeSelectTerm", "child":[{"type":"inlineedit", "field":[{"pretext":"Credit Term is due for payment", "value":7, "posttext":"days after the delivery", "range":[0,30],"controlname":"OceanFriOrgOffCreditDue", "child":[]}]}]}]}]}]}},{"group":"","fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Raise an invoice for destination office after", "value":7, "posttext":"days of delivery", "range":[0,30],"controlname":"OceanSerDestOfficeRaiseInc", "child":[]}]}},{"group":"", "fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Raise an invoice for destination office after","value":7,"posttext":null,"range":[0,30],"controlname":"IncSelNoShow", "child":[{"type":"select", "field":[{"fieldname":"Select Term", "placeholder":"Select Terms", "options":["COD","Credit Term"], "methodName":"getTerms", "value":[], "controlname":"OceanFriDestOfficeSelectTerm", "child":[{"type":"inlineedit", "field":[{"pretext":"Credit Term is due for payment", "value":7, "posttext":"days after the delivery", "range":[0,30],"controlname":"OceanSerDestOffCreditDue", "child":[]}]}]}]}]}]}}]',false,1),
('Import Duty Payment Terms',4,'template2','Import Duty Payment Terms',1,'Import Duty Payment Terms','ImpDutyPayTerms',4,null, true,null,'[{"group":"","fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Raise an invoice for destination office after", "value":7, "posttext":"days of delivery", "range":[0,30],"controlname":"DestOfficeRaiseInc", "child":[]}]}},{"group":"", "fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Raise an invoice for destination office after","value":7,"posttext":null,"range":[0,30],"controlname":"IncSelNoShow", "child":[{"type":"select", "field":[{"fieldname":"Select Term", "placeholder":"Select Terms", "options":["COD","Credit Term"], "methodName":"getTerms", "value":[], "controlname":"ImpDutyDestOfficeSelectTerm", "child":[{"type":"inlineedit", "field":[{"pretext":"Credit Term is due for payment","value":7, "posttext":"days after the delivery", "range":[0,30],"controlname":"ImpDutyDestOffCreditDue", "child":[]}]}]}]}]}]}}]',false,1),
('Destination Services Payment Terms',5,'template2','Destination Services Payment Terms',1,'Destination Services Payment Terms','DestSerPayTerms',5,null, true,null,'[{"group":"","fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Raise an invoice for destination office after", "value":7, "posttext":"days of delivery", "range":[0,30],"controlname":"DestOfficeRaiseInc", "child":[]}]}},{"group":"", "fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Raise an invoice for destination office after","value":7,"posttext":null,"range":[0,30],"controlname":"IncSelNoShow", "child":[{"type":"select", "field":[{"fieldname":"Select Term", "selectvalue":true , "placeholder":"Select Terms", "options":["COD","Credit Term"], "methodName":"getTerms", "value":[], "controlname":"DestSerDestOfficeSelectTerm", "child":[{"type":"inlineedit", "field":[{"pretext":"Credit Term is due for payment", "value":7, "posttext":"days after the delivery", "range":[0,30],"controlname":"DestSerDestOffCreditDue", "child":[]}]}]}]}]}]}}]',false,1),
('Contents of Invoices',6,'template2','Contents of Invoices',1,'Contents of Invoices','ContInc',6,null, true,null,'[{"group":"","fields":["field0"], "field0":{"type":"chipset", "field":[{"fieldname":"","selLabel":"Selected details are required for invoices", "value":["Invoice Number","Invoice Date","Vessel/Voyage Number","PO/Item Number","Booking Number","Container Number","HBL/FCR Number","Master Bill of Lading Number"], "options":["Invoice Number","Invoice Date","Vessel/Voyage Number","PO/Item Number","Booking Number","Container Number","HBL/FCR Number","Master Bill of Lading Number","Bill to Party","Loading Port","Discharging Port","Number of Packag","Volume","Quantity","Gross Weight","Service Charge Type","Unit of Measurement","Currency","Unit Rate","Total Amount","Credit Terms","Bank Account Details for Remittance"],"unselLabel":"Add more details", "controlname": "ContVoiceChipset", "child":[]}]}}]',false,1),
('Invoicing Information for Shipment Services',7,'template2','Invoicing Information for Shipment Services',1,'Invoicing Information for Shipment Services','IncInfoShipser',7,null, true,null,'[{"group":"Invoice address details","fields":["field0"], "field0":{"type":"chipset-mandatory", "field":[{"fieldname":"","selLabel":"Selected mandatory details will be mentioned in the invoice", "value":["Invoice From","Invoice To"], "options":[],"unselLabel":"","controlname": "IncAddDetails", "child":[]}]}},{"group":"Define duration for invoice generation", "fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Invoice will be generated on","value":7,"posttext":"","range":[0,30],"controlname":"IncSelNoShow", "child":[{"type":"select", "field":[{"fieldname":"Select Type", "posttext":"basis", "placeholder":"Select Type",  "options":["Weekly","Monthly"], "methodName":"getDurationType", "value":[],"controlname":"IncGentype", "child":[]}]}]}]}},{"group":"Invoicing Time","fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Invoice to be generated on", "value":7, "posttext":"th day of the week", "range":[1,7],"controlname":"IncGenTime", "child":[]}]}},{"group":"","fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Reminder to generate invoice", "value":7, "posttext":"days after Vessel Departure", "range":[1,30],"is_alert":true,"controlname":"IncRemTime", "child":[]}]}}]',true,1),
('Invoicing Information for Other Services',8,'template2','Invoicing Information for Other Services',1,'Invoicing Information for Other Services','IncInfoOtherSer',8,null, true,null,'[{"group":"Invoice address details","fields":["field0"], "field0":{"type":"chipset-mandatory", "field":[{"fieldname":"","selLabel":"Selected mandatory details will be mentioned in the invoice", "value":["Invoice From","Invoice To"], "options":[],"unselLabel":"","controlname": "IncAddDetails", "child":[]}]}},{"group":"Define duration for invoice generation", "fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Invoice will be generated on","value":7,"posttext":"","range":[0,30],"controlname":"IncSelNoShow", "child":[{"type":"select", "field":[{"fieldname":"Select Type", "posttext":"basis", "placeholder":"Select Type",  "options":["Weekly","Monthly"], "methodName":"getDurationType", "value":[],"controlname":"IncGentype", "child":[]}]}]}]}},{"group":"Invoicing Time","fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Invoice to be generated on", "value":7, "posttext":"th day of the week", "range":[1,7],"controlname":"IncGenTime", "child":[]}]}},{"group":"","fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Reminder to generate invoice", "value":7, "posttext":"days after Vessel Departure", "range":[1,30],"is_alert":true,"controlname":"IncRemTime", "child":[]}]}}]',true,1),
('Payment Reminder',9,'template2','Payment Reminder',1,'Payment Reminder','payRem',9,null, true,null,'[{"group":"","fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Payment must be cleared before", "value":7, "posttext":"days after the invoice is issued", "range":[0,30], "is_alert":true,"controlname":"payRemName", "child":[]}]}}]',true,1);

-- SOP DOCUMENTS TABLE STRUCTURE
DROP TABLE IF EXISTS waka.documents CASCADE;
CREATE TABLE waka.documents(
	doc_id SERIAL PRIMARY KEY,
	html_template VARCHAR DEFAULT 'template2',
	grp VARCHAR NOT NULL,
	grp_seq INT,
	sub_grp VARCHAR,
	sub_grp_seq INT,
	doc_name VARCHAR NOT NULL,
	control_name VARCHAR NOT NULL UNIQUE,
	doc_seq INT,
	ui_img_file_name varchar,
	has_child BOOLEAN NOT NULL default false,
	fields JSON,
	view_text VARCHAR,
	is_completed BOOLEAN DEFAULT true,
	is_alert BOOLEAN DEFAULT false,
	is_deleted BOOLEAN DEFAULT false,
	is_selected BOOLEAN,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ
);

INSERT INTO waka.documents (grp, grp_seq, html_template, sub_grp, sub_grp_seq, doc_name, control_name, doc_seq, ui_img_file_name, has_child, view_text, fields, is_completed, is_alert, is_selected, created_by) VALUES
('Government',1,'template2','Issuance of General Documents',1,'Issuance of General Documents','IssGenDocs',1,null, true,null,'[{"group":"Issuance of General Documents","fields":["field0"], "field0":{"type":"chipset-mandatory", "field":[{"fieldname":"","selLabel":"Selected general documents will be issued", "value":["Certificate of Origin"], "options":[],"unselLabel":"", "controlname": "IssGenDocsName", "child":[]}]}}]',false,false,null,1),
('Government',1,'template2','Issuance of Commodity Specific Documents',2,'Issuance of Commodity Specific Documents','IssCommSpecDocs',2,null, true,null,'[{"group":"Issuance of Commodity Specific Documents","fields":["field0"], "field0":{"type":"chipset", "field":[{"fieldname":"","selLabel":"Selected commodity specific documents will be issued", "value":["Electrical License"], "options":["Electrical License","Food Product Certificate"],"unselLabel":"Add more documents", "controlname": "IssCommSpecDocsName", "child":[]}]}}]',false,false,null,1),
('Commercial',2,'template2','Issuance of Commercial Invoice',1,'Issuance of Commercial Invoice','IssCommInv',1,null, true,null,'[{"group":"Issuance of Commercial Invoice","label":"Selected commercial invoice format will be available on the platform", "fields":["field0"], "field0":{"type":"select", "field":[{"fieldname":"Select Format", "placeholder":"Select Format", "options":["Use my format","Use WAKA standard format"], "methodName":"getIssCommInvtFormat", "value":null, "controlname":"IssCommDocsSelect", "child":[{"type":"chipset-file", "field":[{"fieldname":"","selLabel":"","uploadedFileName":[], "value":[], "options":[],"unselLabel":"", "controlname": "IssCommDocsFile", "child":[]}]}]}]}},{"group":"Define the number of documents required","fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Number of originals", "value":7, "posttext":"", "range":[0,50],"controlname":"IssCommInvNoOfDocs", "child":[]},{"pretext":"and number of copies", "value":10, "posttext":"", "range":[0,50],"controlname":"IssCommInvNoofCopies", "child":[]}]}}]',false,false,true,1),
('Commercial',2,'template2','Issuance of Packing List',2,'Issuance of Packing List','IssPackList',2,null, true,null,'[{"group":"Issuance of Packing List","label":"Selected packing list format will be available on the platform", "fields":["field0"], "field0":{"type":"select", "field":[{"fieldname":"Select Format", "placeholder":"Select Format", "options":["Use my format","Use WAKA standard format"], "methodName":"getIssPackListFormat", "value":[], "controlname":"IssPackListSelect", "child":[{"type":"chipset-file", "field":[{"fieldname":"","selLabel":"","uploadedFileName":[], "value":[], "options":[],"unselLabel":"", "controlname": "IssPackListFile", "child":[]}]}]}]}},{"group":"Define the number of documents required","fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Number of originals", "value":7, "posttext":"", "range":[0,30],"controlname":"IssPackListNoOfDocs", "child":[]},{"pretext":"and number of copies", "value":98, "posttext":"", "range":[0,100],"controlname":"IssPackListNoofCopies", "child":[]}]}}]',false,false,true,1),
('Commercial',2,'template2','Issuance of MSDS (Material Safety Data Sheet)',3,'Issuance of MSDS (Material Safety Data Sheet)','IssMsds',3,null, true,null,'[{"group":"Issuance of MSDS (Material Safety Data Sheet)","label":"MSDS document will be managed by Freight Forwarder", "fields":["field0"], "field0":[{"controlname":"IssMsdsName"}]}]',false,false,true,1),
('Shipping',3,'template2','Issuance of Forwarders Cargo Receipt/ House Bill of Lading/ House Sea Waybill',1,'Issuance of Forwarders Cargo Receipt/ House Bill of Lading/ House Sea Waybill','IssForCargoBills',1,null, true,null,'[{"group":"Selected document type that needs to be issued", "fields":["field0"], "field0":{"type":"chipset", "field":[{"fieldname":"",  "selLabel":"Selected parties","options":["Forwarders Cargo Receipt","House Bill of Lading/ House Sea Waybill"], "value":["Forwarders Cargo Receipt","House Bill of Lading/ House Sea Waybill"], "controlname":"IssForCargoBillsDocType","unselLabel":"Unselected parties", "child":[]}]}},{"group":"Define the number of documents required","fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Number of originals", "value":7, "posttext":"and number of copies", "range":[0,30],"controlname":"IssForCargoRemainderToGenerate", "child":[]},{"pretext":"", "value":98, "posttext":"", "range":[0,100],"controlname":"IssForCargoNoofCopies", "child":[]}]}},{"group":"Reminder for issuance of documents","is_alert":true ,"fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"FCR/HBL to be issued", "value":7, "posttext":"days after", "range":[0,30],"controlname":"FCRRemainderToGenerate", "child":[{"type":"select", "field":[{"fieldname":"Select Data Type", "options":["Cargo Receiving Date","CFS Cutoff Date"], "value":null, "controlname":"FCRSelectDataType", "child":[]}]}]}]}},{"group":"","fields":["field0"], "field0":{"type":"multi", "field":[{"fieldname":"House Bill of Lading or House Sea WayBill must be dated and issued on the day the cargoes are shipped on board", "value":true, "controlname":"HouseBillIssued", "child": []},{"fieldname":"Remarks on the conditions of the cargoes as stipulated on the Dock Receipts are to be stated on the FCR or House Bill of Lading or House Sea Waybill or House Sea Waybill", "value":true, "controlname":"RemarkCargoDock", "child": []},{"fieldname":"Issue Received of Shipment FCR for overflow of cargoes", "value":true, "controlname":"IssueReceiveShip", "child": []},{"fieldname":"Allow issue one set of FCR or House Bill of Lading or House Sea Waybill per split shipment", "value":true, "controlname":"AllowIssueFCR", "child": []}]}},{"group":"Selected party types and the respective details will be mentioned in the issued documents", "fields":["field0"], "field0":{"type":"chipset", "field":[{"fieldname":"",  "selLabel":"Selected parties","options":["Notify Party","Supplier","Principal"], "value":["Supplier","Principal"], "controlname":"IssForCargoBillsSelectedParty","unselLabel":"Unselected parties", "child":[]}]}}]',false,true,true,1),
('Shipping',3,'template2','Issuance of Master Bill of Lading/Sea Waybill',2,'Issuance of Master Bill of Lading/Sea Waybill','IssMasterBills',2,null, true,null,'[{"group":"Selected document type that needs to be issued ", "fields":["field0"], "field0":{"type":"chipset", "field":[{"fieldname":"",  "selLabel":"Selected parties","options":["Forwarders Cargo Receipt","House Bill of Lading/ House Sea Waybill"], "value":["Forwarders Cargo Receipt","House Bill of Lading/ House Sea Waybill"], "controlname":"IssMasterBillsDocType","unselLabel":"Unselected parties", "child":[]}]}},{"group":"Define the number of documents required","fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Number of originals", "value":7, "posttext":"and number of copies", "range":[0,30],"controlname":"IssMasterBillsRemainderToGenerate", "child":[]},{"pretext":"", "value":98, "posttext":"", "range":[0,100],"controlname":"IssMasterBillstNoofCopies", "child":[]}]}},{"group":"Reminder for issuance of documents","label":"","is_alert":true, "fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Master Bill of Lading/Sea WayBill to be issued", "value":7, "posttext":"days after Vessel Departure Date", "range":[0,30],"controlname":"MasterFCRRemainderToGenerate", "child":[]}]}},{"group":"","fields":["field0"], "field0":{"type":"multi", "field":[{"fieldname":"House Bill of Lading or House Sea WayBill must be dated and issued on the day the cargoes are shipped on board", "value":true, "controlname":"MasterHouseBillIssued", "child": []},{"fieldname":"Remarks on the conditions of the cargoes as stipulated on the Dock Receipts are to be stated on the FCR or House Bill of Lading or House Sea Waybill or House Sea Waybill", "value":true, "controlname":"MasterRemarkCargoDock", "child": []},{"fieldname":"Issue Received of Shipment FCR for overflow of cargoes", "value":true, "controlname":"MasterIssueReceiveShip", "child": []},{"fieldname":"Allow issue one set of FCR or House Bill of Lading or House Sea Waybill per split shipment", "value":true, "controlname":"MasterAllowIssueFCR", "child": []}]}},{"group":"Selected party types and the respective details will be mentioned in the issued documents", "fields":["field0"], "field0":{"type":"chipset", "field":[{"fieldname":"",  "selLabel":"Selected parties","options":["Notify Party","Supplier","Principal"], "value":["Supplier","Principal"], "controlname":"IssMasterBillsSelectedParty","unselLabel":"Unselected parties", "child":[]}]}}]',false,true,true,1),
('Shipping',3,'template2','Issuance of Bill of Lading/Sea Waybill from Coloader',3,'Issuance of Bill of Lading/Sea Waybill from Coloader','IssColoaderBills',2,null, true,null,'[{"group":"Define the number of documents required","fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Number of originals", "value":7, "posttext":"and number of copies", "range":[0,30],"controlname":"IssColoaderBillsNoofCopies", "child":[]},{"pretext":"", "value":98, "posttext":"", "range":[0,100],"controlname":"IssColoaderBillsNoofCopiesName", "child":[]}]}},{"group":"Reminder for issuance of documents","label":"", "is_alert":true ,"fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"FCR/HBL to be issued", "value":7, "posttext":"days after Vessel Departure", "range":[0,30],"controlname":"RemIssDoc", "child":[]}]}},{"group":"","fields":["field0"], "field0":{"type":"multi", "field":[{"fieldname":"Issue One Single House Bill of Lading/Sea Waybill if Containers with same Ship Mode, From same Loading Port, To same Discharging Port, on the same Vessel Voyage and Carrier", "value":true, "controlname":"IssShipMode", "child": []}]}},{"group":"Selected party types and the respective details will be mentioned in the issued documents", "fields":["field0"], "field0":{"type":"chipset", "field":[{"fieldname":"",  "selLabel":"Selected parties","options":["Notify Party","Supplier","Principal"], "value":["Supplier","Principal"], "controlname":"IssShipModeSelectedParty","unselLabel":"Unselected parties", "child":[]}]}}]',false,true,true,1),
('Shipping',3,'template2','Issuance of Master Air Waybill and House Air Waybill',4,'Issuance of Master Air Waybill and House Air Waybill','IssMasterAirBills',2,null, true,null,'[{"group":"Define the number of documents required","fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Number of originals", "value":7, "posttext":"and number of copies", "range":[0,30],"controlname":"IssMasterAirBillsNoOfCopies", "child":[]},{"pretext":"", "value":98, "posttext":"", "range":[0,100],"controlname":"IssMasterAirBillsNoOfCopiesName", "child":[]}]}},{"group":"Selected party types and the respective details will be mentioned in the issued documents", "fields":["field0"], "field0":{"type":"chipset", "field":[{"fieldname":"",  "selLabel":"Selected parties","options":["Notify Party","Supplier","Principal"], "value":["Supplier","Principal"], "controlname":"IssMasterAirBillsSelectedParty","unselLabel":"Unselected parties", "child":[]}]}}]',false,false,true,1),
('Shipping',3,'template2','Issuance of Container Manifest',5,'Issuance of Container Manifest','IssContManifest',2,null, true,null,'[{"group":"Issuance of Container Manifest","label":"Required to attach the consolidated information pertaining to the contents in the container", "fields":["field0"], "field0":[{"controlname":"IssContManifestName"}]}]',false,false,null,1),
('Documents Despatch',4,'template2','Reminder to Generate Documents Despatch',1,'Reminder to Generate Documents Despatch','RemGenDocsDis',1,null, true,null,'[{"group":"Reminder to Generate Documents Despatch","label":"", "is_alert":true ,"fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Documents will be despatched", "value":7, "posttext":"days after Vessel Departure", "range":[0,30],"controlname":"RemGenDocsDisName", "child":[]}]}}]',false,true,null,1),
('Documents Despatch',4,'template2','Document Despatch to Parties',2,'Document Despatch to Parties','DocDispToParty',2,null, true,null,'[{"group":"Document Despatch to Parties","label":"Selected parties will receive despatched documents", "fields":["field0"], "field0":{"type":"select", "field":[{"fieldname":"Principal Details", "placeholder":"Select Principal Users", "options":[], "methodName":"getConsigneeContacts", "value":[], "controlname":"DocDispToPartyPrincipal", "child":[]},{"fieldname":"Freight Forwarder", "placeholder":"Select Frieght Forwarder Users", "options":[], "methodName":"getFFContacts", "value":[], "controlname":"DocDispToPartyForwarder", "child":[]}]}}]',false,false,null,1);

DROP TABLE IF EXISTS waka.sop_document;
CREATE TABLE waka.sop_document(
	sd_id SERIAL PRIMARY KEY,
	sop_port_id INT NOT NULL REFERENCES waka.sop_port(sop_port_id) ON DELETE CASCADE,
	sop_id INT NOT NULL REFERENCES waka.sop(sop_id) ON DELETE CASCADE,
    doc_id INT NOT NULL REFERENCES waka.documents(doc_id) ON DELETE CASCADE,
	fields JSON NULL,
	is_selected BOOLEAN,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ,
	UNIQUE (sop_id, doc_id, sop_port_id)
);

--lookup_query: 
update waka.lookup_type set display_name='Origin Services' where lookup_type_id=9;
update waka.lookup_type set display_name='Freight Management' where lookup_type_id=10;
update waka.lookup_type set display_name='Ocean Freight' where lookup_type_id=11;
update waka.lookup_type set display_name='Import Duty' where lookup_type_id=12;

--lookup type charge uom: 
INSERT INTO waka.lookup_type (lookup_type, display_name, is_admin_owned, created_by) VALUES ('charge_uom', 'Charge UOM', true, 1);
INSERT INTO waka.lookup_name (lookup_name,display_name, lookup_type_id, company_id,seq, created_by) VALUES ('Per Shipment', 'Per Shipment', (select lookup_type_id from waka.lookup_type where lookup_type='charge_uom' limit 1),(select company_id from waka.company where company_name='waka' limit 1),1,1);

ALTER TABLE waka.sop_service_charges ALTER COLUMN uom TYPE int USING uom::INTEGER;