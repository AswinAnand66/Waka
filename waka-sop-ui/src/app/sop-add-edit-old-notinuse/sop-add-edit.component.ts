import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, Validators, FormControl, FormBuilder, FormArray } from '@angular/forms';
import { AuthenticationService } from '../_services/index';
import { ReusableComponent } from '../reusable/reusable.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDropList } from '@angular/cdk/drag-drop';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

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
	template:string
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

@Component({
	selector: 'sop-add-edit',
	templateUrl: 'sop-add-edit.html',
	styleUrls: ['./sop-add-edit.component.css']
})
export class SopAddEditComponent implements OnInit {
	objectKeys = Object.keys;
	objectValues = Object.values;
	form: FormGroup;
	isLoading: boolean;
	screen: any;
	userDetails:any;
	selTabIndex = 0;
	colorBD = "var(--lightgray)";
	dispBD = false;
	fwBD = 'normal';
	fwPC = 'normal';
	colorPC = "var(--lightgray)";
	dispPC = false;
	fwLP = 'normal';
	colorLP = "var(--lightgray)";
	dispLP = false;
	fwVend = 'normal';
	colorVend = "var(--lightgray)";
	dispVend = false;
	fwSh = 'normal';
	colorSh = "var(--lightgray)";
	dispSh = false;
	fwCar = 'normal';
	colorCar = "var(--lightgray)";
	dispCar = false;
	validBC = false;
	validDoc = false;
	validCH = false;
	validCA = false;
	validPOB = false;
	colorPOB = "var(--lightgray)";
	dispPOB = false;
	fwPOB = 'normal;'
	pobGrpParam = {};
	pobGrpColl:ClassTmpGrp[] = [];
	pobSOPColl:ClassSOPCh[] = [];
	pobTemplate:string = 'template1';
	pobGrpTitle:string = '';
	colorCA = "var(--lightgray)";
	dispCA = false;
	fwCA = 'normal;'
	colorCCP = "var(--lightgray)";
	dispCCP = false;
	fwCCP = 'normal;'
	chGrpParam = {};
	chGrpColl:ClassTmpGrp[] = [];
	chSOPColl:ClassSOPCh[] = [];
	chTemplate:string = 'template1';
	chGrpTitle:string = '';
	fwCP = 'normal';
	colorCP = "var(--lightgray)";
	dispCP = false;
	portColl: ClassPorts[];
	countryCodeColl: ClassCountryCode[] = [];
	countryDestCodeColl: ClassCountryCode[] = [];
	principalContactColl = new MatTableDataSource<ClassSOPContact>([]);
	vendorContactColl= new MatTableDataSource<ClassSOPContact>([]);
	ffContactColl= new MatTableDataSource<ClassSOPContact>([]);
	shipperContactColl= new MatTableDataSource<ClassSOPContact>([]);
	carrierContactColl= new MatTableDataSource<ClassSOPContact>([]);
	sopCompanyColl = new MatTableDataSource<ClassSOPCompany>([]);
	dispSOPCompany = ["company_name","company_type", "country_name","remove"];
	contact: ClassSOPContactWithCompList;
	sopStatusColl: ClassLookup[];
	sopId:number;
	dispContacts = ['company_name','division','position', 'contact_name', 'email','mobile', 'phone', 'edit','remove'];
	originCountryColl = [];
	destCountryColl = [];
	sopDoc:ClassSOPDocAddEdit;
	sopDocColl = [];
	docColl:ClassDoc[];
	sopDocCard = [];
	company:ClassCompany;
	filterVendor: Observable<ClassSOPCompany[]>;
	filterCarrier: Observable<ClassSOPCompany[]>;
	filterShipper: Observable<ClassSOPCompany[]>;
	Vendor = new FormControl();
	Shipper = new FormControl();
	Carrier = new FormControl();
	vendContactAllColl:ClassSOPContact[] = [];
	shipperContactAllColl:ClassSOPContact[] = [];
	carrierContactAllColl:ClassSOPContact[] = [];
	containerColl = new MatTableDataSource<ClassSOPContainer>([]);
	sopContainerColl = new MatTableDataSource<ClassSOPContainer>([]);
	tblDispContainer = ["iso_type_code","description","max_cbm","max_weight_kgs"];
	tblSOPDispContainer = ["iso_type_code","description","fcl_min","min_cbm","optimal_cbm","max_cbm", "preference", "edit"];
	@ViewChild(MatSort, { static: false }) sort: MatSort;
	@ViewChild('table') table: MatTableDataSource<ClassSOPContainer>;
	fetchedSopContainerIds:number[] = [];
	sopCarrierAllocColl = [];
	datasource = new MatTableDataSource<any | TblGroup>([]);
	_alldata: any[];
	dispCarrierAllocColumns = ["carrier_name", "contract_number", "allocation_percent"];
	groupByColumns = ["origin_dest_port"];
	editSOPValidity:boolean = false;
	validityDateError:string;
	sopCarrierPrefColl = [];
	dispCarrierPrefColumns = ["carrier_name", "contract_number", "preference"];
	sop:any;
	carrierColl = [];
	avlWidth:number;

	originCountry = new FormControl();
	destCountry = new FormControl();
	filterOriginOptions: Observable<any[]>;
	filterDestOptions: Observable<any[]>;
	ocColl = [];
	dcColl = [];
	allFromOrigin: boolean = false;
	allFromDest: boolean = false;
	countryOthers: boolean = false;
	othServices = ["Services","Communication"];
	othServiceColor = [];
	serviceTypes = [];
	serviceTypeColl = {};
	selType:string;
	communicationColl = [];
	dispLCLCons = false;
	fwLCLCons = 'normal';
	colorLCLCons = "var(--lightgray)";
	lclConsColl = [];
	dispFCLCons = false;
	fwFCLCons = 'normal';
	colorFCLCons = "var(--lightgray)";
	fclConsColl = [];

	constructor (
		private authService: AuthenticationService,
		private reusable: ReusableComponent,
		private router: Router,
		private formBuilder: FormBuilder,
		public dialog: MatDialog,
	) {
		// this.createForm();
	}

	ngOnInit() {
		this.getCountryCode();
		this.userDetails = ReusableComponent.usr;
		if (sessionStorage.getItem("sop")) {
			this.sop = JSON.parse(this.reusable.decrypt(sessionStorage.getItem("sop")));
			this.sop["validFrom"] = new Date(this.sop.valid_from); 
			this.sop["validTo"] = new Date(this.sop.valid_to); 
		}
		this.reusable.headHt.next(60);
		this.reusable.screenChange.subscribe(res => {
			this.screen = { width: res.width-112, height: res.height-140-16 };
		});
		if (this.selTabIndex == 0){
			this.onClickBD();
		}
		this.filterOriginOptions = this.originCountry.valueChanges.pipe(
			startWith(''),
			map(value => typeof value === 'string' || value == undefined? value : value.country_name),
			map(name => name ? this._filter(name) : this.countryCodeColl)
		);
		this.filterDestOptions = this.destCountry.valueChanges.pipe(
			startWith(''),
			map(value => typeof value === 'string' || value == undefined? value : value.country_name),
			map(name => name ? this._filterDes(name) : this.countryCodeColl)
		);
		setTimeout(() => {
			let elmntoc = document.getElementById("ocid");
			let elmntdc = document.getElementById("dcid");
			this.avlWidth = this.screen.width-elmntoc.offsetWidth-elmntdc.offsetWidth-48-20;

		}, 1000);
	}

	private _filter(name: string): ClassCountryCode[] {
		const filterValue = name.toLowerCase();
		return this.countryCodeColl.filter(option => option.country_name.toLowerCase().indexOf(filterValue) >= 0);
	}

	private _filterDes(name: string): ClassCountryCode[] {
		const filterValue = name.toLowerCase();
		return this.countryDestCodeColl.filter(option => option.country_name.toLowerCase().indexOf(filterValue) >= 0);
	}

	displayFn(cc: ClassCountryCode): any {
		return cc && cc.country_name ? cc.country_name : '';
	}

