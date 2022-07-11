import { SopLandingComponent } from './../sop-landing/sop-landing.component';
import { ConfirmDialog } from './../../reusable/reusable.component';
import { Component, OnInit, Inject, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, Validators, FormControl, FormBuilder, FormArray } from '@angular/forms';
import { AuthenticationService } from '../../_services/index';
import { ReusableComponent } from '../../reusable/reusable.component';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDropList } from '@angular/cdk/drag-drop';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ClassCompany, ClassPorts, ClassSOPContainer, TblGroup } from '../sop-global-class';

export interface ServiceChargeClass {
	sop_port_id: number,
	sop_id: number,
	origin_port_id: number,
	orgin_port: string,
	origin_country: string,
	charge_items: number,
	dest_port_id: number,
	dest_port: string,
	dest_port_country: string,
	is_selected: boolean,
}

export interface ChargeItemClass {
	sop_service_charge_id: number,
	sop_port_id: number,
	service_charge_id: number,
	currency_name: any,
	currency_id: number,
	uom: number,
	unit_rate: number,
	sop_id: number,
	is_selected: boolean,
	charge_item_id: number,
	charge_item_name: string,
	charge_description: string,
	edit: boolean,
	is_valid: boolean,
}

export interface SOPPortClass {
	sop_port_id: number,
	sop_id: number,
	principal_id: number,
	ff_id: number,
	origin_port_id: number,
	orgin_port: string,
	origin_country_id: number,
	origin_country_name: string,
	charge_items: number,
	dest_port_id: number,
	dest_port: string,
	dest_country_id: number,
	dest_country_name: string,
	created_by: number,
	is_allocated: boolean,
	is_selected: boolean,
}

@Component({
	selector: 'sop-service-charge',
	templateUrl: 'sop-service-charge.html',
	styleUrls: ['./sop-service-charge.component.css']
})
export class SopServiceChargeComponent implements OnInit {
	objectKeys = Object.keys;
	objectValues = Object.values;
	isLoading: boolean = false;
	permissionDenied: boolean = false;
	isDataLoading = false;
	userDetails: any;
	sop: any;
	screen: { width: number; height: number; };
	serviceChGrp = [];
	serviceChGrpParam = {};
	sopSSCColl = new MatTableDataSource<ServiceChargeClass>([]);
	sopSSCCollCopy = new MatTableDataSource([]);
	dispSSCColl = ["origin_country", "origin_port", "dest_country", "dest_port", "charge_items", "edit"];
	sscGrp: any;
	sscharge: any;
	chargeItemColl = new MatTableDataSource<ChargeItemClass>([]);
	dataChargeItemSort = new BehaviorSubject<ChargeItemClass[]>([]);
	dispChargeItem = ["charge_item_name", "uom", "currency_name", "unit_rate", "charge_description"];
	//dispChargeItem = ["charge_item_name","charge_description","currency_name","uom", "unit_rate","edit"];
	currencyColl = [];
	ChargeUomColl = [];
	selTabIndex = 0;
	showSearch = false;
	showSearchClicked: boolean = false;
	autoFocus = false;
	UpdatedCount;
	title = "Service Charges";
	ht: number;
	width: number;
	currency_symbol: string;
	firstChargeItem = [];
	currentActiveCard;
	currentActiveCardData = [];
	seletedSopChargeIdIndex: number = 0;
	seletedSopChargeId: number;
	seletedPortPairId: number;
	portPairNotAvailable: boolean = false;
	isSearchEmpty: boolean = false;
	//check
	incTemplate = 'template2';
	incSOPColl = [];
	schGrpParam = {};
	schGrpTitle: string;
	schTemplete: string = 'template2';
	SCHSOPPortColl = new MatTableDataSource<SOPPortClass>([]);
	isInstruction: boolean = false;
	pageStartTime: Date;
	pageCurrentUrl: string;
	accessibleSections = [];
	isAccessibleSection = {};
	accessibleEvents = [];
	isAccessibleEvents = [];
	selServiceChGrp;
	selServiceChGrpId: number;
	selportPair = {};

