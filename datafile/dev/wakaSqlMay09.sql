ALTER TABLE waka.company_invite DROP COLUMN poi_master_error_id;

ALTER TABLE waka.company_invite ADD COLUMN poi_master_error_id INT NULL;

ALTER TABLE waka.lookup_name DROP CONSTRAINT lookup_name_lookup_type_id_lookup_name_key;

ALTER TABLE waka.lookup_name ADD CONSTRAINT lookup_name_lookup_type_id_lookup_name_key UNIQUE (lookup_type_id, company_id , lookup_name);

-- Above query executed on May 09 --

ALTER TABLE waka.shipment_booking DROP COLUMN created_on;
ALTER TABLE waka.shipment_booking ADD COLUMN created_on TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE waka.shipment_booking ALTER COLUMN modified_on DROP NOT NULL;

ALTER TABLE waka.shipment_booking_details DROP COLUMN created_on;
ALTER TABLE waka.shipment_booking_details ADD COLUMN created_on TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE waka.shipment_booking_details ALTER COLUMN modified_on DROP NOT NULL;

DROP TABLE IF EXISTS waka.po_booking_details;
CREATE TABLE waka.po_booking_details (
	po_bd_id SERIAL PRIMARY KEY,
	sop_id INT REFERENCES waka.sop(sop_id) ON DELETE CASCADE,
	generate_date JSON,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO  waka.po_booking_details (sop_id, created_by) VALUES (553, 199);


-- Query executed on may 10 as below --

UPDATE waka.sub_modules SET sub_module_name = 'Map Enabled Services' WHERE sub_module_name = 'Map Services';

UPDATE waka.sub_modules SET sub_module_name = 'Services' WHERE sub_module_name = 'Third Party Services' AND module_id IN (SELECT module_id FROM waka.modules WHERE module_name = 'Admin');

UPDATE waka.po_booking SET fields = '[{"group":"Purchase Order Posting","fields":["field0"],"field0":{"type":"inlineedit","field":[{"pretext":"PO must be posted to the waka platform","value":14,"posttext":"days prior to","range":[0,30],"controlname":"DatePriorCRD","child":[{"type":"select","field":[{"fieldname":"Select Data Type","options":["Cargo Ready Date","Contract Shipment Date"],"value":"Cargo Ready Date","controlname":"POPSelectDataType","child":[]}]}]}]}},{"group":"Exception Alert for Purchase Order Uploaded","label":"The selected parties must be notified in case of an exception alert","fields":["field0"],"field0":{"type":"select-users","field":[{"fieldname":"Principal Details","placeholder":"Select Principal Users","options":[],"methodName":"getConsigneeContacts","value":[],"controlname":"POPPUEPrincipal","child":[{"type":"chipset","field":[{"fieldname":"","selLabel":"","value":[],"options":[],"unselLabel":"","controlname":"POPPUEPrincipalUsers","child":[]}]}]},{"fieldname":"Freight Forwarder Details","placeholder":"Select Forwarder Users","options":[],"methodName":"getFFContacts","value":[],"controlname":"POPPUEForwarder","child":[{"type":"chipset","field":[{"fieldname":"","selLabel":"","value":[],"options":[],"unselLabel":"","controlname":"POPPUEForwarderUsers","child":[]}]}]}]}}]' WHERE control_name = 'POPlacement';

UPDATE waka.po_booking SET fields = '[{"group":"Grouping Criteria", "fields":["field0"], "field0":{"type":"chipset-mandatory", "field":[{"fieldname":"","selLabel":"Selected are the mandatory details to group your POs for Booking Confirmation", "value":["Discharging Port","Incoterms","Loading Port","Ship Mode","Shipment Window","Supplier","Transport Mode"], "options":[],"unselLabel":"Add more details", "controlname": "SBGrpingCriteriaMandatory", "child":[]}]}},{"group":"Grouping Criteria Selection", "fields":["field0"], "field0":{"type":"chipset", "field":[{"fieldname":"","selLabel":"Selected are the additional details to group your POs for Booking Confirmation", "value":["PO Number","Pack Type"],"options":["PO Number","Item Type","Assortment","Pack Type","Distribution Center","HS Code","Fumigation","Compliance Check","Palletisation/Slip Sheeting","Re-Labeling","Scan-and-Pack","Repackaging"],"unselLabel":"Add more details", "controlname": "SBGrpingCriteria", "child":[]}]}}]' WHERE control_name = 'POGroupingCriteriaBookingConfirmation';

UPDATE waka.po_booking SET fields = '[{"group":"Receive PO Confirmation by Supplier", "fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Once the principal''s PO is received, the supplier must send an order confirmation within","value":"21", "posttext":"Days", "range":[0,30], "controlname":"POConfirmationBySupplier", "child":[]}]}},{"group":"Require Principal''s Reconfirmation for updates on PO details during the order confirmation", "fields":["field0"], "field0":{"type":"chipset", "field":[{"fieldname":"", "selLabel":"Selected details will require approval from the principal on the updated PO details","value":["Cargo Ready Date","Loading Port","Discharging Port","Product/Item Number","Quantity","Unit Price"],"options":["Cargo Ready Date","Loading Port","Discharging Port","Product/Item Number","Quantity","Unit Price","Fumigation","Scan-and-Pack","Re-labeling","Repackaging","Compliance Check","Cargo Pick-up/Trucking","Crating","Palletisation and Slip Sheeting","Garment-on-Hanger (GOH)"], "controlname":"RRCCargoReadyDate","unselLabel":"Add more details", "child":[]}]}}]' WHERE control_name = 'POConfirmation';

UPDATE waka.carrier SET fields = '[{"group":"Frequency of Forecast to Carrier","fields":["field0"],"field0":{"type":"inlineedit","is_alert":true,"field":[{"pretext":"Remind carrier to generate periodic forecast for every ","value": 8,"posttext":"weeks","range":[1,12],"controlname":"FFCForcast","child":[]}]}},{"group":"Data to be used in Forecast","fields":["field0"],"field0":{"type":"chipset","field":[{"fieldname":"","selLabel":"Select the type of data that should be used in the carrier forecast","options":["PO Data","Historical Shipment Data"],"value":["PO Data","Historical Shipment Data"],"controlname":"DUForcast","unselLabel":"Add more details","child":[]}]}},{"group":"Start day of the week for the Forecast","fields":["field0"],"field0":{"type":"inlineedit","field":[{"pretext":"Carrier forecast should commence on","value":7,"posttext":"","range":[0,30],"controlname":"ForSelNoShow","child":[{"type":"select","field":[{"fieldname":"Select Day","placeholder":"Select Type","posttext":"of every week","options":["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],"methodName":"getDay","value":[],"controlname":"CFDay","child":[]}]}]}]}}]' WHERE control_name = 'CarrierForcast';

UPDATE waka.carrier SET fields = '[{"group":"Arrange periodic updates of the Sailing Schedule","fields":["field0"],"field0":{"type":"inlineedit","field":[{"pretext":"Receive an updated sailing schedule for the next","value":12,"posttext":"week sailing","range":[1,4],"controlname":"PUSSMaintain","child":[]}]}},{"group":"Sailing Schedule Details","fields":["field0"],"field0":{"type":"chipset","field":[{"fieldname":"","selLabel":"Selected details must be mentioned in the sailing schedule","options":["VGM Cutoff","SI Cutoff","CFS Opening","CFS Closing","CY Opening","CY Closing","Carrier Name","Service Routes","Vessel Name","Voyage","Loading Port","Discharging Port","ETD","ETA"],"value":["Carrier Name","Service Routes","Vessel Name","Voyage","Loading Port","Discharging Port","ETD","ETA"],"controlname":"DUForcast","unselLabel":"Add more details","child":[]}]}},{"group":"Email sailing schedule to the selected parties","label":"Selected parties must be notified on the sailing schedule via email","fields":["field0"],"field0":{"type":"select-users","field":[{"fieldname":"Principal Details","placeholder":"Select Principal Users","options":[],"methodName":"getConsigneeContacts","value":[],"controlname":"EmailSailPrincipal","child":[{"type":"chipset","field":[{"fieldname":"","selLabel":"","value":[],"options":[],"unselLabel":"","controlname":"DocDispToPartyPrincipalUsers","child":[]}]}]},{"fieldname":"Freight Forwarder Details","placeholder":"Select Forwarder Users","options":[],"methodName":"getFFContacts","value":[],"controlname":"EmailSailForwarder","child":[{"type":"chipset","field":[{"fieldname":"","selLabel":"","value":[],"options":[],"unselLabel":"","controlname":"DocDispToPartyForwarderUsers","child":[]}]}]}]}},{"group":"Sailing schedule reminder via email","fields":["field0"],"field0":{"type":"inlineedit","is_alert":true,"field":[{"pretext":"Selected parties must receive a sailing schedule email every","value":7,"posttext":"","range":[0,30],"controlname":"ForSelNoShow","child":[{"type":"select","field":[{"fieldname":"Select Day","placeholder":"Select Type","posttext":"of the week","options":["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],"methodName":"getDay","value":[],"controlname":"CFDay","child":[]}]}]}]}}]' WHERE control_name = 'SSMaintain';


UPDATE waka.po_booking SET fields = '[{"group":"Date of Progress Check", "fields":["field0", "field1"], "field0":{"type":"inlineedit", "field":[{"pretext":"Progress check updates must be provided by the supplier","value": 21, "posttext":" Days prior to", "controlname":"DateOfProgressCheck", "range":[0,30], "child":[{"type":"select", "field":[{"fieldname":"Select Data Type", "options":["Cargo Ready Date","Contract Shipment Date"], "value":"Cargo Ready Date", "controlname":"POPSelectDataType", "child":[]}]}]}]}}]' WHERE control_name = 'ProgressCheck';

UPDATE waka.po_booking SET fields = '[{"group":"Allowed Quantity Variance at Booking Confirmation","fields":["field0"], "field0":{"type":"inlineedit", "validation":"@@SABRCAQV@@<@@SABRCAQVSecondValue@@", "field":[{"pretext":"Accepted Quantity variance lies between", "value": -5, "posttext":"", "range":[-10,30],"controlname":"SABRCAQV", "child":[]},{"pretext":"%  to ", "value": 5, "posttext":"%", "range":[0,30], "controlname":"SABRCAQVSecondValue", "child":[]}]}}, {"group":"Tolerance of Cargo Ready Date","fields":["field0"], "field0":{"type":"inlineedit", "validation":"@@SABRCAQV@@<@@SABRCAQVSecondValue@@", "field":[{"pretext":"Accepted tolerance of Cargo Ready Date", "value": 5, "posttext":"", "range":[1,30],"controlname":"ATCRD", "child":[]},{"pretext":"day(s)  to ", "value": 7, "posttext":"day(s)", "range":[1,30], "controlname":"ATCRDSecondValue", "child":[]}]}}]' WHERE control_name = 'SABRCBySupplier';

INSERT INTO waka.event_master (section_name, event_name, event_description, sub_module_id, module_id, created_on, modified_by, modified_on) VALUES('Shipment_Authorization', 'BRCBS_ATCRD_UPDATE', 'Tolerance of Cargo Ready Date', (SELECT sub_module_id FROM waka.sub_modules_list WHERE sub_module_name = 'PO Booking' LIMIT 1), (SELECT module_id FROM waka.modules_list WHERE module_name = 'SOP' LIMIT 1), now(), null, null);


--11 may

ALTER TABLE waka.po_ingestion DROP COLUMN cargo_ready_date;

ALTER TABLE waka.po_ingestion DROP COLUMN shipment_date;

ALTER TABLE waka.po_ingestion DROP COLUMN delivery_date;

ALTER TABLE waka.po_ingestion ADD COLUMN mandatory_fields JSON;

DROP TABLE IF EXISTS waka.po_booking_details;
CREATE TABLE waka.po_booking_details (
	po_bd_id SERIAL PRIMARY KEY,
	sop_id INT REFERENCES waka.sop(sop_id) ON DELETE CASCADE,
	generate_date JSON,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Above Query Excuted in waka test env --

INSERT INTO  waka.po_booking_details (sop_id, created_by) VALUES (553, 199);

ALTER TABLE waka.shipment_booking DROP COLUMN created_on;
ALTER TABLE waka.shipment_booking ADD COLUMN created_on TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE waka.shipment_booking ALTER COLUMN modified_on DROP NOT NULL;

ALTER TABLE waka.shipment_booking_details DROP COLUMN created_on;
ALTER TABLE waka.shipment_booking_details ADD COLUMN created_on TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE waka.shipment_booking_details ALTER COLUMN modified_on DROP NOT NULL;

-- May 11 --

UPDATE waka.po_booking SET fields = '[{"group":"Generate Booking Confirmation for Supplier","fields":["field0"],"field0":{"type":"inlineedit","field":[{"pretext":"Generate booking confirmation","value": 21,"posttext":"days prior to","range":[0,30],"controlname":"RemainderToGenerate","child":[{"type":"select","field":[{"fieldname":"Select Data Type","options":["Cargo Ready Date","Contract Shipment Date"],"value":"Cargo Ready Date","controlname":"POPSelectDataType","child":[]}]}]}]}},{"group":"Include Estimated Sailing Information in Booking Confirmation","label":"","fields":["field0"],"field0":{"type":"multi","field":[{"fieldname":"Include Estimated Sailing Information in Booking Confirmation","label":"Estimated Sailing information will provide context for the booking confirmation","value":true,"controlname":"SBIESIinBookConfirm","child":[]}]}}]' WHERE control_name = 'GBCToSupplier';

UPDATE waka.event_master SET event_description='Generate Booking Confirmation for Supplier update' WHERE event_name = 'GBCTTS_RTGBC_UPDATE';

-- Above Query Excuted in waka test env --

-- May 16 -- 

INSERT INTO waka.modules_list (module_name, seq, is_visible, is_licensed, icon, svg, table_reference) VALUES('Shipment Booking', 8, true, true, 'local_shipping', '', '');

UPDATE waka.po_booking SET fields = '[{"group":"Inspection\/testing standards for suppliers","fields":["field0"],"field0":{"type":"select","field":[{"fieldname":"Select standard type","options":["Follow PO Instructions","Set instructions for all POs"],"value":null,"controlname":"ITRStandType","child":[{"type":"chipset","field":[{"fieldname":"","selLabel":"Selected Instructions","value":["Sampling"],"options":["Sampling","Production","Shipment"],"unselLabel":"Add Instructions","controlname":"ApplyAbvSeleTo","child":[]}]}]}]}}]' WHERE control_name = 'TestingRequirements';

UPDATE waka.po_booking SET fields = '[{"group":"Quality Check Approve", "fields":["field0"], "field0":{"type":"inlineedit", "field":[{"pretext":"Quality check approval should be conducted","value":7,"posttext":"","range":[0,30],"controlname":"VASNoShow", "child":[{"type":"select", "field":[{"fieldname":"Select Type", "posttext":"", "placeholder":"Select Type",  "options":["Before Raising the Booking Confirmation","Before Shipment Authorization","After Shipment Authorization"], "methodName":"getDurationType", "value":"Before Shipment Authorization","controlname":"Approvaltype", "child":[]}]}]}]}}]' WHERE control_name = 'TimingQCA';

UPDATE waka.cargo_handling SET fields = '[{"group":"LCL Closing Reminder","fields":["field0"],"field0":{"type":"inlineedit","field":[{"pretext":"Reminder to notify supplier for LCL closing","value": 2,"posttext":"days prior to CY closing","range":[0,30],"controlname":"CRRNSLCLCl","child":[]}]}}]' WHERE control_name = 'LCLClosing';

UPDATE waka.po_booking SET fields = '[{"group":"Final Booking Confirmation Release to Supplier","fields":["field0","field1"],"field0":{"type":"inlineedit","field":[{"pretext":"Reminder to release final booking confirmation for FCL","value": 7,"posttext":"days prior to ETD of Vessel","range":[0,30],"controlname":"RemainderToReleaseFBCforFCL","child":[]}]},"field1":{"type":"inlineedit","field":[{"pretext":"Reminder to release final booking confirmation for LCL","value": 7,"posttext":"days prior to CFS Cut off Date","range":[0,30],"controlname":"DaysPriorToCFSforLCL","child":[]}]}},{"group":"Booking Reconfirmation Reminder to Supplier","fields":["field0"],"field0":{"type":"inlineedit","field":[{"pretext":"Reminder to notify supplier when booking reconfirmation is not received","value": 9,"is_alert":true,"posttext":"days prior to","range":[0,30],"controlname":"DatePriorCRD","child":[{"type":"select","field":[{"fieldname":"Select Data Type","options":["Cargo Ready Date","Contract Shipment Date"],"value":"Cargo Ready Date","controlname":"POPSelectDataType","child":[]}]}]}]}},{"group":"Require Principal''s Reconfirmation for updates on PO details during the booking confirmation","label":"","fields":["field0"],"field0":{"type":"chipset","field":[{"fieldname":"","selLabel":"Selected details will require approval from the principal on the updated PO details","value":["Quantity"],"options":["Quantity","Volume","Gross Weight"],"unselLabel":"Add more details","controlname":"SBIESIinBookConfirm","child":[]}]}}]' WHERE control_name = 'PORCToSupplier';


UPDATE waka.cargo_handling SET fields = '[{"group":"","fields":["field0"],"field0":{"type":"multi","field":[{"fieldname":"Do not allow partial shipment","value":true,"controlname":"CRDNAPShip","child":[]}]}},{"group":"LCL Receiving Quantity Variance Tolerance","fields":["field0"],"field0":{"type":"inlineedit","field":[{"pretext":"Accepted quantity variance ranges between","value": -5,"posttext":"% ","range":[-10,10],"controlname":"CRLCLRCAQVRFROM","child":[]},{"pretext":" to ","value": 5,"posttext":"%","range":[-10,10],"controlname":"CRLCLRCAQVRTo","child":[]}]}},{"group":"","fields":["field0"],"field0":{"type":"multi","field":[{"fieldname":"No cargo with metal strapping around the outer cartons can be accepted","value":true,"controlname":"NCWMSAOutCar","child":[]},{"fieldname":"Deliver cargo to Forwarder''s nominated CFS premises, with the required document by the Cargo Ready Date as per the booking form","value":true,"controlname":"DCFNCFSPRDBYCRD","child":[]},{"fieldname":"All export cartons must have attached Shipping Marks for identification, as specified by the Principal","value":true,"controlname":"AECMHASMFI","child":[]}]}},{"group":"Other Conditions","fields":["field0"],"field0":{"type":"text","field":[{"fieldname":"Others","placeholder":"Type Other Conditions","value":null,"controlname":"CRLCLRecvOthers","child":[]}]}}]' WHERE control_name = 'CRLCLRecvCond';

-- Above Query Excuted in waka test env --

-- May 17 --

ALTER TABLE waka.sop_communication ADD COLUMN is_selected BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE waka.event_master SET event_description = 'Define the number of documents required for the Bill of Lading/Sea Waybill from Coloader Update' WHERE event_name = 'ROBOLSWFC_DTNODR_UPDATE';

UPDATE waka.documents SET fields = '[{"group":"Selected Document Type That Needs To Be Issued Required For Master Bill Of Lading\/Sea Waybill","fields":["field0"],"field0":{"type":"select","field":[{"fieldname":"Select Data Type","options":["Master Bill of Lading","Master Sea Waybill"],"value":null,"controlname":"MBSSelectDataType","child":[]}]}},{"group":"Define The Number Of Documents Required For the Master Bill Of Lading\/Sea Waybill","fields":["field0"],"field0":{"type":"inlineedit","field":[{"pretext":"Number of originals","value": 3,"posttext":"and number of copies","range":[1,50],"controlname":"IssMasterBillsRemainderToGenerate","child":[]},{"pretext":"","value": 6,"posttext":"","range":[1,50],"controlname":"IssMasterBillstNoofCopies","child":[]}]}},{"group":"Reminder For Issuance Of Documents Required For Master Bill Of Lading\/Sea Waybill","label":"","is_alert":true,"fields":["field0"],"field0":{"type":"inlineedit","field":[{"pretext":"Master Bill of Lading\/Sea WayBill to be issued","value":7,"posttext":"days after Vessel Departure Date","range":[0,30],"controlname":"MasterFCRRemainderToGenerate","child":[]}]}},{"group":"","fields":["field0"],"field0":{"type":"multi","field":[{"fieldname":"Issue One Single Master Bill of Lading\/Sea Waybill if Containers with same Ship Mode, From same Loading Port, To same Discharging Port, on the same Vessel Voyage and Carrier","value":true,"controlname":"IssueOneSingleMasterBill","child":[]}]}},{"group":"Selected Party Types And The Respective Details Will Be Mentioned In The Issued Documents For Master Bill Of Lading\/Sea Waybill","fields":["field0"],"field0":{"type":"chipset","field":[{"fieldname":"","selLabel":"Selected parties","options":["Notify Party","Supplier","Principal"],"value":["Supplier","Principal"],"controlname":"IssMasterBillsSelectedParty","unselLabel":"Unselected parties","child":[]}]}}]' WHERE control_name = 'IssMasterBills';

UPDATE waka.documents SET fields = '[{"group":"Issuance of Packing List","label":"Selected packing list format will be available on the platform","fields":["field0"],"field0":{"type":"select","field":[{"fieldname":"Select Format","placeholder":"Select Format","options":["Use my format","Use WAKA standard format"],"methodName":"getIssPackListFormat","value":[],"controlname":"IssPackListSelect","child":[{"type":"chipset-file","field":[{"fieldname":"","selLabel":"","uploadedFileName":[],"value":[],"options":[],"unselLabel":"","controlname":"IssPackListFile","child":[]}]}]}]}},{"group":"Define The Number Of Documents Required For the Requirement Of Packing List","fields":["field0"],"field0":{"type":"inlineedit","field":[{"pretext":"Number of originals","value": 3,"posttext":"","range":[0,50],"controlname":"IssPackListNoOfDocs","child":[]},{"pretext":"and number of copies","value": 6,"posttext":"","range":[0,50],"controlname":"IssPackListNoofCopies","child":[]}]}}]' WHERE control_name = 'IssPackList';

UPDATE waka.documents SET fields = '[{"group":"Define The Number Of Documents Required For the Bill Of Lading\/Sea Waybill From Coloader","fields":["field0"],"field0":{"type":"inlineedit","field":[{"pretext":"Number of originals","value": 3,"posttext":"and number of copies","range":[0,50],"controlname":"IssColoaderBillsNoofCopies","child":[]},{"pretext":"","value": 6,"posttext":"","range":[0,50],"controlname":"IssColoaderBillsNoofCopiesName","child":[]}]}},{"group":"Reminder For Issuance Of Documents Required For Bill Of Lading\/Sea Waybill From Coloader","label":"","is_alert":true,"fields":["field0"],"field0":{"type":"inlineedit","field":[{"pretext":"FCR\/HBL to be issued","value":7,"posttext":"days after Vessel Departure","range":[0,30],"controlname":"RemIssDoc","child":[]}]}},{"group":"","fields":["field0"],"field0":{"type":"multi","field":[{"fieldname":"Issue One Single House Bill of Lading\/Sea Waybill if Containers with same Ship Mode, From same Loading Port, To same Discharging Port, on the same Vessel Voyage and Carrier","value":true,"controlname":"IssShipMode","child":[]}]}},{"group":"Selected Party Types And The Respective Details Will Be Mentioned In The Issued Documents For Bill Of Lading\/Sea Waybill From Coloader","fields":["field0"],"field0":{"type":"chipset","field":[{"fieldname":"","selLabel":"Selected parties","options":["Notify Party","Supplier","Principal"],"value":["Supplier","Principal"],"controlname":"IssShipModeSelectedParty","unselLabel":"Unselected parties","child":[]}]}}]' WHERE control_name = 'IssColoaderBills';

UPDATE waka.documents SET fields = '[{"group":"Define The Number Of Documents Required For the Master Air Waybill And House Air Waybill","fields":["field0"],"field0":{"type":"inlineedit","field":[{"pretext":"Number of originals","value": 3,"posttext":"and number of copies","range":[0,50],"controlname":"IssMasterAirBillsNoOfCopies","child":[]},{"pretext":"","value": 6,"posttext":"","range":[0,50],"controlname":"IssMasterAirBillsNoOfCopiesName","child":[]}]}},{"group":"Selected Party Types And The Respective Details Will Be Mentioned In The Issued Documents For Master Air Waybill And House Air Waybill","fields":["field0"],"field0":{"type":"chipset","field":[{"fieldname":"","selLabel":"Selected parties","options":["Notify Party","Supplier","Principal"],"value":["Supplier","Principal"],"controlname":"IssMasterAirBillsSelectedParty","unselLabel":"Unselected parties","child":[]}]}}]' WHERE control_name = 'IssMasterAirBills';


UPDATE waka.documents SET fields = '[{"group":"Issuance of Commercial Invoice","label":"Selected commercial invoice format will be available on the platform","fields":["field0"],"field0":{"type":"select","field":[{"fieldname":"Select Format","placeholder":"Select Format","options":["Use my format","Use WAKA standard format"],"methodName":"getIssCommInvtFormat","value":null,"controlname":"IssCommDocsSelect","child":[{"type":"chipset-file","field":[{"fieldname":"","selLabel":"","uploadedFileName":[],"value":[],"options":[],"unselLabel":"","controlname":"IssCommDocsFile","child":[]}]}]}]}},{"group":"Define The Number Of Documents Required For the Requirement Of Commercial Invoice","fields":["field0"],"field0":{"type":"inlineedit","field":[{"pretext":"Number of originals","value": 3,"posttext":"","range":[0,50],"controlname":"IssCommInvNoOfDocs","child":[]},{"pretext":"and number of copies","value": 6,"posttext":"","range":[0,50],"controlname":"IssCommInvNoofCopies","child":[]}]}}]' WHERE control_name = 'IssCommInv';


UPDATE waka.documents SET fields = '[{"group":"Selected Document Type That Needs To Be Issued For Forwarders Cargo Receipt\/ House Bill Of Lading\/ House Sea Waybill","fields":["field0"],"field0":{"type":"chipset","field":[{"fieldname":"","selLabel":"Selected parties","options":["Forwarders Cargo Receipt","House Bill of Lading\/ House Sea Waybill"],"value":["Forwarders Cargo Receipt","House Bill of Lading\/ House Sea Waybill"],"controlname":"IssForCargoBillsDocType","unselLabel":"Unselected parties","child":[]}]}},{"group":"Define The Number Of Documents Required For the Forwarder Cargo Receipt\/ House Bill Of Lading\/ House Sea Waybill","fields":["field0"],"field0":{"type":"inlineedit","field":[{"pretext":"Number of originals","value": 3,"posttext":"and number of copies","range":[0,50],"controlname":"IssForCargoRemainderToGenerate","child":[]},{"pretext":"","value": 6,"posttext":"","range":[0,50],"controlname":"IssForCargoNoofCopies","child":[]}]}},{"group":"Reminder For Issuance Of Documents Required For Forwarders Cargo Receipt\/ House Bill Of Lading\/ House Sea Waybill","is_alert":true,"fields":["field0"],"field0":{"type":"inlineedit","field":[{"pretext":"FCR\/HBL to be issued","value":7,"posttext":"days after","range":[0,30],"controlname":"FCRRemainderToGenerate","child":[{"type":"select","field":[{"fieldname":"Select Data Type","options":["Cargo Receiving Date","CFS Cutoff Date"],"value":null,"controlname":"FCRSelectDataType","child":[]}]}]}]}},{"group":"","fields":["field0"],"field0":{"type":"multi","field":[{"fieldname":"House Bill of Lading or House Sea WayBill must be dated and issued on the day the cargoes are shipped on board","value":true,"controlname":"HouseBillIssued","child":[]},{"fieldname":"Remarks on the conditions of the cargoes as stipulated on the Dock Receipts are to be stated on the FCR or House Bill of Lading or House Sea Waybill or House Sea Waybill","value":true,"controlname":"RemarkCargoDock","child":[]},{"fieldname":"Issue Received of Shipment FCR for overflow of cargoes","value":true,"controlname":"IssueReceiveShip","child":[]},{"fieldname":"Allow issue one set of FCR or House Bill of Lading or House Sea Waybill per split shipment","value":true,"controlname":"AllowIssueFCR","child":[]}]}},{"group":"Selected Party Types And The Respective Details Will Be Mentioned In The Issued Documents For Forwarders Cargo Receipt\/ House Bill Of Lading\/ House Sea Waybill","fields":["field0"],"field0":{"type":"chipset","field":[{"fieldname":"","selLabel":"Selected parties","options":["Notify Party","Supplier","Principal"],"value":["Supplier","Principal"],"controlname":"IssForCargoBillsSelectedParty","unselLabel":"Unselected parties","child":[]}]}}]' WHERE control_name = 'ReqForCargoBills';

ALTER TABLE waka.shipment_booking ADD COLUMN total_teu INT NULL;

-- may 26 --

UPDATE waka.cargo_handling SET fields = '[{"group":"Selection of Garment on Hanger","label":"", "fields":["field0"], "field0":{"type":"chipset", "field":[{"fieldname":"","selLabel":"Selected types of GOH Equipment", "value":["String System","Bar System","Mobile Trolley","GOH Cartons","Others"], "options":["String System","Bar System","Mobile Trolley","GOH Cartons", "Others"],"unselLabel":"Add more details", "controlname": "VASGOHChipset", "child":[]}]}}]' WHERE control_name = 'VASGOH';

-- Above Query Excuted in waka test env --

-- May 28 -- 

DROP TABLE IF EXISTS waka.shipment_booking_custom_view;
CREATE TABLE waka.shipment_booking_custom_view (
	sbcv_id SERIAL PRIMARY KEY,
	view_name VARCHAR NOT NULL,
	is_default BOOLEAN NULL DEFAULT false,
	display_columns JSON,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ NULL,
	UNIQUE(view_name)
);

DROP TABLE IF EXISTS waka.poi_sop_port_error_temp;
CREATE TABLE waka.poi_sop_port_error_temp (
	poi_spe_id SERIAL PRIMARY KEY,
	poi_id INT NOT NULL REFERENCES waka.po_ingestion(poi_id) ON DELETE CASCADE,
	origin_port_id INT NOT NULL REFERENCES waka.port(port_id) ON DELETE CASCADE,
	dest_port_id INT NOT NULL REFERENCES waka.port(port_id) ON DELETE CASCADE,
	error_type VARCHAR,
	is_created BOOLEAN DEFAULT false,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	UNIQUE(poi_id, origin_port_id, dest_port_id, error_type)
);

-- June 04 -- 

ALTER TABLE waka.lookup_name DROP CONSTRAINT lookup_name_lookup_type_id_lookup_name_key;

ALTER TABLE waka.lookup_name ADD CONSTRAINT lookup_name_lookup_type_id_lookup_name_key UNIQUE (lookup_type_id, company_id , lookup_name, display_name);

UPDATE waka.communication SET instruction_type = 'communication instructions' WHERE instruction_type = 'communication';

UPDATE waka.po_booking SET fields = '[{"group":"Required final booking confirmation details for FCL","label":"","fields":["field0"],"field0":{"type":"chipset","field":[{"fieldname":"","selLabel":"Selected details will be shown in the final booking confirmation for FCL","value":["VGM Cutoff","ENS\/AMS Cutoff","Shipment Instructions Cutoff","CY Cutoff","Vessel Schedule"],"options":["VGM Cutoff","ENS\/AMS Cutoff","Shipment Instructions Cutoff","CY Cutoff","Cargo Ready Date","Vessel Name","Vessel Voyage","Cargo Volume","Cargo Gross Weight","Container Type","Vessel Schedule"],"unselLabel":"Add more details","controlname":"SBRFBCFCL","child":[]}]}},{"group":"Required final booking confirmation details for LCL","label":"","fields":["field0"],"field0":{"type":"chipset","field":[{"fieldname":"","selLabel":"Selected details will be shown in the final booking confirmation for LCL","value":["VGM Cutoff","ENS\/AMS Cutoff","CFS Cutoff"],"options":["VGM Cutoff","ENS\/AMS Cutoff","Cargo Delivery Window","CFS Cutoff","Cargo Ready Date","Vessel Name","Vessel Voyage","Cargo Volume","Cargo Gross Weight"],"unselLabel":"Add more details","controlname":"SBRFBCLCL","child":[]}]}}]' WHERE control_name = 'SBFBCDetails';

ALTER TABLE waka.sop_communication DROP CONSTRAINT sop_communication_pkey;

ALTER TABLE waka.sop_communication ADD CONSTRAINT sop_communication_pkey UNIQUE (sop_id, instruction , instruction_type);

-- Above Query Excuted in waka test env --

-- Jun 06 --

UPDATE waka.cargo_handling SET fields = '[{"group":null,"fields":["field0"],"field0":{"type":"multi","field":[{"fieldname":"Supply of Wooden Pallets","value":true,"controlname":"VASPSSWP","child":[{"type":"inlineedit","field":[{"pretext":"Dimensions : Length","value":100,"posttext":"cm, ","range":[100,300],"controlname":"VASPSWPLenDimen","child":[]},{"pretext":"Width","value":100,"posttext":"cm ","range":[100,300],"controlname":"VASPSWPWidthDimen","child":[]},{"pretext":"and Height","value":100,"posttext":"cm","range":[100,300],"controlname":"VASPSWPHtDimen","child":[]}]},{"type":"select","field":[{"fieldname":"Pallets handling requirement: ","placeholder":"Select Type","options":["2 Way","4 Way"],"value":"4 Way","controlname":"VASSPSAlloc","child":[]}]}]}]}},{"group":null,"fields":["field0"],"field0":{"type":"multi","field":[{"fieldname":"Supply of Plastic Pallets","value":true,"controlname":"VASPSSPP","child":[{"type":"inlineedit","field":[{"pretext":"Dimensions : Length","value":100,"posttext":"cm,","range":[100,300],"controlname":"VASPSPPLenDimen","child":[]},{"pretext":" Width","value":100,"posttext":"cm","range":[100,300],"controlname":"VASPSPPWidthDimen","child":[]},{"pretext":"and Height","value":100,"posttext":"cm","range":[100,300],"controlname":"VASPSPPHtDimen","child":[]}]},{"type":"select","field":[{"fieldname":"Pallets handling requirement: ","placeholder":"Select Type","options":["2 Way","4 Way"],"value":"4 Way","controlname":"VASSPPPSAlloc","child":[]}]}]}]}},{"group":null,"fields":["field0"],"field0":{"type":"multi","field":[{"fieldname":"Supply of Pallets Box","value":true,"controlname":"VASPSSPB","child":[{"type":"inlineedit","field":[{"pretext":"Dimensions : Length","value":100,"posttext":"cm,","range":[100,300],"controlname":"VASPSPBLenDimen","child":[]},{"pretext":" Width","value":100,"posttext":"cm","range":[100,300],"controlname":"VASPSPBWidthDimen","child":[]},{"pretext":"and Height","value":100,"posttext":"cm","range":[100,300],"controlname":"VASPSPBHtDimen","child":[]}]},{"type":"select","field":[{"fieldname":"Pallets handling requirement: ","placeholder":"Select Type","options":["2 Way","4 Way"],"value":"4 Way","controlname":"VASSPPBSAlloc","child":[]}]}]}]}},{"group":null,"fields":["field0"],"field0":{"type":"multi","field":[{"fieldname":"Supply of Slipsheet","value":true,"controlname":"VASPSSSS","child":[{"type":"inlineedit","field":[{"pretext":"Dimensions : Length","value":100,"posttext":"cm,","range":[100,300],"controlname":"VASPSSSLenDimen","child":[]},{"pretext":" Width","value":100,"posttext":"cm","range":[100,300],"controlname":"VASPSSSWidthDimen","child":[]},{"pretext":"and Height","value":100,"posttext":"cm","range":[100,300],"controlname":"VASPSSSHtDimen","child":[]}]}]}]}},{"group":"Palletization\/Slipsheeting Instructions","fields":["field0"],"field0":{"type":"select","field":[{"fieldname":"Select Instruction","options":["By SKU","By Store","By Quantity"],"value":"By Store","controlname":"VASPSInst","child":[]}]}}]' WHERE control_name = 'VASPS';



UPDATE waka.cargo_handling SET fields = '[{"group":"Supply of New Label","fields":["field0"],"field0":{"type":"minitext","field":[{"fieldname":"Supply of New Label","placeholder":"Enter source of label","value":null,"controlname":"VASRLSNL","child":[]}]}},{"group":"Re-labeling Instructions","fields":["field0"],"field0":{"type":"text","field":[{"fieldname":"Type Instructions","placeholder":"Type Instructions","value":null,"controlname":"VASRLTInst","child":[]}]}}]' WHERE control_name = 'VASReLabel';

UPDATE waka.cargo_handling SET fields = '[{"group":"Supply of New Packages","fields":["field0"],"field0":{"type":"minitext","field":[{"fieldname":"Supply of New Packages","placeholder":"Enter source of packages","value": null,"controlname":"VASRPack","child":[]}]}},{"group":"Re-packaging Instructions","fields":["field0"],"field0":{"type":"text","field":[{"fieldname":"Type Instructions","placeholder":"Type Instructions","value":null,"controlname":"VASRPInst","child":[]}]}}]' WHERE control_name = 'VASRePack';


UPDATE waka.sub_modules_list SET sub_module_name = 'Services Instruction' WHERE sub_module_name = 'Services';

DELETE FROM waka.event_master WHERE sub_module_id IN (SELECT sub_module_id FROM waka.sub_modules_list WHERE sub_module_name = 'Services Instruction' LIMIT 1);

INSERT INTO waka.event_master (section_name, event_name, event_description, sub_module_id, module_id) VALUES('Origin_Logistics_Services_Instruction', 'OLSI_CREATE', 'Create Origin Logistics Services Instruction', (SELECT sub_module_id FROM waka.sub_modules_list WHERE sub_module_name = 'Services Instruction' LIMIT 1), (SELECT module_id FROM waka.modules_list WHERE module_name = 'SOP' LIMIT 1));
INSERT INTO waka.event_master (section_name, event_name, event_description, sub_module_id, module_id) VALUES('Origin_Logistics_Services_Instruction', 'OLSI_DELETE', 'Delete Origin Logistics Services Instruction', (SELECT sub_module_id FROM waka.sub_modules_list WHERE sub_module_name = 'Services Instruction' LIMIT 1), (SELECT module_id FROM waka.modules_list WHERE module_name = 'SOP' LIMIT 1));
INSERT INTO waka.event_master (section_name, event_name, event_description, sub_module_id, module_id) VALUES('Origin_Logistics_Services_Instruction', 'OLSI_ADD_REMOVE', 'Add/Remove Origin Logistics Services Instruction', (SELECT sub_module_id FROM waka.sub_modules_list WHERE sub_module_name = 'Services Instruction' LIMIT 1), (SELECT module_id FROM waka.modules_list WHERE module_name = 'SOP' LIMIT 1));

INSERT INTO waka.event_master (section_name, event_name, event_description, sub_module_id, module_id) VALUES('Destination_Services_Instruction', 'DSI_CREATE', 'Create Destination Services Instruction', (SELECT sub_module_id FROM waka.sub_modules_list WHERE sub_module_name = 'Services Instruction' LIMIT 1), (SELECT module_id FROM waka.modules_list WHERE module_name = 'SOP' LIMIT 1));
INSERT INTO waka.event_master (section_name, event_name, event_description, sub_module_id, module_id) VALUES('Destination_Services_Instruction', 'DSI_DELETE', 'Delete Destination Services Instruction', (SELECT sub_module_id FROM waka.sub_modules_list WHERE sub_module_name = 'Services Instruction' LIMIT 1), (SELECT module_id FROM waka.modules_list WHERE module_name = 'SOP' LIMIT 1));
INSERT INTO waka.event_master (section_name, event_name, event_description, sub_module_id, module_id) VALUES('Destination_Services_Instruction', 'DSI_ADD_REMOVE', 'Add/Remove Destination Services Instruction', (SELECT sub_module_id FROM waka.sub_modules_list WHERE sub_module_name = 'Services Instruction' LIMIT 1), (SELECT module_id FROM waka.modules_list WHERE module_name = 'SOP' LIMIT 1));

INSERT INTO waka.event_master (section_name, event_name, event_description, sub_module_id, module_id) VALUES('Shipment_Tracking_Services_Instruction', 'STSI_CREATE', 'Create Shipment Tracking Services Instruction', (SELECT sub_module_id FROM waka.sub_modules_list WHERE sub_module_name = 'Services Instruction' LIMIT 1), (SELECT module_id FROM waka.modules_list WHERE module_name = 'SOP' LIMIT 1));
INSERT INTO waka.event_master (section_name, event_name, event_description, sub_module_id, module_id) VALUES('Shipment_Tracking_Services_Instruction', 'STSI_DELETE', 'Delete Shipment Tracking Services Instruction', (SELECT sub_module_id FROM waka.sub_modules_list WHERE sub_module_name = 'Services Instruction' LIMIT 1), (SELECT module_id FROM waka.modules_list WHERE module_name = 'SOP' LIMIT 1));
INSERT INTO waka.event_master (section_name, event_name, event_description, sub_module_id, module_id) VALUES('Shipment_Tracking_Services_Instruction', 'STSI_ADD_REMOVE', 'Add/Remove Shipment Tracking Services Instruction', (SELECT sub_module_id FROM waka.sub_modules_list WHERE sub_module_name = 'Services Instruction' LIMIT 1), (SELECT module_id FROM waka.modules_list WHERE module_name = 'SOP' LIMIT 1));

INSERT INTO waka.event_master (section_name, event_name, event_description, sub_module_id, module_id) VALUES('Communication_Instruction', 'CI_CREATE', 'Create Communication Instruction', (SELECT sub_module_id FROM waka.sub_modules_list WHERE sub_module_name = 'Services Instruction' LIMIT 1), (SELECT module_id FROM waka.modules_list WHERE module_name = 'SOP' LIMIT 1));
INSERT INTO waka.event_master (section_name, event_name, event_description, sub_module_id, module_id) VALUES('Communication_Instruction', 'CI_DELETE', 'Delete Communication Instruction', (SELECT sub_module_id FROM waka.sub_modules_list WHERE sub_module_name = 'Services Instruction' LIMIT 1), (SELECT module_id FROM waka.modules_list WHERE module_name = 'SOP' LIMIT 1));
INSERT INTO waka.event_master (section_name, event_name, event_description, sub_module_id, module_id) VALUES('Communication_Instruction', 'CI_ADD_REMOVE', 'Add/Remove Communication Instruction', (SELECT sub_module_id FROM waka.sub_modules_list WHERE sub_module_name = 'Services Instruction' LIMIT 1), (SELECT module_id FROM waka.modules_list WHERE module_name = 'SOP' LIMIT 1));

UPDATE waka.communication SET instruction_type = 'communication' WHERE instruction_type = 'communication instructions';

UPDATE waka.lookup_name SET lookup_name = 'http_request_get', display_name = 'HTTP Request (GET)' WHERE lookup_name = 'http_request';
INSERT INTO waka.lookup_name (lookup_type_id, company_id, lookup_name, display_name, seq, created_by) VALUES (17, 1, 'http_request_post', 'HTTP Request (POST)', 2, 1);
UPDATE waka.lookup_name SET seq = 3 WHERE lookup_name = 'tcp_request';
ALTER TABLE waka.po_ingestion_schedule ADD COLUMN test_response JSON;
ALTER TABLE waka.po_ingestion_schedule ADD COLUMN test_response_time NUMERIC;
ALTER TABLE waka.po_ingestion_schedule ADD COLUMN test_response_size TEXT;
ALTER TABLE waka.po_ingestion_schedule ADD COLUMN req_body_type VARCHAR;
ALTER TABLE waka.po_ingestion_schedule ADD COLUMN request_parameters JSON;
ALTER TABLE waka.po_ingestion_schedule ADD COLUMN request_body VARCHAR;
ALTER TABLE waka.lookup_name ADD CONSTRAINT unique_display_name UNIQUE(lookup_type_id,company_id,display_name);
ALTER TABLE waka.po_ingestion_schedule ADD COLUMN scheduler_uid TEXT;

-- Above Query Excueted in waka test env --

ALTER TABLE waka.po_transactions ADD CONSTRAINT transaction_duplicate_limit UNIQUE (transaction_date, shift_batch , mfg_qty, product, product_description, supplier_ref_id);

DROP TABLE IF EXISTS waka.supplier_ref;
CREATE TABLE waka.supplier_ref (
	supplier_ref_id SERIAL PRIMARY KEY,
	company_id INT REFERENCES waka.company(company_id) ON DELETE CASCADE,
	supplier_code VARCHAR NOT NULL,
	supplier_name VARCHAR NOT NULL,
	waka_ref_supplier_id INT NOT NULL REFERENCES waka.company(company_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	UNIQUE (company_id, waka_ref_supplier_id, supplier_name)
);

-- Above Query Excueted in waka test env --

-- Jun 14 --

UPDATE waka.event_master SET event_description='Add Role', modified_by = 1, modified_on= NOW() WHERE event_name = 'ADD_ROLE';

INSERT INTO waka.event_master (section_name, event_name, event_description, sub_module_id, module_id) VALUES('ROLES', 'EDIT_ROLE', 'Edit Role', (SELECT sub_module_id FROM waka.sub_modules_list WHERE sub_module_name = 'Roles' LIMIT 1), (SELECT module_id FROM waka.modules_list WHERE module_name = 'Admin' LIMIT 1));

-- Above Query Excueted in waka test env --

-- 15-06-2022 --
ALTER TABLE waka.sop_orgin_port_details DROP CONSTRAINT sop_orgin_port_details_free_storage_days_fkey;

-- 17-06-2022 --
INSERT INTO waka.port (port_name, region, subregion, country, country_id, latitude, longitude, created_by) VALUES 
('Nanjing', 'Asia', 'Eastern Asia', 'China', 45,32.0930, 118.7159, 1),
('Fuzhou', 'Asia', 'Eastern Asia', 'China', 45, 25.4274, 119.2970, 1),
('Ningbo', 'Asia', 'Eastern Asia', 'China', 45, 29.9512, 121.7232, 1),
('Shenzhen', 'Asia', 'Eastern Asia', 'China', 45, 22.5411, 114.0883, 1),
('Xiamen', 'Asia', 'Eastern Asia', 'China', 45, 24.4186, 118.0769, 1),
('Shanghai', 'Asia', 'Eastern Asia', 'China', 45, 31.2466, 121.4967, 1),
('Qingdao', 'Asia', 'Eastern Asia', 'China', 45, 36.0141, 120.2020, 1);

-- 21-06-2022 --

INSERT INTO waka.port (port_name, region, subregion, country, country_id, latitude, longitude, created_by) VALUES ('Jiangmen', 'Asia', 'Eastern Asia', 'China', 45, 22.6626, 113.0993, 1);

ALTER TABLE waka.po_raw  ADD COLUMN buyercode VARCHAR;