	async getSOPCountries(){
		let param = {
			sop_id: this.sopId
		};
		let result = await this.authService.getSOPCountries(param);
		if (result.success){
			this.ocColl = result.result.filter(x => x.origin_dest == 'origin');
			this.dcColl = result.result.filter(x => x.origin_dest == 'destination');
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	addOriginCountry(){
		if (this.originCountry.value == undefined) return
		if (this.ocColl.findIndex(x=>x.country_code_id == this.originCountry.value.country_code_id) == -1){
			this.ocColl.push(this.originCountry.value);
		}
		this.originCountry.setValue(null);
	}

	removeOrgCountry(rmCountry){
		let ix = this.ocColl.findIndex(x=>x.country_code_id == rmCountry.country_code_id);
		this.ocColl.splice(ix,1);
	}

	addDestCountry(){
		if (this.destCountry.value == undefined) return
		if (this.dcColl.findIndex(x=>x.country_code_id == this.destCountry.value.country_code_id) == -1){
			this.dcColl.push(this.destCountry.value);
		}
		this.destCountry.setValue(null);
	}

	removeDesCountry(rmCountry){
		let ix = this.dcColl.findIndex(x=>x.country_id == rmCountry.country_id);
		this.dcColl.splice(ix,1);
	}

	async saveOrigin(){
		let orgIds = [];
		this.ocColl.map(oc => {
			orgIds.push(oc.country_code_id);
		});
		let param = {
			sop_id: this.sopId,
			origin_dest: 'origin',
			countryIds: orgIds
		}
		let result = await this.authService.insSOPCountry(param);
		if (result.success){
			this.reusable.openAlertMsg("Origin country updated successfully","info");
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async saveDest(){
		let destIds = [];
		this.dcColl.map(dc => {
			destIds.push(dc.country_code_id);
		});
		let param = {
			sop_id: this.sopId,
			origin_dest: 'destination',
			countryIds: destIds
		}
		let result = await this.authService.insSOPCountry(param);
		if (result.success){
			this.reusable.openAlertMsg("Destination country updated successfully","info");
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async allOrigin(event){
		if (!event) return;
		if (this.ocColl.length == 0 ) return;
		let countryIds = [];
		this.ocColl.map(id =>{
			countryIds.push(id.country_code_id);
		});
		let param = {
			countryIds: countryIds
		}
		let result = await this.authService.getAllInvitedCompanyForCountry(param);
		if (result.success){
			let dispMsg = false;
			result.result.map(row => {
				if (this.sopCompanyColl.data.findIndex(x=> x.company_id == row.company_id) == -1){
					this.sopCompanyColl.data.push(row);
					dispMsg = true;
				}
			})
			this.sopCompanyColl = new MatTableDataSource(this.sopCompanyColl.data);
			if (dispMsg) this.reusable.openAlertMsg("Click SAVE to confirm the changes","info");
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async allDest(event){
		if (!event) return;
		if (this.dcColl.length == 0 ) return;
		let countryIds = [];
		this.dcColl.map(id =>{
			countryIds.push(id.country_code_id);
		});
		let param = {
			countryIds: countryIds
		}
		let result = await this.authService.getAllInvitedCompanyForCountry(param);
		if (result.success){
			result.result.map(row => {
				if (this.sopCompanyColl.data.findIndex(x=> x.company_id == row.company_id) == -1){
					this.sopCompanyColl.data.push(row);
				}
			})
			this.sopCompanyColl = new MatTableDataSource(this.sopCompanyColl.data);
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async dateChangeTo(event){
		if (event != null){
			let oldFrom = this.sop.valid_from.toString();
			let oldTo = this.sop.valid_to.toString();
			this.sop.valid_from = new Date(this.sop.validFrom._d).toISOString();
			this.sop.valid_to = new Date(event._d).toISOString();
			let result = await this.authService.insSOP({param:this.reusable.encrypt(JSON.stringify(this.sop))});
			if (result.success){
				if (result.message == undefined){
					this.reusable.openAlertMsg("Successfully updated the SOP Validity","info");
				}
				else {
					this.reusable.openAlertMsg(result.message, "error");
					this.sop.valid_from = oldFrom;
					this.sop.valid_to = oldTo;
					this.sop["validFrom"] = new Date(oldFrom);
					this.sop["validTo"] = new Date(oldTo);
					this.validityDateError = result.message;
					setTimeout(() => {
						this.validityDateError = undefined
					}, 5000);
				}
			}
			else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
			}
			this.editSOPValidity = false;
		}
	}

	editContainterPref(element){
		const dialogRef = this.dialog.open(ContainerPrefEditDialog, {
			width: '500px',
			data: element
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result != undefined){
				result.errMsg = undefined;
				result.edit_mode = false;
			}
		});
	}

	// copyFromSOP(){
	// 	const dialogRef = this.dialog.open(CopySopDialog, {
	// 		width: '500px',
	// 		data: this.sop
	// 	});
	// 	dialogRef.afterClosed().subscribe(result => {
	// 		this.getSOPCompany();
	// 		this.getContacts(this.sop.principal_id,'Consignee');
	// 		this.getContacts(this.sop.ff_id,'Freight Forwarder');
	// 		this.getContacts(null,'Vendor');
	// 		this.getContacts(null,'Shipper');
	// 		this.getContacts(null,'Carrier');
	// 	});
	// }

	applyCompFilter(event: Event, dataSource) {
		const filterValue = (event.target as HTMLInputElement).value;
		dataSource.filter = filterValue.trim().toLowerCase();
	}

	async getCountryCode(){
		let result = await this.authService.getCountryCode();
		if (result.success){
			this.countryCodeColl = this.countryDestCodeColl = result.result;
			if (this.sop == undefined) this.reusable.titleHeader.next("Standard Operating Procedure");
			else {
				this.reusable.titleHeader.next("Edit Standard Operating Procedure ("+ this.sop.sop_id+")");
				this.sopId = this.sop.sop_id;
				this.getSOPCompany();
				this.getSOPCountries();
				// this.getContacts(this.sop.principal_id,'Consignee');
				// this.getContacts(this.sop.ff_id,'Freight Forwarder');
				// this.getContacts(null,'Vendor');
				// this.getContacts(null,'Shipper');
				// this.getContacts(null,'Carrier');
			}
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async getSOPCompany(){
		let param = {
			sop_id: this.sopId
		}
		let result = await this.authService.getSOPCompany({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.sopCompanyColl = new MatTableDataSource<ClassSOPCompany>(result.result);
			this.sopCompanyColl.sort = this.sort;
			this.sopCompanyColl.data.map(company=>{
				if (company.company_type != "Carrier"){
					this.getCompanyContacts(company);
				}
			})
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	addDoc(){
		this.sopDoc = {sop_id:this.sopId, origin_country:null, destination_country:null,grp:null, count:null, principal:this.principalContactColl.data, shipper:this.shipperContactColl.data, ff:this.ffContactColl.data, carrier:this.carrierContactColl.data, vendor:this.vendorContactColl.data};
		this.openDocDialog(this.sopDoc);
	}

	async addComp(){
		let sopCompColl = [];
		this.sopCompanyColl.data.map(sc => {
			sopCompColl.push({sop_id: this.sopId, company_id: sc.company_id, company_type_id: sc.company_type_id, country_id:sc.country_id});
		});
		let param = {
			sopCompColl: sopCompColl
		};
		let result = await this.authService.addRemoveSOPCompanies({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.reusable.openAlertMsg("Successfully Add/Updated Companies","info");
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async delCompany(sopComp){
		let confirmMsg = confirm("Are you sure you want to remove the company "+sopComp.company_name+"? Click SAVE to confirm");
		if (!confirmMsg) return;
		let idx = this.sopCompanyColl.data.findIndex(x=>x.company_id == sopComp.company_id);
		this.sopCompanyColl.data.splice(idx,1);
		this.sopCompanyColl = new MatTableDataSource(this.sopCompanyColl.data);	
	}

	openCompDialog(company:ClassCompany){
		const dialogRef = this.dialog.open(CompanyAddEditDialog, {
			width: '920px',
			data: company
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) this.getSOPCompany();
		});
	}

	openDocDialog(sopDoc){
		const dialogRef = this.dialog.open(DocAddEditDialog, {
			width: '930px',
			data: this.sopDoc
		});
		dialogRef.afterClosed().subscribe(result => {
			this.getSOPDocs();
		});
	}
	
	changeTab(tabIdx){
		this.selTabIndex = tabIdx;
		if (this.sopId == undefined && this.selTabIndex != 0) {
			this.reusable.openAlertMsg("Please complete the Business Contacts ->Basic to proceed", "info");
			setTimeout(() => {
				this.selTabIndex = 0;
				setTimeout(() => {
					this.onClickBD();
				}, 500);
			}, 1000);
			return;
		}
		if (this.selTabIndex == 1){
			this.getSOPDocs();
		}
		if (this.selTabIndex == 2){
			this.checkCreatePOBForSOP();
		}
		if (this.selTabIndex == 3){
			this.checkCreateCHForSOP();
		}
		if (this.selTabIndex == 4){
			this.colorCA = 'var(--active)';
			this.dispCA = true;
			this.dispCCP = false;
			this.fwCA = "600";
			this.getSOPCarrierAllocation();
		}
		if (this.selTabIndex == 5){
			this.onClickOthSer(0,this.othServices[0]);
		}
	}

	async onClickOthSer(ix,selService){
		this.othServiceColor = [];
		this.othServices.map((oc,i)=>{
			if (i < ix){
				this.othServiceColor.push({color:'var(--green)', disp:false, fw:"normal"})
			}
			else if (i == ix){
				this.othServiceColor.push({color:'var(--active)', disp:true, fw:"600"});
			}
			else {
				this.othServiceColor.push({color:'var(--lightgray)', disp:false, fw:"normal"});
			}
		});
		let param = {
			sop_id : this.sopId,
			instruction_type: 'communication'
		}
		if (ix == 0){
			let result = await this.authService.getSOPServices(param);
			if (result.success){
				this.serviceTypes = [...new Set(result.result.map(({service_type})=>service_type))];
				this.serviceTypes.map(service=>{
					this.serviceTypeColl[service] = result.result.filter(x=>x.service_type == service);
				});
			}
			else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
			}
		}
		else if (ix == 1){
			let result = await this.authService.getSOPCommunication(param);
			if (result.success){
				this.communicationColl = result.result;
			}
			else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
			}
		}
	}

	selParService(service, serviceType, checked){
		let child = this.serviceTypeColl[serviceType].filter(x=> x.parent_service_id == service.service_id);
		if (child.length >0){
			child.map(ch=>{
				ch.is_selected = checked;
			})
		}
	}

	async saveCommunication(grid, instructionType){
		if (grid.instruction == undefined || grid.instruction.trim().length == 0) {
			grid["edit"] = true;
			grid["msg"] = "Instruction is mandatory";
			setTimeout(() => {
				grid["msg"] = undefined;
			}, 1000);
			return;
		} 
		if (grid.sop_communication_id == undefined){
			let param = {
				sop_id: this.sopId,
				instruction: grid.instruction,
				communication_id: grid.communication_id,
				instruction_type: instructionType
			}
			let result = await this.authService.insSOPCommunication({param:this.reusable.encrypt(JSON.stringify(param))});
			if (result.success){
				grid["msg"] = "Successfully added the instruction";
				grid["sop_communication_id"] = result.result[0].sop_communication_id;
				setTimeout(() => {
					grid["msg"] = undefined;
				}, 3000);
			}
			else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
			}
		}
		else {
			let param = {
				sop_communication_id: grid.sop_communication_id,
				instruction: grid.instruction,
			}
			let result = await this.authService.updSOPCommunication({param:this.reusable.encrypt(JSON.stringify(param))});
			if (result.success){
				grid["msg"] = "Successfully updated the instruction";
				setTimeout(() => {
					grid["msg"] = undefined;
				}, 3000);
			}
			else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
			}
		}
	}

	async removeComm(grid,ix){
		let conf =confirm("Are you sure you like to remove this instruction?");
		if (!conf) return;
		if (grid.sop_communication_id == undefined){
			this.communicationColl.splice(ix,1);
			return;
		}
		let param = {
			sop_communication_id: grid.sop_communication_id
		}
		let result = await this.authService.delSOPCommunication({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			grid["msg"] = "Successfully removed the instruction";
			if (grid.communication_id == undefined){
				this.communicationColl.splice(ix,1);
			} 
			else {
				grid["sop_communication_id"] = undefined;
			}
			setTimeout(() => {
				grid["msg"] = undefined;
			}, 3000);
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	addNewFCLInst(){
		this.fclConsColl.push({
			communication_id: null,
			edit: true,
			instruction: "",
			is_selected: true,
			sop_communication_id: null,
			sop_id: this.sopId,
			focus:true
		});
		setTimeout(() => {
			let htmlEle = document.getElementById('inst'+(this.fclConsColl.length-1));
			htmlEle.focus();
		}, 500);
	}

	addNewLCLInst(){
		this.lclConsColl.push({
			communication_id: null,
			edit: true,
			instruction: "",
			is_selected: true,
			sop_communication_id: null,
			sop_id: this.sopId,
			focus:true
		});
		setTimeout(() => {
			let htmlEle = document.getElementById('inst'+(this.lclConsColl.length-1));
			htmlEle.focus();
		}, 500);
	}

	addNewInst(){
		this.communicationColl.push({
			communication_id: null,
			edit: true,
			instruction: "",
			is_selected: true,
			sop_communication_id: null,
			sop_id: this.sopId,
			focus:true
		});
		setTimeout(() => {
			let htmlEle = document.getElementById('inst'+(this.communicationColl.length-1));
			htmlEle.focus();
		}, 500);
	}

	// scroll(el: HTMLElement) {
	// 	el.scrollIntoView();
	// }

	async saveService(){
		let selectedService = [];
		this.serviceTypes.map(service=>{
			let filter = this.serviceTypeColl[service].filter(x=>x.is_selected);
			if(filter.length > 0){
				filter.map(fil=>{
					fil.sop_id = this.sopId;
					selectedService.push(fil);
				})
			}
		})
		let param = {
			sop_id: this.sopId,
			sopServiceColl: selectedService
		}
		let result = await this.authService.insSOPServices({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.reusable.openAlertMsg("Successfully added/updated the Services","info");
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async getSOPCarrierAllocation(){
		let param = {
			sop_id: this.sopId
		}
		let result = await this.authService.getSOPCarrierAlloc({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.sopCarrierAllocColl = result.result;
			this._alldata = this.sopCarrierAllocColl;
			this.datasource.data = this.addGroups(this._alldata, this.groupByColumns);
			this.datasource.filterPredicate = this.customFilterPredicate.bind(this);
			this.datasource.filter = performance.now().toString();
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async delSOPCarrierAlloc(orginDestPort){
		let conf = confirm("Are you sure to delete the allocations for this port "+orginDestPort);
		if (!conf) return;
		let delContent = this.sopCarrierAllocColl.filter(x=>x.origin_dest_port == orginDestPort)[0];
		let param = {
			sop_id: delContent.sop_id,
			origin_port_id: delContent.origin_port_id,
			dest_port_id: delContent.dest_port_id
		}
		let result = await this.authService.delSOPCarrierAllocForPort({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.reusable.openAlertMsg("Successfully removed Allocation","info");
			this.getSOPCarrierAllocation();
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async delSOPCarrierPref(orginDestPort){
		let conf = confirm("Are you sure to delete the preference for this port "+orginDestPort);
		if (!conf) return;
		let delContent = this.sopCarrierAllocColl.filter(x=>x.origin_dest_port == orginDestPort)[0];
		let param = {
			sop_id: delContent.sop_id,
			origin_port_id: delContent.origin_port_id,
			dest_port_id: delContent.dest_port_id
		}
		let result = await this.authService.delSOPCarrierPrefForPort({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.reusable.openAlertMsg("Successfully removed Preference","info");
			this.getSOPCarrierPreference();
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	groupBy(event, column) {
		event.stopPropagation();
		this.checkGroupByColumn(column.field, true);
		this.datasource.data = this.addGroups(this._alldata, this.groupByColumns);
		this.datasource.filter = performance.now().toString();
	}
	
	checkGroupByColumn(field, add ) {
		let found = null;
		for (const column of this.groupByColumns) {
			if (column === field) {
				found = this.groupByColumns.indexOf(column, 0);
			}
		}
		if (found != null && found >= 0) {
			if (!add) {
				this.groupByColumns.splice(found, 1);
			}
		} else {
			if ( add ) {
				this.groupByColumns.push(field);
			}
		}
	}

	//currently we are not allowing to ungroup
	unGroupBy(event, column) {
		event.stopPropagation();
		this.checkGroupByColumn(column.field, false);
		this.datasource.data = this.addGroups(this._alldata, this.groupByColumns);
		this.datasource.filter = performance.now().toString();
	}
	
	// below is for grid row grouping
	customFilterPredicate(data: any | TblGroup, filter: string): boolean {
		return (data instanceof TblGroup) ? data.visible : this.getDataRowVisible(data);
	}
	
	getDataRowVisible(data: any): boolean {
		const groupRows = this.datasource.data.filter(
		  row => {
			if (!(row instanceof TblGroup)) {
			  return false;
			}
			let match = true;
			this.groupByColumns.forEach(column => {
			  if (!row[column] || !data[column] || row[column] !== data[column]) {
				match = false;
			  }
			});
			return match;
		  }
		);
	
		if (groupRows.length === 0) {
		  return true;
		}
		const parent = groupRows[0] as TblGroup;
		return parent.visible && parent.expanded;
	}
	
	groupHeaderClick(row) {
		row.expanded = !row.expanded;
		this.datasource.filter = performance.now().toString();  // bug here need to fix
	}
	
	addGroups(data: any[], groupByColumns: string[]): any[] {
		const rootGroup = new TblGroup();
		rootGroup.expanded = true;
		return this.getSublevel(data, 0, groupByColumns, rootGroup);
	}
	
	getSublevel(data: any[], level: number, groupByColumns: string[], parent: TblGroup): any[] {
		if (level >= groupByColumns.length) {
		  return data;
		}
		const groups = this.uniqueBy(
		  data.map(
			row => {
			  const result = new TblGroup();
			  result.level = level + 1;
			  result.parent = parent;
			  for (let i = 0; i <= level; i++) {
				result[groupByColumns[i]] = row[groupByColumns[i]];
			  }
			  return result;
			}
		  ),
		  JSON.stringify);
	
		const currentColumn = groupByColumns[level];
		let subGroups = [];
		groups.forEach(group => {
		  const rowsInGroup = data.filter(row => group[currentColumn] === row[currentColumn]);
		  group.totalCounts = rowsInGroup.length;
		  const subGroup = this.getSublevel(rowsInGroup, level + 1, groupByColumns, group);
		  subGroup.unshift(group);
		  subGroups = subGroups.concat(subGroup);
		});
		return subGroups;
	}
	
	uniqueBy(a, key) {
		const seen = {};
		return a.filter((item) => {
			const k = key(item);
			return seen.hasOwnProperty(k) ? false : (seen[k] = true);
		});
	}
	
	isGroup(index, item): boolean {
		return item.level;
	}

	addCarrierAlloc(){
		let alloc = [];
		this.openCarrierAllocDialog(alloc);
	}

	openCarrierAllocDialog(alloc){
		const dialogRef = this.dialog.open(CarrierAddEditDialog, {
			width: '930px',
			minHeight:'370px',
			data: {sop_id:this.sopId, data:alloc}
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result)	this.getSOPCarrierAllocation();
		});
	}

	async checkCreateCHForSOP(){
		let param = {
			sop_id : this.sopId
		}
		let result = await this.authService.checkCreateCHForSOP({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.getCHGrp();
		} 
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async getCHGrp(){
		let result = await this.authService.getCHGrp();
		if (result.success){
			this.chGrpColl = result.result;
			this.chGrpColl.map((grp,i)=>{
				this.chGrpParam[i] = {color:"var(--lightgray)", disp:false, fw:"normal"};
			});
			this.onClickChGrp(0,this.chGrpColl[0].grp);
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	onClickCP(){
		this.chTemplate ="none";
		this.chGrpColl.map((group,ix)=>{
			
			if (this.chGrpParam[ix]["disp"]) this.chGrpParam[ix] = {color:"var(--green)", disp:false, fw:"normal"};
			else this.chGrpParam[ix] = {color:"var(--lightgray)", disp:false, fw:"normal"};
		});
		if (this.dispFCLCons){
			this.colorFCLCons = 'var(--green)';
			this.dispFCLCons = false;
			this.fwFCLCons = "normal";
		}
		if (this.dispLCLCons){
			this.colorLCLCons = 'var(--green)';
			this.dispLCLCons = false;
			this.fwLCLCons = "normal";
		}
		this.colorCP = 'var(--active)';
		this.dispCP = true;
		this.fwCP = "600";
		this.getSOPContainer();
		
	}

	onClickLCLCons(){
		this.chTemplate ="none";
		this.chGrpColl.map((group,ix)=>{
			if (this.chGrpParam[ix]["disp"]) this.chGrpParam[ix] = {color:"var(--green)", disp:false, fw:"normal"};
			else this.chGrpParam[ix] = {color:"var(--lightgray)", disp:false, fw:"normal"};
		});
		if (this.dispFCLCons){
			this.colorFCLCons = 'var(--green)';
			this.dispFCLCons = false;
			this.fwFCLCons = "normal";
		}
		if (this.dispCP){
			this.colorCP = 'var(--green)';
			this.dispCP = false;
			this.fwCP = "normal";
		}
		this.colorLCLCons = 'var(--active)';
		this.dispLCLCons = true;
		this.fwLCLCons = "600";
		this.getSOPLCLCons();
	}

	onClickFCLCons(){
		this.chTemplate ="none";
		this.chGrpColl.map((group,ix)=>{
			if (this.chGrpParam[ix]["disp"]) this.chGrpParam[ix] = {color:"var(--green)", disp:false, fw:"normal"};
			else this.chGrpParam[ix] = {color:"var(--lightgray)", disp:false, fw:"normal"};
		});
		if (this.dispLCLCons){
			this.colorLCLCons = 'var(--green)';
			this.dispLCLCons = false;
			this.fwLCLCons = "normal";
		}
		if (this.dispCP){
			this.colorCP = 'var(--green)';
			this.dispCP = false;
			this.fwCP = "normal";
		}
		this.colorFCLCons = 'var(--active)';
		this.dispFCLCons = true;
		this.fwFCLCons = "600";
		this.getSOPFCLCons();
	}

	async getSOPFCLCons(){
		let param = {
			sop_id: this.sopId,
			instruction_type: 'FCL Program'
		}
		let result = await this.authService.getSOPCommunication(param);
		if (result.success){
			this.fclConsColl = result.result;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error")
		}
	}

	async getSOPLCLCons(){
		let param = {
			sop_id: this.sopId,
			instruction_type: 'LCL Consolidation'
		}
		let result = await this.authService.getSOPCommunication(param);
		if (result.success){
			this.lclConsColl = result.result;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error")
		}
	}
	async onClickChGrp(idx,grp){
		if (this.dispCP){
			this.colorCP = "var(--green)";
			this.dispCP = false;
			this.fwCP = "normal"
		}
		this.chGrpColl.map((group,ix) => {
			if (idx == ix){
				this.chGrpParam[idx] = {color:"var(--active)", disp:true, fw:600};
				this.chTemplate = this.chGrpColl[idx].html_template;
				this.chGrpTitle = grp;
			} else {
				if (this.chGrpParam[ix]["disp"]) this.chGrpParam[ix] = {color:"var(--green)", disp:false, fw:"normal"};
				else this.chGrpParam[ix] = {color:"var(--lightgray)", disp:false, fw:"normal"};
			}
		});
		let param = {
			grp: grp,
			sop_id:this.sopId
		};
		let result = await this.authService.getSOPCHForGroup({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			let resp = result.result;
			resp.map(ch => {
				if (ch.view_text != undefined){
					ch.disp_text = ch.view_text;
					ch.fields.map(fld =>{
						fld.fields.map(fldoffld=>{
							fld[fldoffld]["field"].map(actField=>{
								let val = actField.value;
								if (typeof val == 'boolean'){
									val = val ? 'Required': 'Not Required';
								}
								ch.disp_text = ch.disp_text.replace('$$'+actField.controlname+'$$',val==null?'':val);
							})
						})
					});
				}
				// if (ch.has_child && ch.view_text != undefined){
				// 	ch.disp_text = ch.view_text;
				// 	ch.fields.map(field =>{
				// 		ch.disp_text = ch.disp_text.replace('$$'+field.controlname+'$$',field.value==null?'':field.value);
				// 	})
				// }
				if (ch.ui_img_file_name != undefined){
					ch.img_url = "url('../../assets/image/"+ch.ui_img_file_name+"')";
					let split = ch.ui_img_file_name.split('.');
					ch.img_url_grey = "url('../../assets/image/"+split[0]+'_grey.'+split[1]+"')";
				}
			});
			this.chSOPColl = resp;
		} 
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async checkCreatePOBForSOP(){
		let param = {
			sop_id : this.sopId
		}
		let result = await this.authService.checkCreatePOBForSOP({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.getPOBGrp();
		} 
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async getPOBGrp(){
		let result = await this.authService.getPOBGrp();
		if (result.success){
			this.pobGrpColl = result.result;
			this.pobGrpColl.map((grp,i)=>{
				this.pobGrpParam[i] = {color:"var(--lightgray)", disp:false, fw:"normal"};
			});
			this.onClickPOBGrp(0,this.pobGrpColl[0].grp);
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	onClickPOB(){
		this.pobTemplate ="none";
		this.pobGrpColl.map((group,ix)=>{
			if (this.pobGrpParam[ix]["disp"]) this.pobGrpParam[ix] = {color:"var(--green)", disp:false, fw:"normal"};
			else this.pobGrpParam[ix] = {color:"var(--lightgray)", disp:false, fw:"normal"};
		});
		// this.colorPOB = 'var(--active)';
		// this.dispPOB = true;
		// this.fwPOB = "600";
		// this.getSOPContainer();
	}

	async onClickPOBGrp(idx,grp){
		this.pobGrpColl.map((group,ix) => {
			if (idx == ix){
				this.pobGrpParam[idx] = {color:"var(--active)", disp:true, fw:600};
				this.pobTemplate = this.pobGrpColl[idx].html_template;
				this.pobGrpTitle = grp;
			} else {
				if (this.pobGrpParam[ix]["disp"]) this.pobGrpParam[ix] = {color:"var(--green)", disp:false, fw:"normal"};
				else this.pobGrpParam[ix] = {color:"lightgray", disp:false, fw:"normal"};
			}
		});
		let param = {
			grp: grp,
			sop_id:this.sopId
		};
		let result = await this.authService.getSOPPOBForGroup({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			let resp = result.result;
			resp.map(pob => {
				if (pob.view_text != undefined){
					pob.disp_text = pob.view_text;
					pob.fields.map(fld =>{
						fld.fields.map(fldoffld=>{
							fld[fldoffld]["field"].map(actField=>{
								let val = actField.value;
								if (typeof val == 'boolean'){
									val = val ? 'Required': 'Not Required';
								}
								pob.disp_text = pob.disp_text.replace('$$'+actField.controlname+'$$',val==null?'':val);
							})
						})
					});
				}
				if (pob.ui_img_file_name != undefined){
					pob.img_url = "url('../../assets/image/"+pob.ui_img_file_name+"')";
					let split = pob.ui_img_file_name.split('.');
					pob.img_url_grey = "url('../../assets/image/"+split[0]+'_grey.'+split[1]+"')";
				}
			});
			this.pobSOPColl = resp;
		} 
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async updPOBisSelected(grid){
		let param = {
			sop_pob_id: grid.sop_pob_id,
			is_selected: grid.is_selected
		};
		let result = await this.authService.updSOPPOBIsSelected({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success) {
			grid.status = "Update Successful";
			setTimeout(() => {
				grid.status = "";
			}, 5000);
		} 
		else {
			grid.status = "Update Failed";
			setTimeout(() => {
				grid.status = "";
			}, 5000);
		}
	}

	async pobSOPEdit(row){
		row["template"] = this.pobTemplate;
		const dialogRef = this.dialog.open(POBSopEditDialog, {
			width: '450px',
			data: row
		});
		dialogRef.afterClosed().subscribe(result => {
			let fields = result.fields;
			result.disp_text = result.view_text;
			fields.map(fld =>{
				fld.fields.map(fldoffld=>{
					fld[fldoffld]["field"].map(actField=>{
						let val = actField.value;
						if (typeof val == 'boolean'){
							val = val ? 'Required': 'Not Required';
						}
						if (result.view_text != undefined)
							result.disp_text = result.disp_text.replace('$$'+actField.controlname+'$$',val==null?'':val);
					})
				})
			});
		});
	}

	async getSOPContainer(){
		let param = {
			sop_id: this.sopId
		}
		let result = await this.authService.getSOPContainer({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			let container = result.result.filter(x=>x.sop_container_id == undefined);
			let sopContainer = result.result.filter(x=>x.sop_container_id != undefined);
			this.containerColl = new MatTableDataSource<ClassSOPContainer>(container);
			this.sopContainerColl = new MatTableDataSource<ClassSOPContainer>(sopContainer);
			this.fetchedSopContainerIds = [];
			sopContainer.map(container => {
				this.fetchedSopContainerIds.push(container.sop_container_id);
			});
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	dragDrop(event: CdkDragDrop<ClassSOPContainer[]>){
		// const previousIndex = this.containerColl.data.findIndex(row => row === event.item.data);
		if (event.previousContainer === event.container) {
			moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
		  } else {
			transferArrayItem(event.previousContainer.data,
							  event.container.data,
							  event.previousIndex,
							  event.currentIndex);
		  }
		  this.containerColl.data = [...this.containerColl.data];
		  this.sopContainerColl.data = [...this.sopContainerColl.data];
	}

	async savePref(){
		let currentContainerIds = []
		this.sopContainerColl.data.map((cont,ix)=>{
			this.validateInput(ix,cont);
			if (cont.sop_container_id != undefined) currentContainerIds.push(cont.sop_container_id);
		});
		let errors = this.sopContainerColl.data.filter(x=>x["errMsg"] != undefined);
		if (errors.length > 0) {
			return;
		}
		let insColl = this.sopContainerColl.data.filter(x=>x.sop_container_id == undefined);
		let updColl = this.sopContainerColl.data.filter(x=>x.sop_container_id != undefined);
		let removedColl = this.fetchedSopContainerIds.filter(x => currentContainerIds.indexOf(x)==-1);
		let msg = '';
		if (insColl.length > 0){
			let param = {
				data: JSON.stringify(insColl),
				sop_id: this.sopId
			}
			let result = await this.authService.insSOPContainer({param:this.reusable.encrypt(JSON.stringify(param))});
			if (!result.success){
				this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
			} else {
				msg += "Successfully added SOP Container Preference";
			}
		}
		if (updColl.length > 0){
			updColl.map(ele=>{
				let arrPort = ele.port_id_exception;
				let updArrPort = "{}";
				if (arrPort.length >0){
					updArrPort ="{";
					arrPort.map((p,i)=>{
						if (i!=0) updArrPort += ','
						updArrPort += p;
					})
					updArrPort += "}";
				}
				ele.port_id_exception = updArrPort;
			});
			let param = {
				data: updColl,
				sop_id: this.sopId
			}
			let result = await this.authService.updSOPContainer({param:this.reusable.encrypt(JSON.stringify(param))});
			if (result.success){
				msg += " Successfully updated SOP Container Preference";
			}
			else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
			}
		}
		if (removedColl.length > 0){
			let param = {
				removedContainerIds: removedColl
			}
			let result = await this.authService.removeSOPContainer({param:this.reusable.encrypt(JSON.stringify(param))});
			if (result.success){
				msg += " Successfully removed SOP Container Preference";
			}
			else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
			}
		}
		if (msg.length > 95){
			this.reusable.openAlertMsg("Successfully added/updated/removed SOP Container", "info");
		}
		else if (msg.length > 46 && msg.length < 95) {
			if (msg.includes("removed") && msg.includes("updated"))
				this.reusable.openAlertMsg("Successfully updated/removed SOP Container", "info");
			else if (msg.includes("removed") && msg.includes("added"))
				this.reusable.openAlertMsg("Successfully added/removed SOP Container", "info");
			else
				this.reusable.openAlertMsg("Successfully added/updated SOP Container", "info");
		}
		else if (msg.length>0 && msg.length < 50){
			this.reusable.openAlertMsg(msg, "info");
		}
		this.getSOPContainer();
	}

	validateInput(seq, element){
		element.preference = seq;
		element["errMsg"] = ''
		if (element.min_cbm <= 0 || element.min_cbm > element.max_cbm ){
			element["errMsg"] +="Min CBM must be greater than 0 and less than Max CBM.";
		}
		if (element.optimal_cbm > element.max_cbm || element.optimal_cbm < element.min_cbm){
			element["errMsg"] += "Optimal CBM must be between Min CBM and Max CBM";
		}
		if (element.fcl_min <=0 || element.fcl_min > element.max_cbm){
			element["errMsg"] +="FCL Min CBM must be greater than 0 and less than Max CBM.";
		}
		if (element["errMsg"].length == 0) {
			element["errMsg"] = undefined
			element.edit_mode = false;
		} else {
			element.edit_mode = true;
		}
	}

	applyContainerFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.containerColl.filter = filterValue.trim().toLowerCase();
	}

	async chSOPEdit(row){
		row["template"] = this.chTemplate;
		const dialogRef = this.dialog.open(ChSopEditDialog, {
			width: '450px',
			data: row
		});
		dialogRef.afterClosed().subscribe(result => {
			let fields = result.fields;
			result.disp_text = result.view_text;
			fields.map(fld =>{
				fld.fields.map(fldoffld=>{
					fld[fldoffld]["field"].map(actField=>{
						let val = actField.value;
						if (typeof val == 'boolean'){
							val = val ? 'Required': 'Not Required';
						}
						if (result.view_text != undefined)
							result.disp_text = result.disp_text.replace('$$'+actField.controlname+'$$',val==null?'':val);
					})
				})
			});
			// this.updDialogResult(result);
		});
	}

	// updDialogResult(updRow){
	// 	let chFil = this.chSOPColl.filter(x=>x.sop_ch_id == updRow.sop_ch_id);
	// 	chFil[0] = updRow;
	// }

	async updPOBFieldValue(idx, field, grid){
		let param = {
			fields : JSON.stringify(grid.fields),
			sop_ch_id: grid.sop_pob_id
		};
		let result = await this.authService.updSOPPOBfields({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			field["status"] = "Update Successful";
		} 
		else {
			field["status"] = "Update Failed";
		}
		setTimeout(() => {
			field["status"] = undefined;
		}, 3000);
	}

	async updFieldValue(idx, field, grid){
		let param = {
			fields : JSON.stringify(grid.fields),
			sop_ch_id: grid.sop_ch_id
		};
		let result = await this.authService.updSOPCHfields({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			field["status"] = "Update Successful";
		} 
		else {
			field["status"] = "Update Failed";
		}
		setTimeout(() => {
			field["status"] = undefined;
		}, 3000);
	}

	async updCHisSelected(grid){
		let param = {
			sop_ch_id: grid.sop_ch_id,
			is_selected: grid.is_selected
		};
		let result = await this.authService.updSOPCHIsSelected({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success) {
			grid.status = "Update Successful";
			setTimeout(() => {
				grid.status = "";
			}, 5000);
		} 
		else {
			grid.status = "Update Failed";
			setTimeout(() => {
				grid.status = "";
			}, 5000);
		}
	}

	async getSOPDocs(){
		if (this.sopId == undefined) {
			this.reusable.openAlertMsg("Please complete the Basic to proceed", "info");
			return;
		}
		let param = {
			sop_id: this.sopId
		}
		let result = await this.authService.getSOPDocs({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.sopDocCard = [];
			this.sopDocColl = result.result;
			let consolidateSOPDoc = {};
			this.sopDocColl.map((doc,ix) => {
				let keystring = doc.sop_id.toString()+doc.origin_country_id.toString()+doc.destination_country_id.toString();
				if (consolidateSOPDoc[keystring] == undefined){
					consolidateSOPDoc[keystring] = {[doc.grp.replace("Documents","")]:doc.count};
				} 
				else {
					consolidateSOPDoc[keystring][doc.grp.replace(" Documents","")] = doc.count;
				}
				if (ix > 0){
					let keyprevstring = this.sopDocColl[ix-1].sop_id.toString()+this.sopDocColl[ix-1].origin_country_id.toString()+this.sopDocColl[ix-1].destination_country_id.toString();
					if (keystring != keyprevstring || ix == this.sopDocColl.length-1){
						consolidateSOPDoc[keyprevstring]["origin_country_id"] = this.sopDocColl[ix-1].origin_country_id;
						consolidateSOPDoc[keyprevstring]["dest_country_id"] = this.sopDocColl[ix-1].destination_country_id;
						consolidateSOPDoc[keyprevstring]["sop_id"] = this.sopDocColl[ix-1].sop_id;
					}
				}
			});
			let sopKeys = Object.keys(consolidateSOPDoc);
			sopKeys.map(key=>{
				let originCountry = this.countryCodeColl.filter(x=>x.country_code_id==consolidateSOPDoc[key].origin_country_id)[0];
				let destCountry = this.countryCodeColl.filter(x=>x.country_code_id==consolidateSOPDoc[key].dest_country_id)[0];
				let rowKeys = Object.keys(consolidateSOPDoc[key]);
				let row = {};
				rowKeys.map(rowKey=>{
					if (rowKey == "origin_country_id") row["origin_country"] = originCountry;
					else if (rowKey == "dest_country_id") row["dest_country"] = destCountry;
					else row[rowKey] = consolidateSOPDoc[key][rowKey];
				})
				this.sopDocCard.push(row);
			})
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async delSOPDoc(doc){
		let conf = confirm("Are you sure you want to remove this document?");
		if (!conf) return;
		let d = doc[0];
		let param = {
			sop_id: d.sop_id,
			origin_country_id: d.origin_country_id,
			destination_country_id: d.destination_country_id
		}
		let result = await this.authService.delSOPDoc({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.reusable.openAlertMsg("Successfully removed the document", "info");
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async getCompanyContacts(company){
		let param = {
			company_id : company.company_id
		}
		let result = await this.authService.getCompanyContacts({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			if (company.company_type.toLowerCase() == "consignee"){
				this.principalContactColl = new MatTableDataSource(result.result);
			}
			else if (company.company_type == "Shipper"){
				this.shipperContactColl = new MatTableDataSource(result.result);
			}
			else if (company.company_type == "Freight Forwarder"){
				this.ffContactColl = new MatTableDataSource(result.result);
			}
			else if (company.company_type.toLowerCase() != "consignee" && company.company_type != "Shipper" && company.company_type != "Freight Forwarder") {
				this.vendorContactColl = new MatTableDataSource(result.result);
			}
		}
	}

	validateBD(){
		if (this.sop.principal_id == undefined || this.sop.ff_id == undefined ){
			this.colorBD = 'red';
		} else {
			this.colorBD = 'var(--green)'
		}
	}

	validatePC(){
		if (this.principalContactColl.data.length == 0){
			this.colorPC = 'red';
		} else {
			this.colorPC = 'var(--green)'
		}
	}

	validateLP(){
		if (this.ffContactColl.data.length == 0){
			this.colorLP = 'red';
		} else {
			this.colorLP = 'var(--green)'
		}
	}

	validateVendor(){
		if (this.vendorContactColl.data.length == 0){
			this.colorVend = 'red';
		} else {
			this.colorVend = 'var(--green)'
		}
	}

	validateShipper(){
		if (this.shipperContactColl.data.length == 0){
			this.colorSh = 'red';
		} else {
			this.colorSh = 'var(--green)'
		}
	}

	validateCarrier(){
		if (this.carrierContactColl.data.length == 0){
			this.colorCar = 'red';
		} else {
			this.colorCar = 'var(--green)'
		}
	}

	onClickBD(){
		// if (this.dispLP){
		// 	this.validateLP();
		// 	this.dispLP = false;
		// }
		// if (this.dispPC){
		// 	this.validatePC();
		// 	this.dispPC = false;
		// }
		// if (this.dispVend){
		// 	this.validateVendor();
		// 	this.dispVend = false;
		// }
		// if (this.dispSh){
		// 	this.validateShipper();
		// 	this.dispSh = false;
		// }
		// if (this.dispCar){
		// 	this.validateCarrier();
		// 	this.dispCar = false;
		// }
		this.colorBD = 'var(--active)';
		this.dispBD = true;
		this.fwBD = '600';
	}

	onClickPC(){
		// this.addSOP();
		this.validateBD();
		if (this.dispLP){
			this.validateLP();
			this.dispLP = false;
		}
		if (this.dispVend){
			this.validateVendor();
			this.dispVend = false;
		}
		if (this.dispSh){
			this.validateShipper();
			this.dispSh = false;
		}
		if (this.dispCar){
			this.validateCarrier();
			this.dispCar = false;
		}
		this.dispBD = false;
		this.colorPC = 'var(--active)';
		this.dispPC = true;
		this.fwPC = '600';
	}

	onClickLP(){
		// this.addSOP();
		this.validateBD();
		this.dispBD = false;
		this.colorLP = 'var(--active)';
		this.fwLP = '600';
		this.dispLP = true;
		if (this.dispVend){
			this.validateVendor();
			this.dispVend = false;
		}
		if (this.dispPC){
			this.validatePC();
			this.dispPC = false;
		}
		if (this.dispSh){
			this.validateShipper();
			this.dispSh = false;
		}
		if (this.dispCar){
			this.validateCarrier();
			this.dispCar = false;
		}
	}

	onClickSh(){
		this.validateBD();
		if (this.dispLP){
			this.validateLP();
			this.dispLP = false;
		}
		if (this.dispPC){
			this.validatePC();
			this.dispPC = false;
		}
		if (this.dispVend){
			this.validateVendor();
			this.dispVend = false;
		}
		if (this.dispCar){
			this.validateCarrier();
			this.dispCar = false;
		}
		this.dispBD = false;
		this.colorSh = 'var(--active)';
		this.dispSh = true;
		this.fwSh = '600';
	}

	onClickVend(){
		// this.addSOP();
		this.validateBD();
		if (this.dispLP){
			this.validateLP();
			this.dispLP = false;
		}
		if (this.dispPC){
			this.validatePC();
			this.dispPC = false;
		}
		if (this.dispSh){
			this.validateShipper();
			this.dispSh = false;
		}
		if (this.dispCar){
			this.validateCarrier();
			this.dispCar = false;
		}
		this.dispBD = false;
		this.colorVend = 'var(--active)';
		this.dispVend = true;
		this.fwVend = '600';
	}

	onClickCar(){
		// this.addSOP();
		this.validateBD();
		if (this.dispLP){
			this.validateLP();
			this.dispLP = false;
		}
		if (this.dispPC){
			this.validatePC();
			this.dispPC = false;
		}
		if (this.dispVend){
			this.validateVendor();
			this.dispVend = false;
		}
		if (this.dispSh){
			this.validateShipper();
			this.dispSh = false;
		}
		this.dispBD = false;
		this.colorCar = 'var(--active)';
		this.dispCar = true;
		this.fwCar = '600';
	}
	
	onClickCA(){
		if (!this.dispCA){
			this.colorCA = 'var(--active)';
			this.dispCA = true;
			this.fwCA = "600";
			this.dispCCP = false;
			this.getSOPCarrierAllocation();
		}
		if (this.dispCCP){
			this.colorCCP = 'var(--green)';
			this.dispCCP = false;
			this.fwCCP = 'normal'
		}
	}

	onClickCCP(){
		if (this.dispCA){
			this.colorCA = 'var(--green)';
			this.dispCA = false;
			this.fwCA = "normal";
		}
		if (!this.dispCCP) this.getSOPCarrierPreference();
		this.colorCCP = 'var(--active)';
		this.dispCCP = true;
		this.dispCA = false;
		this.fwCCP = "600";
	}

	async getSOPCarrierPreference(){
		let param = {
			sop_id: this.sopId
		}
		let result = await this.authService.getSOPCarrierPref({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.sopCarrierPrefColl = result.result;
			this._alldata = this.sopCarrierPrefColl;
			this.datasource.data = this.addGroups(this._alldata, this.groupByColumns);
			this.datasource.filterPredicate = this.customFilterPredicate.bind(this);
			this.datasource.filter = performance.now().toString();
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	addCarrierPref(){
		let pref = [];
		this.openCarrierPrefDialog(pref);
	}

	openCarrierPrefDialog(pref){
		const dialogRef = this.dialog.open(CarrierPrefAddEditDialog, {
			width: '930px',
			minHeight:'370px',
			data: {sop_id:this.sopId, data:pref}
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result)	this.getSOPCarrierPreference();
		});
	}

	async getCarrier(){
		let result = await this.authService.getCarrier();
		if (result.success){
			this.carrierColl = result.result;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async getCountry(){
		let result = await this.authService.getCountry();
		if (result.success){
			this.originCountryColl = result.result;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	goBack(){
		this.router.navigate(['/home/sop']);
	}

	getErrorMessage(control) {
		let msg = '';
		msg += control.hasError('required') ? 'You must enter a value' : '';
		// msg += control.hasError('email') ? 'Invalid Email' : '';
		return msg;
	}

	createForm() {
		this.form = this.formBuilder.group({
			Buyer: [null, Validators.compose([
				Validators.required,
			])],
			FF: [null, Validators.compose([
				Validators.required,
			])],
			SOPStatus:[null,Validators.compose([
				Validators.required,
			])],
		},
		);
	}

}

/* Contact Add/Edit Dialog */
@Component({
	selector: 'contact-add-edit',
	templateUrl: 'contact-add-edit-dialog.html',
	styleUrls: ['./sop-add-edit.component.css']
})
export class ContactAddEditDialog implements OnInit {
	form:FormGroup;
	countryCodeColl:ClassCountryCode[];
	portColl:ClassPorts[];
	emailValid = false;
	timerCtrlEmail;
	contactPortColl:ClassContactPort[];
	title:string;
	filterPort: Observable<ClassPorts[]>;
	filterP:string;

	constructor(
		public dialogRef: MatDialogRef<ContactAddEditDialog>,
		@Inject(MAT_DIALOG_DATA) public data:ClassSOPContactWithCompList,
		private formBuilder: FormBuilder,
		private authService: AuthenticationService,
		private reusable: ReusableComponent,
	  ) { }
	
	  ngOnInit(){
		this.createForm();
		this.getCountryCode();
		this.getPort();
		this.getSOPContactPorts();
		if (this.data.contact_type == 'Consignee' && this.data.sop_contact_id == undefined) this.title = 'ADD PRINCIPAL CONTACT';
		else if (this.data.contact_type == 'Freight Forwarder' && this.data.sop_contact_id == undefined) this.title = 'ADD LOGISTICS PROVIDER CONTACT';
		else if (this.data.contact_type == 'Vendor' && this.data.sop_contact_id == undefined) this.title = 'ADD VENDOR CONTACT';
		else if (this.data.contact_type == 'Shipper' && this.data.sop_contact_id == undefined) this.title = 'ADD SHIPPER CONTACT';
		else if (this.data.contact_type == 'Carrier' && this.data.sop_contact_id == undefined) this.title = 'ADD CARRIER CONTACT';
		else if (this.data.contact_type == 'Carrier' && this.data.sop_contact_id != undefined) this.title = 'EDIT CARRIER CONTACT';
		else if (this.data.contact_type == 'Shipper' && this.data.sop_contact_id != undefined) this.title = 'EDIT SHIPPER CONTACT';
		else if (this.data.contact_type == 'Vendor' && this.data.sop_contact_id != undefined) this.title = 'EDIT VENDOR CONTACT';
		else if (this.data.contact_type == 'Freight Forwarder' && this.data.sop_contact_id != undefined) this.title = 'EDIT LOGISTICS PROVIDER CONTACT';
		else if (this.data.contact_type == 'Consignee' && this.data.sop_contact_id != undefined) this.title = 'EDIT PRINCIPAL CONTACT';
		this.filterPort = this.form.get("FilterP").valueChanges
		.pipe(
			startWith(''),
			map(value => typeof value === 'string' ? value : value != undefined ? value.portwithregion : ''),
			map(name => name ? this._filter(name) : this.portColl)
		);
		if (this.data.contact_type == 'Consignee' || this.data.contact_type == 'Freight Forwarder'){
			this.form.get("Company").clearValidators();
			this.form.get("Company").updateValueAndValidity();
			this.form.get("Company").setValue(null);
		}
		else {
			if (this.data.sop_contact_id != undefined) {
				let filComp = this.data.companys.filter(x=>x.company_id == this.data.company_id);
				this.form.get("Company").setValue(filComp[0]);
			}
		}
	  }	

	  private _filter(portName: string): ClassPorts[] {
		const filterValue = portName.toLowerCase();
		return this.portColl.filter(option => option.portwithregion.toLowerCase().indexOf(filterValue) >= 0);
	  }

	  createForm() {
		this.form = this.formBuilder.group({
			Company: [null,Validators.compose([
				Validators.required,
			])],
			Division: [this.data.division,Validators.compose([
				Validators.required,
			])],
			Position:[this.data.position,Validators.compose([
				Validators.required,
			])],
			Name:[this.data.contact_name,Validators.compose([
				Validators.required,
			])],
			Email:[this.data.email,Validators.compose([
				Validators.required,
				Validators.email,
			])],
			PhoneCountry:[this.data.phone_country],
			Phone:[this.data.phone],
			MobileCountry:[this.data.mobile_country],
			Mobile:[this.data.mobile,Validators.compose([
				Validators.required,
			])],
			WeChatID:[this.data.wechatid],
			Ports:[this.data.origin_ports],
			FilterP:[null],
			EscalationAlerts:[this.data.escalation_alerts],
			RemainderAlerts:[this.data.remainder_alerts],
		});
	}

	onClose(){
		this.dialogRef.close();
	}
	
	async saveContact(action){
		let phCo = this.form.get("PhoneCountry").value == undefined ? null : this.form.get("PhoneCountry").value.country_code_id;
		let moCo = this.form.get("MobileCountry").value == undefined ? null : this.form.get("MobileCountry").value.country_code_id;
		let compId = this.form.get("Company").value == undefined ? this.data.company_id : this.form.get("Company").value.company_id;
		let param = {
			contact_id: this.data.contact_id,
			sop_contact_id: this.data.sop_contact_id,
			contact_type: this.data.contact_type,
			company_id: compId,
			contact_name: this.form.get("Name").value,
			email: this.form.get("Email").value,
			phone_country_id: phCo,
			phone: this.form.get("Phone").value,
			mobile_country_id: moCo,
			mobile: this.form.get("Mobile").value,
			division: this.form.get("Division").value,
			position: this.form.get("Position").value,
			remainder_alerts: this.form.get("RemainderAlerts").value,
			escalation_alerts: this.form.get("EscalationAlerts").value,
			origin_ports: this.form.get("Ports").value,
			wechatid: this.form.get("WeChatID").value,
			sop_id: this.data.sop_id,
		}
		let result = await this.authService.insUpdContact({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.reusable.openAlertMsg(result.message,"info");
			if (action=="close"){
				this.form.reset();
				this.onClose();
			}
			else {
				this.form.get("Name").reset();
				this.form.get("Email").reset();
				this.form.get("Phone").reset();
				this.form.get("Mobile").reset();
				this.form.get("WeChatID").reset();
				this.form.get("Ports").reset();
			}
		} 
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async getSOPContactPorts(){
		let param = {
			sop_contact_id: this.data.sop_contact_id
		}
		let result = await this.authService.getSOPContactPorts({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.contactPortColl = result.result;
			if (this.portColl != undefined && this.portColl.length > 0 ){
				let selPortArr = [];
				this.contactPortColl.map(cport=>{
					let cp = this.portColl.filter(x=>x.port_id == cport.origin_port_id);
					selPortArr.push(cp[0]);
				})
				this.form.get("Ports").setValue(selPortArr);
			}
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async getCountryCode(){
		let result = await this.authService.getCountryCode();
		if (result.success){
			this.countryCodeColl = result.result;
			if (this.data.contact_id != undefined){
				let phCountry = this.countryCodeColl.filter(x=>x.country_code_id == this.data.phone_country.country_code_id);
				this.form.get("PhoneCountry").setValue(phCountry[0]);
				let mbCountry = this.countryCodeColl.filter(x=>x.country_code_id == this.data.mobile_country.country_code_id);
				this.form.get("MobileCountry").setValue(mbCountry[0]);
			}
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async getPort(){
		let result = await this.authService.getPorts();
		if (result.success){
			this.portColl = result.result;
			this.form.get('FilterP').setValue(''); //this is used to set the port coll for UI under filterPort observable
			if (this.contactPortColl != undefined && this.contactPortColl.length > 0){
				let selPortArr = [];
				this.contactPortColl.map(cport=>{
					let cp = this.portColl.filter(x=>x.port_id == cport.origin_port_id);
					selPortArr.push(cp[0]);
				})
				this.form.get("Ports").setValue(selPortArr);
			}
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async validateEmail(){
		if (this.form.get("Email").value == undefined || this.form.get("Email").value.trim().length == 0){
			this.emailValid = false;
		}
		let param = {
			email: this.form.get("Email").value,
			company_id: this.data.company_id,
			sop_id: this.data.sop_id,
			contact_id:this.data.contact_id,
			sop_contact_id: this.data.sop_contact_id
		}
		let result = await this.authService.validateEmail({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success && result.rowCount == 0){
			if (this.timerCtrlEmail != undefined) clearInterval(this.timerCtrlEmail);
			this.emailValid = true;
		}
		else if (result.success && result.result[0].sop_contact_id != undefined) {
			this.emailValid = false;
			this.form.get("Email").setErrors({emailexists:true});
		}
		else if (result.success && result.result[0].sop_contact_id == undefined) {
			this.emailValid = true;
			let contact = result.result[0];
			this.data["contact_id"] = contact.contact_id;
			this.form.get("Division").setValue(contact.division);
			this.form.get("Position").setValue(contact.position);
			this.form.get("Phone").setValue(contact.phone);
			this.form.get("Mobile").setValue(contact.mobile);
			this.form.get("Name").setValue(contact.contact_name);
			this.form.get("WeChatID").setValue(contact.wechatid);
			let pcid = this.countryCodeColl.filter(x=>x.country_code_id == contact.phone_country_id);
			this.form.get("PhoneCountry").setValue(pcid[0]);
			let moid = this.countryCodeColl.filter(x=>x.country_code_id == contact.mobile_country_id);
			this.form.get("MobileCountry").setValue(moid[0]);
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
			this.emailValid = false;
		}
	}

	getErrorMessage(control, controlName) {
		let msg ='';
		msg += control.hasError('required') ? controlName + ' is Mandatory' :'';
		if (controlName =='Email'){
			if (control.hasError('email')) {
				msg +=  'Not a valid email';
				if (this.timerCtrlEmail != undefined) clearInterval(this.timerCtrlEmail);
				this.timerCtrlEmail = setTimeout(() => {
					this.emailValid = false;
				}, 500);
			}
			if (control.hasError('emailexists')) {
				msg +=  'Email already Exists'
			}
		}
		return msg;
	}

}

/* Document Add/Edit Dialog */
@Component({
	selector: 'doc-add-edit',
	templateUrl: 'doc-add-edit-dialog.html',
	styleUrls: ['./sop-add-edit.component.css']
})
export class DocAddEditDialog implements OnInit {
	objectKeys = Object.keys;
	objectValues = Object.values;
	form:FormGroup;
	countryCodeColl:ClassCountryCode[];
	destCountryCodecoll:ClassCountryCode[];
	portColl:ClassPorts[];
	emailValid = false;
	timerCtrlEmail;
	contactPortColl:ClassContactPort[];
	title:string;
	docGrp = {};
	docColl:ClassDoc[];
	contactAll = [];

	constructor(
		public dialogRef: MatDialogRef<ContactAddEditDialog>,
		@Inject(MAT_DIALOG_DATA) public data:ClassSOPDocAddEdit,
		private formBuilder: FormBuilder,
		private authService: AuthenticationService,
		private reusable: ReusableComponent,
	  ) { }
	
	  ngOnInit(){
		  this.title = "ADD DOCUMENT SET";
		  this.getCountryCode();
		  this.getDocs();
		  this.contactAll = this.contactAll.concat(this.data.principal).concat(this.data.ff).concat(this.data.shipper).concat(this.data.vendor);
	  }

	  async getCountryCode(){
		let result = await this.authService.getCountryCode();
		if (result.success){
			this.countryCodeColl = result.result;
			if (this.data.origin_country != undefined){
				let originCountry = this.countryCodeColl.filter(x=>x.country_code_id == this.data.origin_country.country_code_id);
				this.destCountryCodecoll = this.countryCodeColl.filter(x=>x.country_code_id != this.data.origin_country.country_code_id);
				this.form.get("OriginCountry").setValue(originCountry[0]);
				let destCountry = this.destCountryCodecoll.filter(x=>x.country_code_id == this.data.destination_country.country_code_id);
				this.form.get("DestCountry").setValue(destCountry[0]);
			}
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	onChangeOriginCountry(selCountry){
		this.destCountryCodecoll = this.countryCodeColl.filter(x=>x.country_code_id != selCountry.country_code_id);
	}

	async getDocs(){
		let result = await this.authService.getDocs();
		if (result.success){
			this.docColl = result.result;
			let fg = {};
			fg["OriginCountry"] = new FormControl(this.data.origin_country,Validators.compose([Validators.required]));
			fg["DestCountry"] = new FormControl(this.data.destination_country,Validators.compose([Validators.required]));
			this.docColl.map(doc => {
				if (this.docGrp[doc.grp] == undefined) {
					this.docGrp[doc.grp] = {};
					this.docGrp[doc.grp] = {[doc.sub_grp]:[]}
					this.docGrp[doc.grp][doc.sub_grp].push({docName:doc.doc_name, controlName:doc.control_name, hasChild:doc.has_child, fields:doc.fields,isSelected:true});
					fg[doc.control_name] = new FormControl(true);
					if(doc.has_child){
						doc.fields.map(field=>{
							fg[field.controlname] = new FormControl(field.value,Validators.compose([Validators.required]));
						});
					}
				} 
				else if(this.docGrp[doc.grp][doc.sub_grp] == undefined) {
					this.docGrp[doc.grp][doc.sub_grp] = [];
					this.docGrp[doc.grp][doc.sub_grp].push({docName:doc.doc_name, controlName:doc.control_name, hasChild:doc.has_child, fields:doc.fields,isSelected:true});
					fg[doc.control_name] = new FormControl(true);
					if(doc.has_child){
						doc.fields.map(field=>{
							fg[field.controlname] = new FormControl(field.value,Validators.compose([Validators.required]));
						});
					}
				}
				else {
					this.docGrp[doc.grp][doc.sub_grp].push({docName:doc.doc_name, controlName:doc.control_name, hasChild:doc.has_child, fields:doc.fields,isSelected:true});
					fg[doc.control_name] = new FormControl(true);
					if(doc.has_child){
						doc.fields.map(field=>{
							fg[field.controlname] = new FormControl(field.value,Validators.compose([Validators.required]));
						});
					}
				}
			});
			this.form = new FormGroup(fg);
		} 
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	onClose(){
		this.dialogRef.close();
	}

	onChange(doc, isChecked){
		doc.isSelected = isChecked;
		if (isChecked){
			this.form.get(doc.controlName).setValidators([Validators.required]);
			if(doc.hasChild){
				doc.fields.map(field=>{
					this.form.get(field.controlname).setValidators([Validators.required]);
					this.form.get(field.controlname).updateValueAndValidity();
				});
			}
		} 
		else {
			this.form.get(doc.controlName).clearValidators();
			if(doc.hasChild){
				doc.fields.map(field=>{
					this.form.get(field.controlname).clearValidators();
					this.form.get(field.controlname).updateValueAndValidity();
				});
			}
		}
	}

	async saveDoc(){
		let orCountId = this.form.get("OriginCountry").value.country_code_id;
		let destCountId = this.form.get("DestCountry").value.country_code_id;
		let sopId = this.data.sop_id;
		let param = {
			sopDoc: []
		}
		this.docColl.map(doc=>{
			if (this.form.get(doc.control_name).value) {
				let docparam = {
					sop_id: this.data.sop_id,
					doc_id: doc.doc_id,
					origin_country_id: orCountId,
					destination_country_id: destCountId,
					fields: doc.fields
				}
				if (doc.has_child) {
					docparam.fields.map(field=>{
						field.value = this.form.get(field.controlname).value;
					})
				}
				param.sopDoc.push(docparam);
			}
		});
		let result = await this.authService.saveDocs({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.reusable.openAlertMsg("Successfully added the document", "info");
			this.onClose();
		} 
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}
}

/* Company Add/Edit Dialog */
@Component({
	selector: 'company-add-edit',
	templateUrl: 'company-add-edit-dialog.html',
	styleUrls: ['./sop-add-edit.component.css']
})
export class CompanyAddEditDialog implements OnInit {
	form:FormGroup;
	countryColl:ClassCountry[];
	stateColl:ClassState[];
	cityColl:ClassCity[];
	companyTypeColl:ClassLookup[];
	filterCountry: Observable<ClassCountry[]>;
	filterState: Observable<ClassState[]>;
	filterCity: Observable<ClassCity[]>;
	title:string;
	showAddNew:boolean = false;
	companyColl = new MatTableDataSource<ClassSOPCompany>([]);
	dispCompColl = ["select","company_name","address","city_name", "state_name","country_name","zip_code"];
	isAllChecked = false;
	isIntermediate = false;
	// selection = new SelectionModel<classSOPCompany>(true, []);

	constructor(
		public dialogRef: MatDialogRef<CompanyAddEditDialog>,
		@Inject(MAT_DIALOG_DATA) public data:ClassCompany,
		private formBuilder: FormBuilder,
		private authService: AuthenticationService,
		private reusable: ReusableComponent,
	) { }

	ngOnInit(){
		this.createForm();
		this.getCountry();
		this.getState();
		this.getCity();
		this.getCompanyType();
		this.filterCountry = this.form.get("Country").valueChanges
		.pipe(
			startWith(''),
			map(value => typeof value === 'string' || value == undefined? value : value.name),
			map(name => name ? this._filterCountry(name) : this.countryColl)
		);
		this.filterState = this.form.get("State").valueChanges
		.pipe(
			startWith(''),
			map(value => typeof value === 'string' || value == undefined ? value : value.name),
			map(name =>  name ?  this._filterState(name) :this.form.get('Country').value ? this.stateColl.filter(x=>x.country_id==this.form.get('Country').value.id):[])
		);
		this.filterCity = this.form.get("City").valueChanges
		.pipe(
			startWith(''),
			map(value => typeof value === 'string' || value == undefined ? value : value.name),
			map(name => name ? this._filterCity(name) :this.form.get('State').value ? this.cityColl != undefined? this.cityColl.filter(x=>x.state_id==this.form.get('State').value.id):[]:[])
		);
		if (this.data.company_id == undefined) this.title = "Add New Company";
		else {
			this.title = "Edit Company (id:"+this.data.company_id+")";
		}
	}	

	private _filterCountry(name: string): ClassCountry[] {
		const filterValue = name.toLowerCase();
		return this.countryColl.filter(option => option.name.toLowerCase().indexOf(filterValue) >= 0);
	}

	private _filterState(name: string): ClassState[] {
		const filterValue = name.toLowerCase();
		let stColl = this.stateColl.filter(option => option.name.toLowerCase().indexOf(filterValue) >= 0 && option.country_id == this.form.get('Country').value.id);
		return stColl;
	}

	private _filterCity(name: string): ClassCity[] {
		if (name!=undefined){
			const filterValue = name!=undefined ? name.toLowerCase() : '';
			return this.cityColl.filter(option => option.name.toLowerCase().indexOf(filterValue) >= 0 && option.state_id == this.form.get('State').value.id);
		}
	}

	dispCountry(val:ClassCountry): string {
		return val && val.name ? val.name : '';
	}

	dispState(val:ClassState): string {
		return val && val.name ? val.name : '';
	}

	dispCity(val:ClassCity): string {
		return val && val.name ? val.name : '';
	}

	applyCompFilter(event: Event, dataSource) {
		const filterValue = (event.target as HTMLInputElement).value;
		dataSource.filter = filterValue.trim().toLowerCase();
	}

	isAllSelected() {
		const numSelected = this.companyColl.data.filter(x=>x["is_selected"]).length;
		const numRows = this.companyColl.data.length;
		if (numSelected === numRows) {
			this.isAllChecked = true;
			this.isIntermediate = false;
		}
		else if (numSelected == 0) {
			this.isAllChecked = false;
			this.isIntermediate = false;
		}
		else {
			this.isAllChecked = false;
			this.isIntermediate = true;
		}
	}

	checkUncheckAll(checked){
		if (!checked){
			this.companyColl.data.forEach(row => {row["is_selected"] = false;})
		}
		else {
			this.companyColl.data.forEach(row => {row["is_selected"] = true;})
		}
		this.isAllSelected();
	}

	onCompType(compType){
		this.getAllCompForSOP(compType.lookup_name);
	}

	async getAllCompForSOP(companyType:string){
		let param = {
			sop_id: this.data.sop_id,
			company_type: companyType
		}
		let result = await this.authService.getAllCompForSOP({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.companyColl = new MatTableDataSource(result.result);
			this.isAllSelected();
		} 
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	createForm() {
		this.form = this.formBuilder.group({
			CompanyType: [this.data.company_type,Validators.compose([
				Validators.required,
			])],
			CompanyName:[this.data.company_name,Validators.compose([
				Validators.required,
			])],
			Address:[this.data.address,Validators.compose([
				Validators.required,
			])],
			Country:[this.data.country,Validators.compose([
				Validators.required,
			])],
			State:[this.data.state,Validators.compose([
				Validators.required,
			])],
			City:[this.data.city],
			ZipCode:[this.data.zip_code],
		});
	}

	onClose(res){
		this.dialogRef.close(res);
	}
	
	getErrorMessage(control, controlName) {
		let msg ='';
		msg += control.hasError('required') ? controlName + ' is Mandatory' :'';
		return msg;
	}

	async getCountry(){
		let result = await this.authService.getCountryLookup();
		if (result.success){
			this.countryColl = result.result;
			if (this.data.country != undefined){
				let filter = this.countryColl.filter(x=>x.id == this.data.country.id);
				this.form.get("Country").setValue(filter[0]);
			}
		} 
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async getState(){
		let result = await this.authService.getStateLookup();
		if (result.success){
			this.stateColl = result.result;
			if (this.data.state != undefined){
				let filter = this.stateColl.filter(x=>x.id == this.data.state.id);
				this.form.get("State").setValue(filter[0]);
			}
		} 
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async getCity(){
		let result = await this.authService.getCityLookup();
		if (result.success){
			this.cityColl = result.result;
			if (this.data.city != undefined){
				if (this.data.city.id != null){
					let filter = this.cityColl.filter(x=>x.id == this.data.city.id);
					this.form.get("City").setValue(filter[0]);
				}
				else {
					this.form.get("City").setValue(this.data.city.name)
				}
			}
		} 
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async getCompanyType(){
		let result = await this.authService.getCompanyTypeLookup();
		if (result.success){
			this.companyTypeColl = result.result;
			if (this.data.company_type != undefined){
				let cType = this.companyTypeColl.filter(x=>x.lookup_name_id == this.data.company_type.lookup_name_id);
				this.form.get("CompanyType").setValue(cType[0]);
				// this.onCompType(cType[0]);
				this.showAddNew = true;
			}
		} 
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	onChangeAdd(selVal){
		if (selVal=="AN") this.showAddNew = true;
		else this.showAddNew = false;
	}

	async saveAllCompany(action){
		let removedCompanies = this.companyColl.data.filter(x => !x['is_selected'] && x.sop_company_id != undefined);
		let addedCompanies = this.companyColl.data.filter(x => x['is_selected'] && x.sop_company_id == undefined);
		let removedCompanyIds = [];
		let addedCompanyIds = [];
		let rmCompany = false;
		if (removedCompanies.length > 0) {
			let conf = confirm("On removing the company, all contacts pertaining to this company will also be removed. Please reconfirm");
			if (conf){
				rmCompany = true;
				removedCompanies.map(row => {
					removedCompanyIds.push(row.company_id);
				});
			}
			else return;
		}
		addedCompanies.map(row => {
			addedCompanyIds.push(row.company_id);
		});
		let param = {
			sop_id: this.data.sop_id,
			removedCompanyIds: removedCompanyIds,
			addedCompanyIds: addedCompanyIds
		}
		let result = await this.authService.addRemoveSOPCompanies({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.reusable.openAlertMsg("Successfully added the selected companies","info");
		} 
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
		if (action=="close"){
			this.form.reset();
			this.onClose(true);
		}
	}

	async saveCompany(action){
		let city = undefined;
		if (this.form.get("City").value == undefined) city = undefined;
		else city = this.form.get("City").value.id;
		let param = {
			sop_id: this.data.sop_id,
			sop_company_id: this.data.sop_company_id,
			company_id: this.data.company_id,
			company_name: this.form.get("CompanyName").value,
			company_type_id: this.form.get("CompanyType").value.lookup_name_id,
			address: this.form.get("Address").value,
			city: typeof this.form.get("City").value == "string" ? this.form.get("City").value : null,
			city_id: city,
			state_id: this.form.get("State").value.id,
			country_id: this.form.get("Country").value.id,
			zip_code: this.form.get("ZipCode").value
		};
		let result = await this.authService.insUpdCompany({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.reusable.openAlertMsg(result.message,"info");
		} 
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
		if (action=="close"){
			this.form.reset();
			this.onClose(true);
		}
		else {
			this.form.get("CompanyName").reset();
			this.form.get("CompanyType").reset();
			this.form.get("Address").reset();
			this.form.get("City").reset();
			this.form.get("State").reset();
			this.form.get("Country").reset();
			this.form.get("ZipCode").reset();
		}
	}
}

/* Cargo Handling Edit Dialog for a content inside a group */
@Component({
	selector: 'ch-sop-edit',
	templateUrl: 'ch-sop-edit-dialog.html',
	styleUrls: ['./sop-add-edit.component.css']
})
export class ChSopEditDialog implements OnInit {
	objectKeys = Object.keys;
	objectValues = Object.values;
	form:FormGroup;
	dispForm = false;

	constructor(
		public dialogRef: MatDialogRef<ChSopEditDialog>,
		@Inject(MAT_DIALOG_DATA) public data:ClassSOPCh,
		private formBuilder: FormBuilder,
		private authService: AuthenticationService,
		private reusable: ReusableComponent,
	) { }

	ngOnInit(){
		let fields = this.data.fields;
		let fg = {};
		if (this.data.template == 'template2'){
			fields.map(field => {
				let flds = field.fields;
				if (flds != undefined){
					flds.map(fld=>{
						let chFields = field[fld].field;
						chFields.map(chField=>{
							fg[chField.controlname] = new FormControl(chField.value);
							if (chField.range != undefined && field[fld].type != "radio"){
								fg[chField.controlname].setValidators([Validators.required, Validators.min(chField.range[0]), Validators.max(chField.range[1])]);
							}
							if (chField.child != undefined && chField.child.length > 0) {
								let chch = chField.child;
								chch.map(chch=>{
									let chchFields = chch.field;
									chchFields.map(chchField=>{
										fg[chchField.controlname] = new FormControl(chchField.value);
										if (chchField.range != undefined){
											fg[chchField.controlname].setValidators([Validators.required, Validators.min(chchField.range[0]), Validators.max(chchField.range[1])]);
										}
									})
								});
							}
							if (field[fld].type == "radio"){
								if (chField.options != undefined && chField.options.indexOf(chField.value) == -1) {
									fg[chField.controlname] =  new FormControl(null);
									fg[chField.controlname+"Others"] =  new FormControl(null);
									setTimeout(() => {
										fg[chField.controlname].setValue("Others");
										fg[chField.controlname+"Others"].setValue(chField.value.replace(/[a-zA-Z ]*/g,""));
										if (chField.range != undefined){
											fg[chField.controlname+"Others"].setValidators([Validators.required,Validators.min(chField.range[0]),Validators.max(chField.range[1])]);
										}
									}, 100);
								}
								else {
									fg[chField.controlname] =  new FormControl(null);
									fg[chField.controlname+"Others"] =  new FormControl(null);
									setTimeout(() => {
										fg[chField.controlname].setValue(chField.value);
										if (chField.range != undefined){
											fg[chField.controlname+"Others"].setValidators([Validators.required,Validators.min(chField.range[0]),Validators.max(chField.range[1])]);
										}
									}, 100);
								}
								if (this.data.view_text != undefined) this.data.disp_text = this.data.disp_text.replace('$$'+chField.controlname+'$$',chField.value);
							}
						})
					})
				}
			})
		}
		else {
			this.data.fields.map(field =>{
				fg[field.controlname] =  new FormControl(field.value);
				if (this.data.view_text != undefined) this.data.disp_text = this.data.disp_text.replace('$$'+field.controlname+'$$',field.value);
			});
		}
		this.form = new FormGroup(fg);
		this.dispForm = true;
	}

	onClose(){
		this.dialogRef.close(this.data);
	}

	async chSopSave(){
		let fields = this.data.fields;
		let fg = {};
		if (this.data.template == 'template2'){
			fields.map(field => {
				let flds = field.fields;
				if (flds != undefined){
					flds.map(fld=>{
						let chFields = field[fld].field;
						chFields.map(chField=>{
							chField.value = this.form.get(chField.controlname).value;
							if (chField.child != undefined && chField.child.length > 0) {
								let chch = chField.child;
								chch.map(chch=>{
									let chchFields = chch.field;
									chchFields.map(chchField=>{
										chchField.value = this.form.get(chchField.controlname).value
									})
								});
							}
							if (field[fld].type == 'radio'){
								if (this.form.get(chField.controlname).value != "Others"){
									chField.value = this.form.get(chField.controlname).value
									if (this.data.view_text != undefined) this.data.disp_text = this.data.disp_text.replace('$$'+chField.controlname+'$$',chField.value);
								} 
								else {
									chField.value = this.form.get(chField.controlname+"Others").value + chField.Others.replace("$$val$$", '');
									if (this.data.view_text != undefined) this.data.disp_text = this.data.disp_text.replace('$$'+chField.controlname+'$$',chField.value);
								}
							}
						})
					})
				}
			})
		}
		else {
			this.data.disp_text = this.data.view_text;
			this.data.fields.map(field =>{
				field.value = this.form.get(field.controlname).value
				if (this.data.view_text != undefined) this.data.disp_text = this.data.disp_text.replace('$$'+field.controlname+'$$',field.value);
			});
		}
		let param = {
			fields : JSON.stringify(this.data.fields),
			sop_ch_id: this.data.sop_ch_id
		};

		let result = await this.authService.updSOPCHfields({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.reusable.openAlertMsg('Updated Successfully', "info");
			this.onClose();
		} 
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}
	
	getErrorMessage(control, controlName) {
		let msg = '';
		msg += control.hasError('required') ? 'You must enter a value' : '';
		msg += (control.errors.min) ? 'Must be >='+control.errors.min.min : '';
		msg += (control.errors.max) ? 'Must be <= '+control.errors.max.max : '';
		return msg;
	}
}

/* Carrier Allocation Add/Edit between ports */
@Component({
	selector: 'carrier-add-edit',
	templateUrl: 'carrier-add-edit-dialog.html',
	styleUrls: ['./sop-add-edit.component.css']
})
export class CarrierAddEditDialog implements OnInit {
	portColl:ClassPorts[] = [];
	destPortColl:ClassPorts[] = [];
	carrierColl:ClassCompany[] = [];
	form:FormGroup;
	filterPortOP: Observable<ClassPorts[]>;
	filterPortDP: Observable<ClassPorts[]>;
	errMsg ='';
	totalPercent100 = false;
	originalSCAIds = [];

	constructor(
		public dialogRef: MatDialogRef<CarrierAddEditDialog>,
		@Inject(MAT_DIALOG_DATA) public data:any,
		private formBuilder: FormBuilder,
		private authService: AuthenticationService,
		private reusable: ReusableComponent,
	) { }

	ngOnInit(){
		this.getPorts();
		this.getCarrier();
		this.createForm();
		this.filterPortOP = this.form.get("FilterOP").valueChanges
		.pipe(
			startWith(''),
			map(value => typeof value === 'string' ? value : value != undefined ? value.portwithregion : ''),
			map(name => name ? this._filter(name) : this.portColl)
		);
	}

	clearCarrierAllocations(){
		let len = this.carrierAlloc.controls.length
		for (let i = len-1; i>=0; i--){
			this.removeCarrierAlloc(i);
		}
	}
	async getSOPCarrierAllocation(){
		this.clearCarrierAllocations();
		let param = {
			sop_id: this.data.sop_id,
			origin_port_id: this.form.get("OriginPort").value.port_id,
			dest_port_id: this.form.get("DestPort").value.port_id
		}
		let result = await this.authService.getSOPCarrierAllocByPort({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.data.data = result.result;
			this.data.data.map(row=>{
				this.originalSCAIds.push(row.sca_id);
				let carrier = this.carrierColl.filter(x=>x.company_id == row.carrier_id)[0];
				this.addCarrierAlloc(row,carrier);
			});
			if (this.data.data.length == 0){
				this.addContract();
			}
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	private _filter(portName: string): ClassPorts[] {
		const filterValue = portName.toLowerCase();
		return this.portColl.filter(option => option.portwithregion.toLowerCase().indexOf(filterValue) >= 0);
	}

	private _filterDP(portName: string): ClassPorts[] {
		const filterValue = portName.toLowerCase();
		return this.destPortColl.filter(option => option.portwithregion.toLowerCase().indexOf(filterValue) >= 0);
	}

	onSelOP(){
		this.destPortColl = this.portColl.filter(x=>x.country != this.form.get("OriginPort").value.country);
		if (this.data.data.length > 0){
			let dPort = this.destPortColl.filter(x =>x.port_id == this.data.data[0].dest_port_id);
			this.form.get("DestPort").setValue(dPort[0]);
		}
		if (this.filterPortDP != undefined) this.filterPortDP = undefined;
		this.filterPortDP = this.form.get("FilterDP").valueChanges
		.pipe(
			startWith(''),
			map(value => typeof value === 'string' ? value : value != undefined ? value.portwithregion : ''),
			map(name => name ? this._filterDP(name) : this.destPortColl)
		);
		if (this.form.get("DestPort").value != undefined){
			this.onSelDP();
		}
	}

	onSelDP(){
		if (this.form.get("OriginPort").value != undefined && this.form.get("DestPort").value != undefined){
			this.getSOPCarrierAllocation();
		}
	}

	async getPorts(){
		let result = await this.authService.getPorts();
		if (result.success){
			this.portColl = result.result;
			this.form.get('FilterOP').setValue('');
			this.form.get('FilterDP').setValue('');
			if (this.data.data.length > 0){
				let oPort = this.portColl.filter(x =>x.port_id == this.data.data[0].origin_port_id);
				this.form.get("OriginPort").setValue(oPort[0]);
			}
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error")
		}
	}

	async getCarrier(){
		let result = await this.authService.getCarrier();
		if (result.success){
			let res = await this.authService.getFF();
			if (res.success){
				let cons = res.result.concat(result.result);
				this.carrierColl = cons;
			}
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error")
		}
	}

	createForm() {
		this.form = this.formBuilder.group({
			OriginPort:[null,Validators.compose([
				Validators.required,
			])],
			DestPort:[null,Validators.compose([
				Validators.required,
			])],
			CarrierAlloc:this.formBuilder.array([]),
			FilterOP:[null],
			FilterDP:[null]
		});
	}

	get carrierAlloc(){
		return this.form.get('CarrierAlloc') as FormArray;
	}
	
	getCarrierAllocArrControls(){
		return (this.form.get('CarrierAlloc') as FormArray).controls;
	}
	
	addCarrierAlloc(row, carrier){
		this.carrierAlloc.push(this.formBuilder.group({
			Carrier: [carrier, Validators.compose([
				Validators.required,
			])],
			AllocationPercent: [row.allocation_percent, Validators.compose([
				Validators.required,
			])],
			ContractNumber: [row.contract_number, Validators.compose([
				Validators.required,
			])],
			SCAId:[row.sca_id]
		}));
	}
	
	removeCarrierAlloc(idx){
		this.carrierAlloc.removeAt(idx);
		this.form.markAsDirty();
	}

	onClose(status){
		this.dialogRef.close(status)
	}

	getErrorMessage(control) {
		let msg = '';
		msg += control.hasError('required') ? 'You must enter a value' : '';
		return msg;
	}

	addContract(){
		this.validateAllocPerct();
		if (this.errMsg.length == 0 && !this.totalPercent100){
			this.addCarrierAlloc({allocation_percent:undefined, contract_number:undefined}, null);
		}
	}

	validateAllocPerct(){
		let valuePercent = 0;
		for (let i = 0; i < this.carrierAlloc.length; i++){
			if (typeof this.carrierAlloc.controls[i].get('AllocationPercent').value != "number" || this.carrierAlloc.controls[i].get('AllocationPercent').value.toString().includes('e')) {
				this.errMsg = "Invalid data in Allocation Percent";
				this.totalPercent100 = false;
				return;
			}
			valuePercent += this.carrierAlloc.controls[i].get('AllocationPercent').value;
			if (valuePercent > 100){
				this.errMsg = "Allocation percentage must not exceed 100";
				this.totalPercent100 = false;
				return;
			}
			else {
				this.errMsg = ''
				if (valuePercent == 100){
					this.totalPercent100 = true;
				}
				else {
					this.totalPercent100 = false;
				}
			}
		}
	}

	async saveSOPCarrierAllocation(){
		this.validateAllocPerct();
		if (!this.totalPercent100) return;
		let insData = [];
		let updData = [];
		let removedIds = [];
		let curSCAIds = []
		for (let i = 0; i< this.carrierAlloc.length; i++){
			if (this.carrierAlloc.controls[i].get('AllocationPercent').value != 0){
				let scaId = this.carrierAlloc.controls[i].get('SCAId').value;
				if (scaId != undefined) {
					curSCAIds.push(scaId);
					updData.push({
						sca_id: scaId,
						carrier_id: this.carrierAlloc.controls[i].get('Carrier').value.company_id,
						contract_number: this.carrierAlloc.controls[i].get('ContractNumber').value,
						allocation_percent: this.carrierAlloc.controls[i].get('AllocationPercent').value
					})
				}
				else {
					insData.push({
						sop_id: this.data.sop_id,
						origin_port_id: this.form.get("OriginPort").value.port_id,
						dest_port_id: this.form.get("DestPort").value.port_id,
						carrier_id: this.carrierAlloc.controls[i].get('Carrier').value.company_id,
						contract_number: this.carrierAlloc.controls[i].get('ContractNumber').value,
						allocation_percent: this.carrierAlloc.controls[i].get('AllocationPercent').value
					});
				}
			}
		}
		removedIds = this.originalSCAIds.filter(x => curSCAIds.indexOf(x)==-1);
		let msg = ''
		if (removedIds.length > 0){
			let param = {
				removedIds: removedIds
			};
			let result = await this.authService.removeSOPCarrierAlloc({param:this.reusable.encrypt(JSON.stringify(param))});
			if (result.success){
				msg += "Successfully removed SOP Carrier Allocation"
			}
			else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
			}
		}
		if (updData.length > 0){
			let param = {
				data: updData
			};
			let result = await this.authService.updSOPCarrierAlloc({param:this.reusable.encrypt(JSON.stringify(param))});
			if (result.success){
				msg += "Successfully updated SOP Carrier Allocation"
			}
			else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
			}
		}
		if (insData.length > 0){
			let param = {
				data: JSON.stringify(insData)
			};
			let result = await this.authService.insSOPCarrierAlloc({param:this.reusable.encrypt(JSON.stringify(param))});
			if (result.success){
				msg += "Successfully added SOP Carrier Allocation"
			}
			else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
			}
		}
		if (msg.length > 95){
			this.reusable.openAlertMsg("Successfully added/updated/removed SOP carrier Allocation", "info");
			this.onClose(true);
		}
		else if (msg.length > 46 && msg.length < 95) {
			if (msg.includes("removed") && msg.includes("updated"))
				this.reusable.openAlertMsg("Successfully updated/removed SOP carrier Allocation", "info");
			else if (msg.includes("removed") && msg.includes("added"))
				this.reusable.openAlertMsg("Successfully added/removed SOP carrier Allocation", "info");
			else
				this.reusable.openAlertMsg("Successfully added/updated SOP carrier Allocation", "info");
			this.onClose(true);
		}
		else if (msg.length>0 && msg.length <= 46){
			this.reusable.openAlertMsg(msg, "info");
			this.onClose(true);
		}
	}
}

/* Copy SOP Dialog */
@Component({
	selector: 'copy-sop',
	templateUrl: 'copy-sop-dialog.html',
	styleUrls: ['./sop-add-edit.component.css']
})
export class CopySopDialog implements OnInit {
	userDetails:any;
	isLoading: boolean = false;
	sopColl = new MatTableDataSource([]);
	dispSop = ["sop_id","status","valid_from", "valid_to", "copy"];
	isSopComp = '';
	isSopCot = '';
	isSopCotPort = '';
	isSopDocs = '';
	isSopPOB = '';
	isSopCH = '';
	isSopCtain = '';
	isSopCA = '';
	isSopCP = '';
	constructor(
		public dialogRef: MatDialogRef<CopySopDialog>,
		private authService: AuthenticationService,
		private reusable: ReusableComponent,
		@Inject(MAT_DIALOG_DATA) public data:any,
	) {}

	ngOnInit(){
		this.getSopId();
	}

	async getSopId(){
		let param = {
			principal_id: this.data.principal_id,
			ff_id: this.data.ff_id,
		}
		let result = await this.authService.getSOPId({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			let sops = result.result.filter(x=>x.sop_id != this.data.sop_id);
			this.sopColl = new MatTableDataSource(sops);
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	onClose(status){
		this.dialogRef.close(status)
	}

	copySop(selSop){
		let param = {
			from_sop_id: selSop.sop_id,
			to_sop_id: this.data.sop_id
		}
		let enParam = this.reusable.encrypt(JSON.stringify(param));
		this.copySOPCompany(enParam);
		this.copySOPContact(enParam);
		this.copySOPDocs(enParam);
		this.copySOPPOBooking(enParam);
		this.copySOPCargoHandling(enParam);
		this.copySOPContainer(enParam);
		this.copySOPCarrierAlloc(enParam);
		this.copySOPCarrierPref(enParam);
	}

	async copySOPCarrierPref(enParam){
		let result = await this.authService.copySOPCarrierPref({param:enParam});
		if (result.success){
			this.isSopCP = "Success";
		}
		else {
			this.isSopCP = "Failed With Msg:"+result.message; 
		}
	}

	async copySOPCarrierAlloc(enParam){
		let result = await this.authService.copySOPCarrierAlloc({param:enParam});
		if (result.success){
			this.isSopCA = "Success";
		}
		else {
			this.isSopCA = "Failed With Msg:"+result.message; 
		}
	}

	async copySOPContainer(enParam){
		let result = await this.authService.copySOPContainer({param:enParam});
		if (result.success){
			this.isSopCtain = "Success";
		}
		else {
			this.isSopCtain = "Failed With Msg:"+result.message; 
		}
	}

	async copySOPCargoHandling(enParam){
		let result = await this.authService.copySOPCargoHandling({param:enParam});
		if (result.success){
			this.isSopCH = "Success";
		}
		else {
			this.isSopCH = "Failed With Msg:"+result.message; 
		}
	}

	async copySOPPOBooking(enParam){
		let result = await this.authService.copySOPPOBooking({param:enParam});
		if (result.success){
			this.isSopPOB = "Success";
		}
		else {
			this.isSopPOB = "Failed With Msg:"+result.message; 
		}
	}

	async copySOPDocs(enParam){
		let result = await this.authService.copySOPDocs({param:enParam});
		if (result.success){
			this.isSopDocs = "Success";
		}
		else {
			this.isSopDocs = "Failed With Msg:"+result.message; 
		}
	}

	async copySOPCompany(enParam){
		let result = await this.authService.copySOPCompany({param:enParam});
		if (result.success){
			if (result.rowCount > 0) this.isSopComp = "Success";
			else this.isSopComp = "No Rows";
		}
		else {
			this.isSopComp = "Failed With Msg:"+result.message; 
		}
	}

	async copySOPContact(enParam){
		let result = await this.authService.copySOPContact({param:enParam});
		if (result.success){
			this.isSopCot = "Success";
			let res = await this.authService.copySOPContactPort({param:enParam});
			if (res.success){
				if (res.rowCount > 0) this.isSopCotPort = "Success";
				else this.isSopCotPort = "No Rows";
			} else {
				this.isSopCotPort = "Failed With Msg:"+res.message;
			}
		}
		else {
			this.isSopCot = "Failed With Msg:"+result.message; 
		}
	}

}

/* Carrier Preference Add/Edit between ports */
@Component({
	selector: 'carrier-pref-add-edit',
	templateUrl: 'carrier-pref-add-edit-dialog.html',
	styleUrls: ['./sop-add-edit.component.css']
})
export class CarrierPrefAddEditDialog implements OnInit {
	portColl:ClassPorts[] = [];
	destPortColl:ClassPorts[] = [];
	carrierColl = new MatTableDataSource([]);
	sopCarrierPrefColl = new MatTableDataSource([]);
	form:FormGroup;
	filterPortOP: Observable<ClassPorts[]>;
	filterPortDP: Observable<ClassPorts[]>;
	errMsg ='';
	originalSCPIds = [];
	tblDispCarrier = ["carrier_name"]
	tblDispSOPCarrierPref = ["carrier_name", "contract_number", "preference", "edit"];

	constructor(
		public dialogRef: MatDialogRef<CarrierPrefAddEditDialog>,
		@Inject(MAT_DIALOG_DATA) public data:any,
		private formBuilder: FormBuilder,
		private authService: AuthenticationService,
		private reusable: ReusableComponent,
	) { }

	ngOnInit(){
		this.getPorts();
		// this.getCarrier();
		this.createForm();
		this.filterPortOP = this.form.get("FilterOP").valueChanges
		.pipe(
			startWith(''),
			map(value => typeof value === 'string' ? value : value != undefined ? value.portwithregion : ''),
			map(name => name ? this._filter(name) : this.portColl)
		);
	}

	async getSOPCarrierPreference(){
		let param = {
			sop_id: this.data.sop_id,
			origin_port_id: this.form.get("OriginPort").value.port_id,
			dest_port_id: this.form.get("DestPort").value.port_id
		}
		let result = await this.authService.getSOPCarrierPrefByPort({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.data.data = result.result;
			this.data.data.map(row=>{
				if (row.scp_id != undefined) this.originalSCPIds.push(row.scp_id);
				row["edit_mode"] = false;

			});
			this.carrierColl = new MatTableDataSource(result.result.filter(x=>x.scp_id == undefined));
			this.sopCarrierPrefColl = new MatTableDataSource(result.result.filter(x=>x.scp_id != undefined));
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	private _filter(portName: string): ClassPorts[] {
		const filterValue = portName.toLowerCase();
		return this.portColl.filter(option => option.portwithregion.toLowerCase().indexOf(filterValue) >= 0);
	}

	private _filterDP(portName: string): ClassPorts[] {
		const filterValue = portName.toLowerCase();
		return this.destPortColl.filter(option => option.portwithregion.toLowerCase().indexOf(filterValue) >= 0);
	}

	onSelOP(){
		this.destPortColl = this.portColl.filter(x=>x.country != this.form.get("OriginPort").value.country);
		if (this.data.data.length > 0){
			let dPort = this.destPortColl.filter(x =>x.port_id == this.data.data[0].dest_port_id);
			this.form.get("DestPort").setValue(dPort[0]);
		}
		if (this.filterPortDP != undefined) this.filterPortDP = undefined;
		this.filterPortDP = this.form.get("FilterDP").valueChanges
		.pipe(
			startWith(''),
			map(value => typeof value === 'string' ? value : value != undefined ? value.portwithregion : ''),
			map(name => name ? this._filterDP(name) : this.destPortColl)
		);
		if (this.form.get("DestPort").value != undefined){
			this.onSelDP();
		}
	}

	onSelDP(){
		if (this.form.get("OriginPort").value != undefined && this.form.get("DestPort").value != undefined){
			this.getSOPCarrierPreference();
		}
	}

	async getPorts(){
		let result = await this.authService.getPorts();
		if (result.success){
			this.portColl = result.result;
			this.form.get('FilterOP').setValue('');
			this.form.get('FilterDP').setValue('');
			if (this.data.data.length > 0){
				let oPort = this.portColl.filter(x =>x.port_id == this.data.data[0].origin_port_id);
				this.form.get("OriginPort").setValue(oPort[0]);
			}
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error")
		}
	}

	createForm() {
		this.form = this.formBuilder.group({
			OriginPort:[null,Validators.compose([
				Validators.required,
			])],
			DestPort:[null,Validators.compose([
				Validators.required,
			])],
			CarrierPref:this.formBuilder.array([]),
			FilterOP:[null],
			FilterDP:[null]
		});
	}

	onClose(status){
		this.dialogRef.close(status)
	}

	getErrorMessage(control) {
		let msg = '';
		msg += control.hasError('required') ? 'You must enter a value' : '';
		return msg;
	}

	applyCarrierFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.carrierColl.filter = filterValue.trim().toLowerCase();
	}

	dragDrop(event: CdkDragDrop<any[]>){
		if (event.previousContainer === event.container) {
			moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
		  } else {
			transferArrayItem(event.previousContainer.data,
							  event.container.data,
							  event.previousIndex,
							  event.currentIndex);
		  }
		  this.carrierColl.data = [...this.carrierColl.data];
		  this.sopCarrierPrefColl.data = [...this.sopCarrierPrefColl.data];
	}

	async saveSOPCarrierPreference(){
		let insData = [];
		let updData = [];
		let removedIds = [];
		let curSCPIds = [];
		let data = this.sopCarrierPrefColl.data;
		data.map((d,idx)=>{
			if (d.scp_id != undefined){
				curSCPIds.push(d.scp_id);
				updData.push({
					scp_id: d.scp_id,
					carrier_id: d.carrier_id,
					contract_number: d.contract_number,
					preference: idx+1
				})
			} 
			else {
				insData.push({
					sop_id: this.data.sop_id,
					origin_port_id: this.form.get("OriginPort").value.port_id,
					dest_port_id: this.form.get("DestPort").value.port_id,
					carrier_id: d.carrier_id,
					contract_number: d.contract_number,
					preference: idx+1
				});

			}
		})
		removedIds = this.originalSCPIds.filter(x => curSCPIds.indexOf(x)==-1);
		let msg = ''
		if (removedIds.length > 0){
			let param = {
				removedIds: removedIds
			};
			let result = await this.authService.removeSOPCarrierPref({param:this.reusable.encrypt(JSON.stringify(param))});
			if (result.success){
				msg += "Successfully removed SOP Carrier Preference"
			}
			else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
			}
		}
		if (updData.length > 0){
			let param = {
				data: updData
			};
			let result = await this.authService.updSOPCarrierPref({param:this.reusable.encrypt(JSON.stringify(param))});
			if (result.success){
				msg += "Successfully updated SOP Carrier Preference"
			}
			else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
			}
		}
		if (insData.length > 0){
			let param = {
				data: JSON.stringify(insData)
			};
			let result = await this.authService.insSOPCarrierPref({param:this.reusable.encrypt(JSON.stringify(param))});
			if (result.success){
				msg += "Successfully added SOP Carrier Preference"
			}
			else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
			}
		}
		if (msg.length > 95){
			this.reusable.openAlertMsg("Successfully added/updated/removed SOP carrier Preference", "info");
			this.onClose(true);
		}
		else if (msg.length > 46 && msg.length < 95) {
			if (msg.includes("removed") && msg.includes("updated"))
				this.reusable.openAlertMsg("Successfully updated/removed SOP carrier Preference", "info");
			else if (msg.includes("removed") && msg.includes("added"))
				this.reusable.openAlertMsg("Successfully added/removed SOP carrier Preference", "info");
			else
				this.reusable.openAlertMsg("Successfully added/updated SOP carrier Preference", "info");
			this.onClose(true);
		}
		else if (msg.length>0 && msg.length <= 46){
			this.reusable.openAlertMsg(msg, "info");
			this.onClose(true);
		}
	}
}

/* Container Preference Edit*/
@Component({
	selector: 'container-pref-edit',
	templateUrl: 'container-pref-edit-dialog.html',
	styleUrls: ['./sop-add-edit.component.css']
})
export class ContainerPrefEditDialog implements OnInit {
	form: FormGroup;
	portColl:ClassPorts[] = [];
	containerPortColl = [];
	filterPort: Observable<ClassPorts[]>;

	constructor(
		public dialogRef: MatDialogRef<ContainerPrefEditDialog>,
		@Inject(MAT_DIALOG_DATA) public data:any,
		private formBuilder: FormBuilder,
		private authService: AuthenticationService,
		private reusable: ReusableComponent,
	) { }

	ngOnInit(){
		this.createForm();
		this.getPorts();
		this.filterPort = this.form.get("FilterP").valueChanges
		.pipe(
			startWith(''),
			map(value => typeof value === 'string' ? value : value != undefined ? value.portwithregion : ''),
			map(name => name ? this._filter(name) : this.portColl)
		);
	}

	private _filter(portName: string): ClassPorts[] {
		const filterValue = portName.toLowerCase();
		return this.portColl.filter(option => option.portwithregion.toLowerCase().indexOf(filterValue) >= 0);
	}

	onClose(){
		this.dialogRef.close();
	}

	onCloseWithReturn(){
		this.dialogRef.close(this.data);
	}

	createForm() {
		this.form = this.formBuilder.group({
			MinCBM: [this.data.min_cbm, Validators.compose([
				Validators.required,
				Validators.min(1)
			])],
			OptimalCBM: [this.data.optimal_cbm, Validators.compose([
				Validators.required,
			])],
			FCLMin:[this.data.fcl_min,Validators.compose([
				Validators.required,
				Validators.min(1)
			])],
			ExceptPort:[[]],
			FilterP:[null],
			MaxCBM: [this.data.max_cbm]
		},
			{validators: this.validateCBM('MinCBM', 'OptimalCBM', 'MaxCBM', 'FCLMin')},
		);
	}

	validateCBM(minCBM, optimalCBM, maxCBM, fclMin){
		return (group: FormGroup) => {
			if (group.controls[minCBM].value > group.controls[maxCBM].value || group.controls[minCBM].value < 1){
				return {'validateMinCBM': true}
			}
			if(group.controls[optimalCBM].value < group.controls[minCBM].value || group.controls[optimalCBM].value > group.controls[maxCBM].value){
				return {'validateOptimalCBM' : true};
			} 
			if (group.controls[fclMin].value < 1 || group.controls[fclMin].value > group.controls[maxCBM].value){
				return {'validateFCLCBM' : true};
			}
			else {
				return null;
			}
		}
	}

	async getPorts(){
		let result = await this.authService.getPorts();
		if (result.success){
			this.portColl = result.result;
			this.form.get('FilterP').setValue(''); //this is used to set the port coll for UI under filterPort observable
			if (this.data.port_id_exception != undefined && this.data.port_id_exception.length > 0){
				let selPortArr = [];
				this.data.port_id_exception.map(cport=>{
					let cp = this.portColl.filter(x=>x.port_id == cport);
					selPortArr.push(cp[0]);
				})
				this.form.get("ExceptPort").setValue(selPortArr);
			}
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	getErrorMessage(control, controlName) {
		let msg ='';
		msg += control.hasError('required') ? controlName+' must have value. ' :'';
		if (controlName =='MinCBM') {msg += (control.errors.min) ? 'Must be between 1 & Max CBM. ': ''}
		if (controlName =='FCLMin') {msg += control.errors.min ? 'Must be between 1 and Max CBM ': ''}
		if (controlName =='form') {msg += control.hasError('validateOptimalCBM') ? 'Optimal CBM must be between Min CBM and Max CBM ':''}
		if (controlName =='form') {msg += control.hasError('validateMinCBM') ? 'Minimum CBM must be less than Max CBM ':''}
		if (controlName =='form') {msg += control.hasError('validateFCLCBM') ? 'FCL Stowage Min must be less than Max CBM ':''}
		return msg;
	}

	save(){
		this.data.min_cbm = this.form.get("MinCBM").value;
		this.data.optimal_cbm = this.form.get("OptimalCBM").value;
		this.data.fcl_min = this.form.get("FCLMin").value;
		this.data.port_id_exception = [];
		this.form.get("ExceptPort").value.map(port=>{
			this.data.port_id_exception.push(port.port_id);
		})
		this.onCloseWithReturn();
	}
}

/* PO Booking Edit Dialog for a content inside a group */
@Component({
	selector: 'pob-sop-edit',
	templateUrl: 'pob-sop-edit-dialog.html',
	styleUrls: ['./sop-add-edit.component.css']
})
export class POBSopEditDialog implements OnInit {
	objectKeys = Object.keys;
	objectValues = Object.values;
	form:FormGroup;
	dispForm = false;

	constructor(
		public dialogRef: MatDialogRef<POBSopEditDialog>,
		@Inject(MAT_DIALOG_DATA) public data:ClassSOPPOB,
		private formBuilder: FormBuilder,
		private authService: AuthenticationService,
		private reusable: ReusableComponent,
	) { }

	ngOnInit(){
		this.createForm();
	}

	onClose(){
		this.dialogRef.close(this.data);
	}

	async pobSopSave(){
		let fields = this.data.fields;
		if (this.data.template == 'template2'){
			fields.map(field => {
				let flds = field.fields;
				if (flds != undefined){
					flds.map(fld=>{
						let chFields = field[fld].field;
						chFields.map(chField=>{
							chField.value = this.form.get(chField.controlname).value;
							if (chField.child != undefined && chField.child.length > 0) {
								let chch = chField.child;
								chch.map(chch=>{
									let chchFields = chch.field;
									chchFields.map(chchField=>{
										chchField.value = this.form.get(chchField.controlname).value
									})
								});
							}
							if (field[fld].type == 'radio'){
								if (this.form.get(chField.controlname).value != "Others"){
									chField.value = this.form.get(chField.controlname).value
									if (this.data.view_text != undefined) this.data.disp_text = this.data.disp_text.replace('$$'+chField.controlname+'$$',chField.value);
								} 
								else {
									chField.value = this.form.get(chField.controlname+"Others").value + chField.Others.replace("$$val$$", '');
									if (this.data.view_text != undefined) this.data.disp_text = this.data.disp_text.replace('$$'+chField.controlname+'$$',chField.value);
								}
							}
						})
					})
				}
			})
		}
		else {
			this.data.disp_text = this.data.view_text;
			this.data.fields.map(field =>{
				if (this.form.get(field.controlname).value != "Others"){
					field.value = this.form.get(field.controlname).value
					if (this.data.view_text != undefined) this.data.disp_text = this.data.disp_text.replace('$$'+field.controlname+'$$',field.value);
				} 
				else {
					field.value = this.form.get(field.controlname+"Others").value + field.Others.replace("$$val$$", '');
					if (this.data.view_text != undefined) this.data.disp_text = this.data.disp_text.replace('$$'+field.controlname+'$$',field.value);
				}

			});
		}
		let param = {
			fields : JSON.stringify(this.data.fields),
			sop_pob_id: this.data.sop_pob_id
		};
		let result = await this.authService.updSOPPOBfields({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.reusable.openAlertMsg('Updated Successfully', "info");
			this.onClose();
		} 
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	createForm(){
		let fields = this.data.fields;
		let fg = {};
		if (this.data.template == 'template2'){
			fields.map(field => {
				let flds = field.fields;
				if (flds != undefined){
					flds.map(fld=>{
						let chFields = field[fld].field;
						chFields.map(chField=>{
							fg[chField.controlname] = new FormControl(chField.value);
							if (chField.range != undefined && field[fld].type != "radio"){
								fg[chField.controlname].setValidators([Validators.required, Validators.min(chField.range[0]), Validators.max(chField.range[1])]);
							}
							if (chField.child != undefined && chField.child.length > 0) {
								let chch = chField.child;
								chch.map(chch=>{
									let chchFields = chch.field;
									chchFields.map(chchField=>{
										fg[chchField.controlname] = new FormControl(chchField.value);
										if (chchField.range != undefined){
											fg[chchField.controlname].setValidators([Validators.required, Validators.min(chchField.range[0]), Validators.max(chchField.range[1])]);
										}
			
									})
								});
							}
							if (field[fld].type == "radio"){
								if (chField.options != undefined && chField.options.indexOf(chField.value) == -1) {
									fg[chField.controlname] =  new FormControl(null);
									fg[chField.controlname+"Others"] =  new FormControl(null);
									setTimeout(() => {
										fg[chField.controlname].setValue("Others");
										fg[chField.controlname+"Others"].setValue(chField.value.replace(/[a-zA-Z ]*/g,""));
										if (chField.range != undefined){
											fg[chField.controlname+"Others"].setValidators([Validators.required,Validators.min(chField.range[0]),Validators.max(chField.range[1])]);
										}
									}, 100);
								}
								else {
									fg[chField.controlname] =  new FormControl(null);
									fg[chField.controlname+"Others"] =  new FormControl(null);
									setTimeout(() => {
										fg[chField.controlname].setValue(chField.value);
										if (chField.range != undefined){
											fg[chField.controlname+"Others"].setValidators([Validators.required,Validators.min(chField.range[0]),Validators.max(chField.range[1])]);
										}
									}, 100);
								}
								if (this.data.view_text != undefined) this.data.disp_text = this.data.disp_text.replace('$$'+chField.controlname+'$$',chField.value);
							}
						})
					})
				}
			})
		}
		else {
			//ExpressionChangedAfterItHasBeenCheckedError  to avoid this error
			this.data.fields.map(field =>{
				if (field.options != undefined && field.options.indexOf(field.value) == -1) {
					fg[field.controlname] =  new FormControl(null);
					fg[field.controlname+"Others"] =  new FormControl(null);
					setTimeout(() => {
						fg[field.controlname].setValue("Others");
						fg[field.controlname+"Others"].setValue(field.value.replace(/[a-zA-Z ]*/g,""));
					}, 100);
				}
				else {
					fg[field.controlname] =  new FormControl(null);
					fg[field.controlname+"Others"] =  new FormControl(null);
					setTimeout(() => {
						fg[field.controlname].setValue(field.value);
					}, 100);
				}
				if (this.data.view_text != undefined) this.data.disp_text = this.data.disp_text.replace('$$'+field.controlname+'$$',field.value);
			});
		}
		this.form = new FormGroup(fg);
		this.dispForm = true;
	}

	getErrorMessage(control, controlName) {
		let msg = '';
		msg += control.hasError('required') ? 'You must enter a value' : '';
		msg += (control.errors.min) ? 'Must be >='+control.errors.min.min : '';
		msg += (control.errors.max) ? 'Must be <= '+control.errors.max.max : '';
		return msg;
	}

}