	@ViewChild(MatSort, { static: false }) sort: MatSort;
	@ViewChild('table') table: MatTableDataSource<ClassSOPContainer>;

	@HostListener('click', ['$event.target']) onClick() {
		this.isInstruction = false;
	}
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
		this.reusable.curRoute.next("/nav/sop");
		this.reusable.headHt.next(60);
		this.reusable.screenChange.subscribe(res => {
			this.screen = { width: res.width - 112, height: res.height - 140 };
			this.ht = res['height'] - 160;
			this.width = res["width"] - 112;
		});
		this.getServiceChargeGroup();
		this.getCurrency();
		this.getChargeUom();
	}

	ngOnDestroy() {
		this.authService.savePageAccess(this.pageStartTime, new Date(), this.pageCurrentUrl, 'Sop-Service-Charge');
	}

	@ViewChild('chargesearch', { static: false }) 
	set input(element: ElementRef<HTMLInputElement>) {
		if(element) {
			element.nativeElement.focus()
     	}
  	}

	private compare(a, b, isAsc) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

	onSortChargeItems(sort) {
		this.isDataLoading = true;
		let data = this.chargeItemColl.data.slice();
		if(sort.active && sort.direction != '') {
			data = data.sort((a,b) => {
                const isAsc = sort.direction === 'asc';
                switch (sort.active) {
                    case 'charge_item_name': return this.compare(a.charge_item_name, b.charge_item_name, isAsc);
                    default: return 0;
                }
            });
		}
		this.dataChargeItemSort.next(data);
		this.chargeItemColl = new MatTableDataSource<ChargeItemClass>(this.dataChargeItemSort.value);
		this.isDataLoading = false;
	}

	applyschPortFilter(event) {
		const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
		this.SCHSOPPortColl.filter = filterValue.trim().toLowerCase();
		if (filterValue == '') {
			this.SCHSOPPortColl.filteredData = this.SCHSOPPortColl.data;
			this.portPairNotAvailable = false;
		}
		if (event.key == 'Escape') {
			(event.target as HTMLInputElement).value = '';
			this.SCHSOPPortColl.filteredData = this.SCHSOPPortColl.data;
		}
		if (this.SCHSOPPortColl.filteredData.length == 0) {
			this.portPairNotAvailable = true;
		}
	}
	
	applychargeItemFilter(event) {
		if(event.key == 'Escape'){
			(event.target as HTMLInputElement).value = '';
		}
		const filterValue = (event.target as HTMLInputElement).value;
		this.chargeItemColl.filter = filterValue.trim().toLowerCase();
	}

	async getEventsSubModulesWise(){
		this.isLoading = true;
		let param = {
			company_id : this.sop.principal_id,
			sub_module_name : 'Service Charges',
			// sub_module_name : this.router.url.replace('/nav/soplanding/sop', '')
		}
		let result = await this.authService.getEventsSubModulesWise({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.accessibleSections.length == 0 ? this.permissionDenied = true : this.permissionDenied = false;
			if(result.result[0].event_descriptions && result.result[0].section_names){
				this.accessibleSections = result.result[0].section_names;
				this.accessibleEvents = result.result[0].event_descriptions;
			}
			this.accessibleSections.map((res) =>{
				this.isAccessibleSection[res.section_name.replaceAll('_',' ')] = res.status;
			})
			this.accessibleEvents.map((res)=>{
				this.isAccessibleEvents.push(res.event_description.toLowerCase());
			})
			let index = 0;
			for (let idx in this.serviceChGrp){
				let data = this.accessibleSections.filter(value => value.section_name.replaceAll('_',' ') == this.serviceChGrp[idx].display_name);
				if(data.length>0){
					index = parseInt(idx);
					break;
				}
			}
			this.onClickSCHGrp(index,this.serviceChGrp[index].display_name);
			this.isLoading = false;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async getChargeUom() {
		let result = await this.authService.getChargeUom();
		if (result.success) {
			this.ChargeUomColl = result.result;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async getCurrency() {
		let result = await this.authService.getCurrency();
		if (result.success) {
			this.currencyColl = result.result;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async getServiceChargeGroup() {
		this.isLoading = true;
		let result = await this.authService.getServiceChargeGroup();
		if (result.success) {
			this.serviceChGrp = result.result;
			let inv = {
				"lookup_type": "invoicing_and_payments",
				"display_name": "Invoicing and Payments",
				"lookup_type_id": null
			}
			this.serviceChGrp.push(inv);
			this.serviceChGrp.map((grp, i) => {
				this.schGrpParam[i] = { color: "var(--lightgray)", disp: false, fw: "normal", isClicked: false };
			});
			this.getEventsSubModulesWise();
			this.onClickSCHGrp(0, this.serviceChGrp[0].display_name);
			this.isLoading = false;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async onClickSCHGrp(idx, grp) {
		this.selServiceChGrp = grp;
		this.selServiceChGrpId = this.serviceChGrp[idx].lookup_type_id;
		this.serviceChGrp.map((group, ix) => {
			if (idx == ix) {
				this.schGrpParam[idx] = { color: "var(--active)", disp: true, fw: 600, isClicked: true };
				// this.cmTemplete = this.serviceChGrp[idx].html_template;
				this.schGrpTitle = grp;
			} else {
				if (this.schGrpParam[ix]["disp"] || this.schGrpParam[ix]["isClicked"]) this.schGrpParam[ix] = { color: "var(--green)", disp: false, fw: "normal", isClicked: true };
				else {
					this.schGrpParam[ix]["color"] = "var(--lightgray)";
					this.schGrpParam[ix]["disp"] = false;
					this.schGrpParam[ix]["fw"] = "normal";
				}
			}
		});
		if(grp == 'Invoicing and Payments'){
			this.checkCreateInvForSOP();
		} else {
			this.getSOPPortForServiceCh();
			this.seletedSopChargeId = this.serviceChGrp[idx].lookup_type_id;
		}
	}
	
	async getSOPPortForServiceCh() {
		let param = {
			sop_id: this.sop.sop_id,
		}
		let result = await this.authService.getSopPortList({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			if(result.rowCount > 0){
				result.result.map((x => {
					x.is_selected = false
				}));
				this.SCHSOPPortColl = new MatTableDataSource<SOPPortClass>(result.result);
				this.onClickPortPair(this.SCHSOPPortColl.data[0]);
			} else {
				this.dialog.open(ConfirmDialog, {
					data: {
						type: 'add-port-info',
						content: "You have not selected any Port pair for this SOP, carrier Allocation requires the same",
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
	}

	async getSOPSchInvForGroup(){
    	let param = {
			sop_id : this.sop.sop_id
		}
		let result = await this.authService.getSOPSchInvForGroup({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			result.result.map((inv)=>{
				if (this.isAccessibleEvents.some(v => v.includes(inv.invoice_name.toLowerCase()))) {
					inv['is_enable'] = true;
				} 
				else{
					inv['is_enable'] = false;
				}
				inv.expand = inv.is_enable ? inv.is_selected : !inv.is_selected;;
			})
			this.incSOPColl = result.result;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async checkCreateInvForSOP(){
		let param = {
			sop_id : this.sop.sop_id,
		}
		let result = await this.authService.checkCreateInvForSOP({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.getSOPSchInvForGroup();
		} 
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async updCHFieldValue(idx, field, grid){
		let param = {
			fields : JSON.stringify(grid.fields),
			ssi_id: grid.ssi_id
		};
		let result = await this.authService.updSOPSchInvfields({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			field["status"] = "Update Successful";
		} 
		else {
			field["status"] = "Update Failed";
		}
		setTimeout(() => {
			field["status"] = undefined;
		}, 1500);
	}

	changeActiveCard() {
		this.SCHSOPPortColl.data.map((ele) => {
			ele.is_selected = false;
			if (ele.sop_port_id == this.currentActiveCard) {
				ele.is_selected = true;
			}
		})
	}

	async onClickPortPair(selRow) {
		this.selportPair = selRow;
		this.isDataLoading = true;
		this.chargeItemColl = new MatTableDataSource([]);
		this.currentActiveCard = selRow != null ? selRow.sop_port_id : this.currentActiveCard;
		this.changeActiveCard();
		this.seletedPortPairId = selRow != null ? selRow.sop_port_id : this.seletedPortPairId;
		let param = {
			sop_id: this.sop.sop_id,
			service_charge_id: this.seletedSopChargeId,
			sop_port_id: this.seletedPortPairId
		}
		let result = await this.authService.getSOPServiceChargeItemByPortPair(param);
		if (result.success) {
			result.result.map(row => {
				row["currency_name"] = this.currencyColl.filter(x => x.lookup_name_id == row.currency_id)[0];
				if (row.currency_name == undefined && row.unit_rate == null && row.uom == null) {
					row.is_valid = false;
					row.uom = this.ChargeUomColl[0].lookup_name_id;
					row.currency_name = this.currencyColl[0];
					row.unit_rate = 0;
				} else {
					row.is_valid = true;
				}
			})
			this.chargeItemColl = new MatTableDataSource<ChargeItemClass>(result.result);
			this.isDataLoading = false;
			this.chargeItemColl.sort = this.sort;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async copyDataServiceCharges() {
		let dialogWidth = 380;
		let dialogHeight = 420;
		const dialogRef = this.dialog.open(CopyData, {
			width: dialogWidth + 'px',
			height: dialogHeight + 'px',
			data: { sop_id : this.sop.sop_id ,dialog_width: dialogWidth, dialog_height: dialogHeight, sel_servicech_grp: this.selServiceChGrp, sel_port_pair: this.seletedPortPairId, sel_port_pair_det: this.selportPair, charge_items: this.chargeItemColl.data , sel_service_charge_id: this.selServiceChGrpId}
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				
			}
		});
	}

	//Not used on 11/15/2021
	async onClickSSCGrp_old(idx, grp) {
		grp["mode"] = "grid";
		grp["index"] = idx;
		this.isLoading = true;
		this.serviceChGrp.map((group, ix) => {
			if (idx == ix) {
				this.serviceChGrpParam[idx] = { color: "var(--active)", disp: true, fw: 600, isClicked: true };
				this.sscGrp = grp;
			} else {
				group["mode"] = "grid";
				group["index"] = ix;
				if (this.serviceChGrpParam[ix]["disp"] || this.serviceChGrpParam[ix]["isClicked"]) {
					this.serviceChGrpParam[ix] = { color: "var(--green)", disp: false, fw: "normal", isClicked: true };
				}
				else {
					this.serviceChGrpParam[ix]["color"] = "var(--lightgray)";
					this.serviceChGrpParam[ix]["disp"] = false;
					this.serviceChGrpParam[ix]["fw"] = "normal";
				}
			}
		});
		let param = {
			service_charge_id: grp.lookup_type_id,
			sop_id: this.sop.sop_id
		};
		let result = await this.authService.getSOPServiceChargeSummary(param);
		if (result.success) {
			this.sopSSCColl = new MatTableDataSource(result.result);
			this.sopSSCColl.sort = this.sort;
			this.sopSSCColl.data.forEach((ele) => {
				ele.is_selected = false;
			})
			this.isLoading = false;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	//not is use at 11/16/2021
	async onClickSchTab() {
		this.isLoading = true;
		if (this.sop.sop_id != null && this.seletedSopChargeId != null && this.seletedPortPairId != null) {
			let param = {
				sop_id: this.sop.sop_id,
				service_charge_id: this.seletedSopChargeId,
				sop_port_id: this.seletedPortPairId
			}
			let result = await this.authService.getSOPServiceChargeItemByPortPair(param);
			if (result.success) {
				result.result.map(row => {
					row["currency_name"] = this.currencyColl.filter(x => x.lookup_name_id == row.currency_id)[0];
				})
				this.chargeItemColl = new MatTableDataSource(result.result);
				this.chargeItemColl.sort = this.sort;
				this.chargeItemColl.data.map((ele) => {
					if (ele.currency_name == undefined && ele.unit_rate == null && ele.uom == null) {
						ele.is_valid = false;
					} else {
						ele.is_valid = true;
					}
				})
				this.isLoading = false;
			}
			else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
			}
		}
	}

	//not in use at 11/16/2021
	async mapChargeItem(selRow) {
		//this
		this.currentActiveCard = selRow.sop_port_id;
		this.changeActiveCard();
		this.sscGrp["mode"] = "edit";
		this.sscharge = selRow;
		let param = {
			sop_id: this.sop.sop_id,
			service_charge_id: this.sscGrp.lookup_type_id,
			sop_port_id: selRow.sop_port_id
		}
		let result = await this.authService.getSOPServiceChargeItemByGroup(param);
		if (result.success) {
			this.sscGrp["mode"] = "edit";
			result.result.map(row => {
				row["currency_name"] = this.currencyColl.filter(x => x.lookup_name_id == row.currency_id)[0];
			})
			this.chargeItemColl = new MatTableDataSource(result.result);
			this.chargeItemColl.sort = this.sort;
			this.chargeItemColl.data.forEach((ele) => {
				if (ele.currency_name == undefined && ele.unit_rate == null && ele.uom == null) {
					ele.is_valid = false;
				} else {
					ele.is_valid = true;
				}
			})
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	//not is use at 11/16/2021
	async mapChargeItem_old(selRow) {
		this.sscGrp["mode"] = "edit";
		this.sscharge = selRow;
		let param = {
			sop_id: this.sop.sop_id,
			service_charge_id: this.sscGrp.lookup_type_id,
			sop_port_id: selRow.sop_port_id
		}
		let result = await this.authService.getSOPServiceChargeItemByGroup(param);
		if (result.success) {
			this.sscGrp["mode"] = "edit";
			result.result.map(row => {
				row["currency_name"] = this.currencyColl.filter(x => x.lookup_name_id == row.currency_id)[0];
			})
			this.chargeItemColl = new MatTableDataSource(result.result);
			this.chargeItemColl.sort = this.sort;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	//working
	async updateChargeItem(element) {
		if (element.is_valid == false) {
			// && element.unit_rate != null && element.uom != null
			if (element.currency_name == undefined && element.uom == null && element.unit_rate != null) {
				element["cur_err"] = "Mandatory Field";
				element["uom_err"] = "Mandatory Field";
				element["ur_err"] = null;
			} else if (element.currency_name == undefined && element.uom != null && element.unit_rate == null) {
				element["cur_err"] = "Mandatory Field";
				element["uom_err"] = null;
				element["ur_err"] = "Mandatory Field";
			} else if (element.currency_name != undefined && element.uom == null && element.unit_rate == null) {
				element["cur_err"] = null;
				element["uom_err"] = "Mandatory Field";
				element["ur_err"] = "Mandatory Field";
			} else if (element.currency_name == undefined && element.uom != null && element.unit_rate != null) {
				element["cur_err"] = "Mandatory Field";
				element["uom_err"] = null;
				element["ur_err"] = null;
			} else if (element.currency_name != undefined && element.uom == null && element.unit_rate != null) {
				element["cur_err"] = null;
				element["uom_err"] = "Mandatory Field";
				element["ur_err"] = null;
			} else if (element.currency_name != undefined && element.uom != null && element.unit_rate == null) {
				element["cur_err"] = null;
				element["uom_err"] = null;
				element["ur_err_color"] = "warn";
				element["ur_err"] = "Mandatory Field";
			}
		}
		this.saveChargeItem(element);
	}

	//working
	async saveChargeItem(element) {
		console.log('first',element.unit_rate)
		if (element.currency_name != undefined && element.unit_rate != null && element.uom != null && element.unit_rate >= 0) {
			element["cur_err"] = null;
			element["uom_err"] = null;
			element["ur_err"] = null;
			element["ur_err_color"] = "primary";
			element.is_valid == true;
			if (element.sop_service_charge_id == undefined){// || element.sop_service_charge_id == null) {
				let param = {
					charge_item_id: element.charge_item_id,
					currency_id: element.currency_name.lookup_name_id,
					service_charge_id: element.service_charge_id,
					sop_id: this.sop.sop_id,
					sop_port_id: this.seletedPortPairId,
					unit_rate: element.unit_rate,
					uom: element.uom
				};
				let result = await this.authService.insSOPServiceCharge(param);
				if (result.success) {
					element["update"] = "Updated successfully";
					element.sop_service_charge_id = result.result[0].sop_service_charge_id;
					setTimeout(() => {
						element["update"] = undefined;
					}, 1500);
				} else {
					element["update_f"] = "Updation failed try again";
					setTimeout(() => {
						element["update_f"] = undefined;
					}, 500);
					console.log('creation failed')
				}
			} else {
				let param = {
					sop_service_charge_id: element.sop_service_charge_id,
					charge_description: element.charge_description,
					currency_id: element.currency_name.lookup_name_id,
					sop_port_id: this.seletedPortPairId,
					unit_rate: element.unit_rate,
					uom: element.uom
				};
				let result = await this.authService.updSOPServiceCharge(param);
				if (result.success) {
					element["update"] = "Updated successfully";
					setTimeout(() => {
						element["update"] = undefined;
					}, 1500);
				} else {
					element["update_f"] = "Updation failed try again";
					setTimeout(() => {
						element["update_f"] = undefined;
					}, 500);
					console.log('updation failed')
				}
			}
		} else {
			if(element.unit_rate == null){
				element["ur_err"] = "Invalid";
				element.is_valid == false;
			} 
		}
	}

	//not in use at 11/16/2021
	async saveChargeItem_old(element) {
		if (element.currency_name == undefined) {
			element["cur_err"] = "Mandatory Field";
		}
		else {
			element["cur_err"] = undefined;
		}
		if (element.uom == undefined) {
			element["uom_err"] = "Mandatory Field";
		}
		else {
			element["uom_err"] = undefined;
		}
		if (element.unit_rate == undefined) {
			element["ur_err"] = "Mandatory Field";
		}
		else {
			element["ur_err"] = undefined;
		}
		if (element.cur_err != undefined || element.uom_err != undefined || element.ur_err != undefined) {
			return;
		}
		if (element.sop_service_charge_id == undefined) {
			let param = {
				charge_item_id: element.charge_item_id,
				charge_description: element.charge_description,
				currency_id: element.currency_name.lookup_name_id,
				service_charge_id: element.service_charge_id,
				sop_id: this.sop.sop_id,
				sop_port_id: this.sscharge.sop_port_id,
				unit_rate: element.unit_rate,
				uom: element.uom
			};
			let result = await this.authService.insSOPServiceCharge(param);
			if (result.success) {
				element["edit"] = false;
				element.sop_service_charge_id = result.result[0].sop_service_charge_id;
				this.sscharge.charge_items = Number(this.sscharge.charge_items) + 1;
			}
			else {
				element["cur_err"] = "Add Failed";
			}
		}
		else {
			let param = {
				sop_service_charge_id: element.sop_service_charge_id,
				charge_description: element.charge_description,
				currency_id: element.currency_name.lookup_name_id,
				sop_port_id: this.sscharge.sop_port_id,
				unit_rate: element.unit_rate,
				uom: element.uom
			};
			let result = await this.authService.updSOPServiceCharge(param);
			if (result.success) {
				element["edit"] = false;
			}
			else {
				element["cur_err"] = "Update Failed";
			}
		}
	}

	//not in use at 11/16/2021
	async delSOPServiceCharge(element) {
		let conf = confirm("Are you sure you want to delete this service charge item?");
		if (!conf) return;
		let param = {
			sop_service_charge_id: element.sop_service_charge_id,
		}
		let result = await this.authService.delSOPServiceCharge(param);
		if (result.success) {
			element.sop_service_charge_id = undefined;
			element.charge_description = undefined;
			element.currency_name = undefined;
			element.unit_rate = undefined;
			element.uom = undefined;
			element.currency_id = undefined;
			this.sscharge.charge_items = Number(this.sscharge.charge_items) - 1;
		}
		else {
			element["cur_err"] = "Delete Failed";
		}

	}
}

@Component({
	selector: 'copy-data-dialog',
	templateUrl: './copy-data-dialog.html',
	styleUrls: ['./sop-service-charge.component.css'],
})

export class CopyData implements OnInit {
	isLoading: boolean;
	ht: number;
	width: number;
	copyDataForm: FormGroup;
	userDetails;
	inviteCompanyVal: any; parentCompanyVal: any; companyTypeList: any;
	modulesVal: any;
	modulesList: any;
	title: String;
	btnTitle: String;
	emailExists: boolean; invitee_user_id: any; invitee_company_id: any;
	userCompanyList: any;
	inviteCompanyTypeList: any;
	portPairColl = new MatTableDataSource([]);
	isSuccessLoading: boolean = false;
	dataCopied: boolean = false;

	constructor(
		private reusable: ReusableComponent,
		private formBuilder: FormBuilder,
		private authService: AuthenticationService,
		public dialogRef: MatDialogRef<CopyData>,
		private router: Router,
		@Inject(MAT_DIALOG_DATA) public data: CopyData,
		public dialog: MatDialog,
	) { }

	ngOnInit() {
		this.ht = this.data['dialog_height'];
		this.width = this.data['dialog_width'];
		console.log('data',this.data)
		this.isLoading = true;
		this.createForm();
		this.getPortPairList();
	}

	createForm() {
		this.copyDataForm = this.formBuilder.group({
			CopyFrom: ['', Validators.compose([
				Validators.required,
			])],
			CopyTo: [ { value: [] , disabled: true }, Validators.compose([
				Validators.required,
			])]
		})
	}

	getErrorMessage(control, controlName) {
		let msg = '';
		if (controlName == 'CopyFrom') { msg += control.hasError('required') ? 'copy from port pair is Mandatory' : '' }
    	if (controlName == 'CopyTo') { msg += control.hasError('required') ? 'copy to port pair is Mandatory' : '' }
		return msg;
	}

	async getPortPairList() {
		let param = {
			sop_id : this.data['sop_id'],
		}
		let portRes = await this.authService.getSopPortList({ param: this.reusable.encrypt(JSON.stringify(param))});
		if(portRes.success && portRes.rowCount > 0) {
			this.portPairColl = new MatTableDataSource(portRes.result);
			let filter = this.portPairColl.data.filter(val => val.sop_port_id == this.data['sel_port_pair']);
			this.copyDataForm.get('CopyFrom').setValue(filter[0]);
			this.copyDataForm.get('CopyFrom').disable();
			this.onChangeCopyFrom();
		}
	}

	onChangeCopyFrom() {
		this.copyDataForm.get('CopyTo').reset();
		this.copyDataForm.get('CopyTo').enable();
		let data =  this.portPairColl.data.filter(val => val.sop_port_id != this.copyDataForm.get('CopyFrom').value.sop_port_id );
		this.portPairColl.filteredData = data;
	}

	onChangeCopyTo(event) {
		console.log('first',this.copyDataForm)
	}

	async saveCopyData(){
		let param = {
			copy_from_portpair: this.copyDataForm.get('CopyFrom').value.sop_port_id,
			copy_to_portpairs: this.copyDataForm.get('CopyTo').value,
			service_charge_id: this.data['sel_service_charge_id'],
			sop_id: this.data['sop_id'],
			sop_port_id: this.data['sel_port_pair'],
		}
		this.isSuccessLoading = true;
		let copydata = await this.authService.copyDataforServiceCharges({ param: this.reusable.encrypt(JSON.stringify(param))});
		if(copydata.success && copydata.rowCount > 0) {
			this.ht = this.ht - 50;
			this.dialogRef.updateSize(this.width + 'px', this.ht - 50 + 'px');
			this.isSuccessLoading = false;
			this.dataCopied = true;
		}

	}
	
	closeCopyData(){
		
	}
}