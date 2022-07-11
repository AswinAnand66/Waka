import { ConfirmDialog } from './../../reusable/reusable.component';
import { SopLandingComponent } from '../sop-landing/sop-landing.component';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, Validators, FormControl, FormBuilder } from '@angular/forms';
import { AuthenticationService } from '../../_services/index';
import { ReusableComponent } from '../../reusable/reusable.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClassContactPort, ClassCountryCode, ClassDoc, ClassPorts, ClassSOPCompany, ClassSOPContact, ClassSOPDocAddEdit } from '../sop-global-class';
import { MatSelect } from '@angular/material/select';


export interface DocumentPortClass {
	sop_port_id: number,
	sop_id: number,
	docs_count: number,
	origin_country: string,
	dest_country: string,
	is_selected: boolean,
	is_completed: boolean,
	sop_port_ids: any,
}

@Component({
	selector: 'sop-docs',
	templateUrl: 'sop-docs.html',
	styleUrls: ['./sop-docs.component.css']
})
export class SopDocsComponent implements OnInit {
	objectKeys = Object.keys;
	objectValues = Object.values;
	isLoading: boolean = false;
	permissionDenied: boolean = false;
	userDetails: any;
	sop: any;
	screen: { width: number; height: number; };

	ht: number;
	width: number;
	docTemplate = 'template2';
	docSOPColl = [];
	title = 'Documents List';
	docGrpColl = [];
	docGovt = [];
	docComm = [];
	docShip = [];
	docDisp = [];

	selTabIndex = 0;
	selSopPortIds: any;
	CountryNotAvailable: boolean;
	sopDocPortColl = new MatTableDataSource<DocumentPortClass>([]);
	orginalSopDocPortColl = [];
	originCountryColl = [];
	destCountryColl = [];
	sopDoc: ClassSOPDocAddEdit;
	sopDocColl = [];
	docColl: ClassDoc[];
	sopDocCard = [];
	countryCodeColl: ClassCountryCode[];
	principalContactColl: ClassSOPContact[] = [];
	principalContactColl1 = [];
	vendorContactColl: ClassSOPContact[] = [];
	ffContactColl: ClassSOPContact[] = [];
	ffContactColl1 = [];
	shipperContactColl: ClassSOPContact[] = [];
	carrierContactColl: ClassSOPContact[] = [];
	sopCompanyColl: ClassSOPCompany[] = [];
	pageStartTime: Date;
	pageCurrentUrl: string;
	accessibleSections = [];
	isAccessibleSection = {};
	accessibleEvents = [];
	isAccessibleEvents = [];
	isEventDisable: boolean = true;

	constructor(
		private authService: AuthenticationService,
		private SopLanding: SopLandingComponent,
		private reusable: ReusableComponent,
		private router: Router,
		private formBuilder: FormBuilder,
		public dialog: MatDialog,
	) { }

	ngOnInit() {
		this.pageStartTime = new Date();
		this.pageCurrentUrl = this.router.url;
		this.userDetails = ReusableComponent.usr;
		if (sessionStorage.getItem("sop")) {
			this.sop = JSON.parse(this.reusable.decrypt(sessionStorage.getItem("sop")));
			this.sop["validFrom"] = new Date(this.sop.valid_from);
			this.sop["validTo"] = new Date(this.sop.valid_to);
		}
		else {
			this.router.navigate(['/nav/sop']);
		}
		if (this.sop == undefined) this.reusable.titleHeader.next("Standard Operating Procedure");
		else {
			this.reusable.titleHeader.next("Edit Standard Operating Procedure (" + this.sop.sop_id + ")");
		}
		this.reusable.headHt.next(60);
		this.reusable.screenChange.subscribe(res => {
			this.screen = { width: res.width - 112, height: res.height - 140 };
			this.ht = res['height'] - 160;
			this.width = res["width"] - 112;
		});
		this.getConsigneeContacts();
		this.getFFContacts();
		this.getSopPortCountryWiseList();
	}

