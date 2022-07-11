export interface ClassSOPCarrier{
	sca_id:number,
	sop_id:number,
	origin_port_id:number,
	origin_port_name:string,
	dest_port_id:number,
	dest_port_name:string,
	carrier_id:number,
	carrier_name:string,
	contract_number:string,
	allocation_percent:number,
	remarks:string
}

export interface ClassSOPCompany{
	sop_company_id: number, 
	sop_id: number, 
	company_id: number, 
	company_name: string,
	company_type_id:number,
	company_type:string,
	country_id: number,
	country_name: string, 
	state_id: number, 
	state_name: string, 
	city_id: number,
	city_name: string,
	zip_code: string,
	address: string
}

export interface ClassSOPPort{
	sop_port_id:number,
	sop_id:number,
	origin_port_id:number,
	origin_port_name:string,
	dest_port_id:number,
	dest_port_name:string,
	principal_id:string,
	ff_id:string,
	origin_country_id:number,
	dest_country_id:number,
}

export interface ClassSOPCMW {
	container_size: string,
	max_weight: number
}

export interface ClassPorts {
	port_id: number,
	port_name: string,
	region: string,
	country: string
	subregion:string,
	portwithregion:string
}

export interface ClassCountry {
	id: number,
	name: string,
	iso3: string,
	iso2: string
}

export interface ClassState {
	id: number,
	name: string,
	country_id: number,
}

export interface ClassCity {
	id: number,
	name: string,
	state_id: number,
	country_id:number
}

export interface ClassCompany {
	sop_id:number,
	sop_company_id:number,
	company_id: number,
	company_name: string,
	short_name: string,
	company_type: ClassLookup,
	address: string,
	city: ClassCity,
	state: ClassState,
	country: ClassCountry,
	zip_code: string,
}

export interface ClassCountryCode {
	country_code_id: number,
	country_name: string,
	country_code: string,
	iso_code: string
}

export interface ClassSOPContactWithCompList {
	sop_id: number,
	sop_contact_id: number,
	contact_id: number,
	contact_type: string,
	company_id: number,
	company_name: string,
	contact_name: string,
	email: string,
	division: string,
	position: string,
	phone_country: ClassCountryCode,
	phone: string,
	mobile_country: ClassCountryCode,
	mobile: string,
	remainder_alerts: boolean,
	escalation_alerts: boolean,
	origin_ports: ClassPorts[],
	wechatid: string,
	companys: ClassSOPCompany[]
}

export interface ClassSOPContact {
	sop_id: number,
	sop_contact_id: number,
	contact_id: number,
	contact_type: string,
	company_id: number,
	company_name: string,
	contact_name: string,
	email: string,
	division: string,
	position: string,
	phone_country: ClassCountryCode,
	phone: string,
	mobile_country: ClassCountryCode,
	mobile: string,
	remainder_alerts: boolean,
	escalation_alerts: boolean,
	origin_ports: ClassPorts[],
	wechatid: string
}

export interface ClassLookup {
	lookup_name_id: number,
	lookup_name: string,
	display_name: string,
	lookup_type: string,
	require_validation: boolean,
	company_id: number
}

export interface ClassContactPort {
	sop_contact_port_id:number,
	sop_contact_id:number,
	origin_port_id:number,
	is_selected:boolean
}

export interface ClassSOPDoc {
	sop_id:number,
	origin_country:ClassCountryCode,
	destination_country:ClassCountryCode,
	grp:string,
	count: number
}

export interface ClassSOPDocAddEdit {
	sop_id:number,
	origin_country:ClassCountryCode,
	destination_country:ClassCountryCode,
	grp:string,
	count: number,
	principal: ClassSOPContact[],
	shipper: ClassSOPContact[],
	ff: ClassSOPContact[],
	vendor: ClassSOPContact[],
	carrier: ClassSOPContact[],
}

export interface ClassDoc {
	doc_id:number,
	grp:string,
	grp_seq: number,
	sub_grp: string,
	sub_grp_seq: number,
	doc_name: string,
	control_name:string,
	doc_seq: number,
	has_child: boolean,
	fields:any,
	is_selected:boolean,
}

export interface ClassTmpGrp {
	grp_seq: number,
	grp: string
	html_template:string,	
}

export interface ClassCh {
	ch_id:number,
	ch_seq: number,
	sub_grp_seq: number,
	sub_grp: string,
	ch_name: string,
	control_name:string,
	has_child: boolean,
	view_text: string,
	fields:any,
	ui_img_file_name:string,
}

export interface ClassSOPCh {
	sop_ch_id:number,
	sop_id:number,
	ch_id:number,
	ch_seq: number,
	sub_grp_seq: number,
	sub_grp: string,
	ch_name: string,
	control_name:string,
	has_child: boolean,
	view_text: string,
	fields:any,
	ui_img_file_name:string,
	is_selected:boolean,
	disp_text: string,
	img_url: string,
	img_url_grey:string,
	template:string,
	expand: boolean
}

export interface ClassPOB {
	pob_id:number,
	pob_seq: number,
	sub_grp_seq: number,
	sub_grp: string,
	pob_name: string,
	control_name:string,
	has_child: boolean,
	view_text: string,
	fields:any,
	ui_img_file_name:string,
}

export interface ClassSOPPOB {
	sop_pob_id:number,
	sop_id:number,
	pob_id:number,
	pob_seq: number,
	sub_grp_seq: number,
	sub_grp: string,
	pob_name: string,
	control_name:string,
	has_child: boolean,
	view_text: string,
	fields:any,
	ui_img_file_name:string,
	is_selected:boolean,
	disp_text: string,
	img_url: string,
	img_url_grey:string,
	template:string
}

export interface ClassSOPContainer {
	sop_container_id: number, 
	container_id: number, 
	iso_type_code: string, 
	iso_size_code: string, 
	description: string, 
	max_cbm: number, 
	max_weight_kgs: number, 
	min_cbm: number, 
	optimal_cbm: number, 
	preference: number, 
	remarks_required: boolean,
	remarks: string,
	edit_mode:boolean,
	is_removed:boolean,
	fcl_min: number,
	port_id_exception: any
}

export class TblGroup {
	level = 0;
	parent: TblGroup;
	expanded = true;
	totalCounts = 0;
	get visible(): boolean {
	  return !this.parent || (this.parent.visible && this.parent.expanded);
	}
}