	ngOnDestroy() {
		this.authService.savePageAccess(this.pageStartTime, new Date(), this.pageCurrentUrl, 'Sop-Document');
	}

	async getEventsSubModulesWise(){
		this.isLoading = true;
		let param = {
			company_id : this.sop.principal_id,
			sub_module_name : 'Documents',
			// sub_module_name : this.router.url.replace('/nav/soplanding/sop', '')
		}
		let result = await this.authService.getEventsSubModulesWise({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.accessibleSections.length == 0 ? this.permissionDenied = true : this.permissionDenied = false;
			if(result.result[0].event_descriptions && result.result[0].section_names){
				this.accessibleSections = result.result[0].section_names;
				this.isEventDisable = false;
				this.accessibleEvents = result.result[0].event_descriptions;
			}
			this.accessibleSections.map((res) =>{
				this.isAccessibleSection[res.section_name.replaceAll('_',' ')] = res.status;
			})
			this.accessibleEvents.map((res)=>{
				this.isAccessibleEvents.push(res.event_description.toLowerCase());
			});
			let index = 0;
			for (let idx in this.docGrpColl){
				let data = this.accessibleSections.filter(value => value.section_name.replaceAll('_',' ') == this.docGrpColl[idx].grp);
				if(data.length>0){
					index = parseInt(idx);
					break;
				}
			}
			this.isLoading = false;
			this.selTabIndex = index;
			this.onClickDocGrp(index);
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	applyCountryFilter(event) {
		const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
		let orginalData = new MatTableDataSource<DocumentPortClass>(this.orginalSopDocPortColl);
		orginalData.filter = filterValue.trim();
		this.sopDocPortColl = new MatTableDataSource<DocumentPortClass>(orginalData.filteredData);
		if (filterValue == '') {
			this.CountryNotAvailable = false;
			this.sopDocPortColl = new MatTableDataSource<DocumentPortClass>(this.orginalSopDocPortColl);
		}
		if (event.key == 'Escape') {
			(event.target as HTMLInputElement).value = '';
			this.sopDocPortColl = new MatTableDataSource<DocumentPortClass>(this.orginalSopDocPortColl);
			this.CountryNotAvailable = false;
		}
		if (this.sopDocPortColl.data.length == 0) {
			this.CountryNotAvailable = true;
		}
	}

	async getConsigneeContacts() {
		let param = {
			sop_id: this.sop.sop_id
		}
		let result = await this.authService.getSOPConsigneeContacts({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			this.principalContactColl1 = result.result;
		}
	}

	async getFFContacts() {
		let param = {
			sop_id: this.sop.sop_id
		}
		let result = await this.authService.getSOPFFContacts({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			this.ffContactColl1 = result.result;
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	selectedChange(value, chField, grid) {
		if (chField.child[0].field[0].value.find(val => val.contact_invite_id == value.contact_invite_id) == undefined) {
			chField.child[0].field[0].value.push(value);
			this.updDocFieldValue(0, chField, grid);
		}
	}

	async getSopPortCountryWiseList() {
		this.isLoading = true;
		let param = {
			sop_id: this.sop.sop_id
		}
		let result = await this.authService.getSopPortCountryWiseList({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			if (result.rowCount > 0) {
				this.orginalSopDocPortColl = result.result;
				this.sopDocPortColl = new MatTableDataSource<DocumentPortClass>(result.result);
				this.isLoading = false;
				this.selSopPortIds = this.sopDocPortColl.data[0];
				this.sopDocPortColl.data[0].is_selected = true;
				this.checkCreateDocForSOP();
				this.getDocGrp();
			} else {
				this.dialog.open(ConfirmDialog, {
					data: {
						type: 'add-port-info',
						content: "You have not selected any Port pair for this SOP (" + this.sop.sop_id + "), Document requires the same",
					},
					disableClose: true,
				});
				setTimeout(() => {
					this.SopLanding.selTabIndex = 0;
					this.router.navigate(['nav/soplanding/sopstakeholder']);
					this.dialog.closeAll();
				}, 5000);
			}
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async checkCreateDocForSOP() {
		this.isLoading = true;
		let param = {
			sop_id: this.sop.sop_id,
			sop_port_ids: this.selSopPortIds.sop_port_ids
		}
		let result = await this.authService.checkCreateDocForSOP({ param: this.reusable.encrypt(JSON.stringify(param)) });
		this.isLoading = false;
		if (!result.success) {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
		return result;
	}

	async getDocGrp() {
		this.isLoading = true;
		let result = await this.authService.getDocGrp();
		if (result.success) {
			this.docGrpColl = result.result;
			this.isLoading = false;
			this.getEventsSubModulesWise();
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
		this.isLoading = false;
	}

	async onClickPortPair(idx) {
		this.sopDocPortColl.data.map((port) => {
			port['is_selected'] = false;
		});
		this.sopDocPortColl.data[idx].is_selected = true;
		this.selSopPortIds = this.sopDocPortColl.data[idx];
		this.selTabIndex = 0;
		let result = await this.checkCreateDocForSOP();
		if (result.success){
			this.getEventsSubModulesWise();
		}
	}

	async onClickDocGrp(idx) {
		let param = {
			sop_id: this.sop.sop_id,
			grp_seq: this.docGrpColl[idx].grp_seq,
			sop_port_id: this.selSopPortIds.sop_port_ids[0]
		}
		let result = await this.authService.getSOPDocForGroup({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			let resp = result.result;
			resp.map(doc => {
				if (this.isAccessibleEvents.some(v => v.includes(doc.doc_name.toLowerCase() + ' enable') && doc.is_selected != null)) {
					doc['is_enable'] = true;
				}
				else if(this.isAccessibleEvents.some(v => v.includes(doc.doc_name.toLowerCase()) && doc.is_selected == null)){
					doc['is_enable'] = true;
				}
				else{
					doc['is_enable'] = false;
				}
				doc.fields.map(fld =>{
					if(fld.group != ''){
						if (this.isAccessibleEvents.some(v => v.includes(fld.group.toLowerCase()))) {
							fld['is_accessible'] = true;
						} 
						else{
							fld['is_accessible'] = false;
						}
					}
					else{
						fld['is_accessible'] = true;
						fld.field0.field.map(field =>{
						if (this.isAccessibleEvents.some(v => v.includes(field.fieldname.toLowerCase()))) {
							field['is_accessible'] = true;
						} 
						else{
							field['is_accessible'] = false;
						}
					})
					}
				})
				if (doc.view_text != undefined){
					doc.disp_text = doc.view_text;
					doc.fields.map(fld =>{
						fld.fields.map(fldoffld=>{
							fld[fldoffld]["field"].map(actField=>{
								let val = actField.value;
								if (typeof val == 'boolean'){
									val = val ? 'Required': 'Not Required';
								}
								doc.disp_text = doc.disp_text.replace('$$'+actField.controlname+'$$',val==null?'':val);
							})
						})
					});
				}
				if (doc.ui_img_file_name != undefined){
					doc.img_url = "url('../../assets/image/"+doc.ui_img_file_name+"')";
					let split = doc.ui_img_file_name.split('.');
					doc.img_url_grey = "url('../../assets/image/"+split[0]+'_grey.'+split[1]+"')";
				}
				doc.expand = doc.is_enable ? doc.is_selected : !doc.is_selected;
			});
			this.docSOPColl = resp;
			if (idx == 3) {
				this.docSOPColl[1].fields[0].field0.field[0].options = this.principalContactColl1;
				this.docSOPColl[1].fields[0].field0.field[1].options = this.ffContactColl1;
			}
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async updDocFieldValue(idx, field, grid) {
		let param = {
			fields: JSON.stringify(grid.fields),
			sd_id: grid.sd_id
		};
		let result = await this.authService.updDocFieldValue({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			field["status"] = "Update Successful";
		}
		else {
			field["status"] = "Update Failed";
		}
		setTimeout(() => {
			field["status"] = undefined;
		}, 1500);
	}

	async updDocisSelected(grid) {
		grid.is_selected = !grid.is_selected;
		let param = {
			is_selected: grid.is_selected,
			sd_id: grid.sd_id
		};
		let result = await this.authService.updDocisSelected({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			grid.status = "Update Successful";
			setTimeout(() => {
				grid.status = "";
			}, 1500);
		}
		else {
			grid.status = "Update Failed";
			setTimeout(() => {
				grid.status = "";
			}, 1500);
		}
	}

	onClickgridExpand(grididx) {
		this.docSOPColl[grididx].expand = !this.docSOPColl[grididx].expand;
	}

	//file upload
	onFileUpload(event, grid, field, grididx) {
		let g = this.docSOPColl[grididx];
		if(event.target.files[0].type == 'application/pdf' || event.target.files[0].type == 'application/vnd.ms-excel' || event.target.files[0].type == 'text/plain' ) {
			this.docSOPColl.map((ele) => {
				if (ele.sd_id == g.sd_id) {
					ele.fields[0].field0.field[0].child[0].field[0].value.push(event.target.files[0].name);
					this.updDocFieldValue(0, field, g)
				}
				setTimeout(() => {
					field['status'] = undefined;
				}, 1500);
			});
		} else {
			this.reusable.openAlertMsg("Only PDF/Excel/Text format supported", "error");
		}
	}

	changeTab(tabIdx) {
		this.selTabIndex = tabIdx;
		this.onClickDocGrp(tabIdx);
	}

	//not in use at 19/11/2021
	async getSOPDocs() {
		if (this.sop.sop_id == undefined) {
			this.reusable.openAlertMsg("Please complete the Basic to proceed", "info");
			return;
		}
		let param = {
			sop_id: this.sop.sop_id
		}
		let result = await this.authService.getSOPDocs({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			this.sopDocCard = [];
			this.sopDocColl = result.result;
			let consolidateSOPDoc = {};
			this.sopDocColl.map((doc, ix) => {
				let keystring = doc.sop_id.toString() + doc.origin_country_id.toString() + doc.destination_country_id.toString();
				if (consolidateSOPDoc[keystring] == undefined) {
					consolidateSOPDoc[keystring] = { [doc.grp.replace("Documents", "")]: doc.count };
				}
				else {
					consolidateSOPDoc[keystring][doc.grp.replace(" Documents", "")] = doc.count;
				}
				if (ix > 0) {
					let keyprevstring = this.sopDocColl[ix - 1].sop_id.toString() + this.sopDocColl[ix - 1].origin_country_id.toString() + this.sopDocColl[ix - 1].destination_country_id.toString();
					if (keystring != keyprevstring || ix == this.sopDocColl.length - 1) {
						consolidateSOPDoc[keyprevstring]["origin_country_id"] = this.sopDocColl[ix - 1].origin_country_id;
						consolidateSOPDoc[keyprevstring]["dest_country_id"] = this.sopDocColl[ix - 1].destination_country_id;
						consolidateSOPDoc[keyprevstring]["sop_id"] = this.sopDocColl[ix - 1].sop_id;
					}
				}
			});
			let sopKeys = Object.keys(consolidateSOPDoc);
			sopKeys.map(key => {
				let originCountry = this.countryCodeColl.filter(x => x.country_code_id == consolidateSOPDoc[key].origin_country_id)[0];
				let destCountry = this.countryCodeColl.filter(x => x.country_code_id == consolidateSOPDoc[key].dest_country_id)[0];
				let rowKeys = Object.keys(consolidateSOPDoc[key]);
				let row = {};
				rowKeys.map(rowKey => {
					if (rowKey == "origin_country_id") row["origin_country"] = originCountry;
					else if (rowKey == "dest_country_id") row["dest_country"] = destCountry;
					else row[rowKey] = consolidateSOPDoc[key][rowKey];
				})
				this.sopDocCard.push(row);
			})
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	//not in use at 19/11/2021
	async delSOPDoc(doc) {
		let conf = confirm("Are you sure you want to remove this document?");
		if (!conf) return;
		let d = doc[0];
		let param = {
			sop_id: d.sop_id,
			origin_country_id: d.origin_country_id,
			destination_country_id: d.destination_country_id
		}
		let result = await this.authService.delSOPDoc({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			this.reusable.openAlertMsg("Successfully removed the document", "info");
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	//not in use at 19/11/2021
	addDoc() {
		this.sopDoc = { sop_id: this.sop.sop_id, origin_country: null, destination_country: null, grp: null, count: null, principal: this.principalContactColl, shipper: this.shipperContactColl, ff: this.ffContactColl, carrier: this.carrierContactColl, vendor: this.vendorContactColl };
		this.openDocDialog(this.sopDoc);
	}

	//not in use at 19/11/2021
	openDocDialog(sopDoc) {
		const dialogRef = this.dialog.open(DocAddEditDialog, {
			width: '930px',
			data: this.sopDoc
		});
		dialogRef.afterClosed().subscribe(result => {
			this.getSOPDocs();
		});
	}

	//not in use at 19/11/2021
	async getCompanyContacts(company) {
		let param = {
			company_id: company.company_id
		}
		let result = await this.authService.getCompanyContacts({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			if (company.company_type.toLowerCase() == "consignee") {
				this.principalContactColl = result.result;
			}
			else if (company.company_type == "Shipper") {
				this.shipperContactColl = result.result;
			}
			else if (company.company_type == "Freight Forwarder") {
				this.ffContactColl = result.result;
			}
			else if (company.company_type.toLowerCase() != "consignee" && company.company_type != "Shipper" && company.company_type != "Freight Forwarder") {
				this.vendorContactColl = result.result;
			}
		}
	}

	//not in use at 19/11/2021
	async getSOPCompany() {
		let param = {
			sop_id: this.sop.sop_id
		}
		let result = await this.authService.getSOPCompany({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			this.sopCompanyColl = result.result;
			this.sopCompanyColl.map(company => {
				if (company.company_type != "Carrier") {
					this.getCompanyContacts(company);
				}
			})
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}
}

/* Document Add/Edit Dialog */
@Component({
	selector: 'doc-add-edit',
	templateUrl: 'doc-add-edit-dialog.html',
	styleUrls: ['./sop-docs.component.css']
})
export class DocAddEditDialog implements OnInit {
	objectKeys = Object.keys;
	objectValues = Object.values;
	form: FormGroup;
	countryCodeColl: ClassCountryCode[];
	destCountryCodecoll: ClassCountryCode[];
	portColl: ClassPorts[];
	emailValid = false;
	timerCtrlEmail;
	contactPortColl: ClassContactPort[];
	title: string;
	docGrp = {};
	docColl: ClassDoc[];
	contactAll = [];

	constructor(
		public dialogRef: MatDialogRef<DocAddEditDialog>,
		@Inject(MAT_DIALOG_DATA) public data: ClassSOPDocAddEdit,
		private formBuilder: FormBuilder,
		private authService: AuthenticationService,
		private reusable: ReusableComponent,
	) { }

	ngOnInit() {
		this.title = "ADD DOCUMENT SET";
		this.getCountryCode();
		this.getDocs();
		this.contactAll = this.contactAll.concat(this.data.principal).concat(this.data.ff).concat(this.data.shipper).concat(this.data.vendor);
	}

	async getCountryCode() {
		let result = await this.authService.getCountryCode();
		if (result.success) {
			this.countryCodeColl = result.result;
			if (this.data.origin_country != undefined) {
				let originCountry = this.countryCodeColl.filter(x => x.country_code_id == this.data.origin_country.country_code_id);
				this.destCountryCodecoll = this.countryCodeColl.filter(x => x.country_code_id != this.data.origin_country.country_code_id);
				this.form.get("OriginCountry").setValue(originCountry[0]);
				let destCountry = this.destCountryCodecoll.filter(x => x.country_code_id == this.data.destination_country.country_code_id);
				this.form.get("DestCountry").setValue(destCountry[0]);
			}
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	onChangeOriginCountry(selCountry) {
		this.destCountryCodecoll = this.countryCodeColl.filter(x => x.country_code_id != selCountry.country_code_id);
	}

	async getDocs() {
		let result = await this.authService.getDocs();
		if (result.success) {
			this.docColl = result.result;
			let fg = {};
			fg["OriginCountry"] = new FormControl(this.data.origin_country, Validators.compose([Validators.required]));
			fg["DestCountry"] = new FormControl(this.data.destination_country, Validators.compose([Validators.required]));
			this.docColl.map(doc => {
				if (this.docGrp[doc.grp] == undefined) {
					this.docGrp[doc.grp] = {};
					this.docGrp[doc.grp] = { [doc.sub_grp]: [] }
					this.docGrp[doc.grp][doc.sub_grp].push({ docName: doc.doc_name, controlName: doc.control_name, hasChild: doc.has_child, fields: doc.fields, isSelected: true });
					fg[doc.control_name] = new FormControl(true);
					if (doc.has_child) {
						doc.fields.map(field => {
							fg[field.controlname] = new FormControl(field.value, Validators.compose([Validators.required]));
						});
					}
				}
				else if (this.docGrp[doc.grp][doc.sub_grp] == undefined) {
					this.docGrp[doc.grp][doc.sub_grp] = [];
					this.docGrp[doc.grp][doc.sub_grp].push({ docName: doc.doc_name, controlName: doc.control_name, hasChild: doc.has_child, fields: doc.fields, isSelected: true });
					fg[doc.control_name] = new FormControl(true);
					if (doc.has_child) {
						doc.fields.map(field => {
							fg[field.controlname] = new FormControl(field.value, Validators.compose([Validators.required]));
						});
					}
				}
				else {
					this.docGrp[doc.grp][doc.sub_grp].push({ docName: doc.doc_name, controlName: doc.control_name, hasChild: doc.has_child, fields: doc.fields, isSelected: true });
					fg[doc.control_name] = new FormControl(true);
					if (doc.has_child) {
						doc.fields.map(field => {
							fg[field.controlname] = new FormControl(field.value, Validators.compose([Validators.required]));
						});
					}
				}
			});
			this.form = new FormGroup(fg);
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	onClose() {
		this.dialogRef.close();
	}

	onChange(doc, isChecked) {
		doc.isSelected = isChecked;
		if (isChecked) {
			this.form.get(doc.controlName).setValidators([Validators.required]);
			if (doc.hasChild) {
				doc.fields.map(field => {
					this.form.get(field.controlname).setValidators([Validators.required]);
					this.form.get(field.controlname).updateValueAndValidity();
				});
			}
		}
		else {
			this.form.get(doc.controlName).clearValidators();
			if (doc.hasChild) {
				doc.fields.map(field => {
					this.form.get(field.controlname).clearValidators();
					this.form.get(field.controlname).updateValueAndValidity();
				});
			}
		}
	}

	async saveDoc() {
		let orCountId = this.form.get("OriginCountry").value.country_code_id;
		let destCountId = this.form.get("DestCountry").value.country_code_id;
		let sopId = this.data.sop_id;
		let param = {
			sopDoc: []
		}
		this.docColl.map(doc => {
			if (this.form.get(doc.control_name).value) {
				let docparam = {
					sop_id: this.data.sop_id,
					doc_id: doc.doc_id,
					origin_country_id: orCountId,
					destination_country_id: destCountId,
					fields: doc.fields
				}
				if (doc.has_child) {
					docparam.fields.map(field => {
						field.value = this.form.get(field.controlname).value;
					})
				}
				param.sopDoc.push(docparam);
			}
		});
		let result = await this.authService.saveDocs({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			this.reusable.openAlertMsg("Successfully added the document", "info");
			this.onClose();
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}
}
