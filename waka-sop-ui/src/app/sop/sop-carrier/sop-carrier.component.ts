import { SopLandingComponent } from './../sop-landing/sop-landing.component';
import { ConfirmDialog } from './../../reusable/reusable.component';
import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, Validators, FormControl, FormBuilder, FormArray } from '@angular/forms';
import { AuthenticationService } from '../../_services/index';
import { ReusableComponent } from '../../reusable/reusable.component';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDropList } from '@angular/cdk/drag-drop';
import { Observable } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { ClassCompany, ClassPorts, ClassSOPContainer, TblGroup } from '../sop-global-class';
import { DateAdapter } from '@angular/material/core';

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

export interface SOPCarrierPreference {
	contract_id: number,
	stakeholder_type_id: number,
	stakeholder_id: number,
	company_name: string,
	preference: number,
}

@Component({
	selector: 'sop-carrier',
	templateUrl: 'sop-carrier.html',
	styleUrls: ['./sop-carrier.component.css']
})
export class SopCarrierComponent implements OnInit {
	objectKeys = Object.keys;
	objectValues = Object.values;
	isLoading: boolean = false;
	permissionDenied: boolean = false;
	userDetails: any;
	sop: any;
	screen: { width: number; height: number; };
	ht: number;
	width: number;

	sopCarrierAllocColl = [];
	datasource = new MatTableDataSource<any | TblGroup>([]);
	_alldata: any[];
	dispCarrierAllocColumns = ["carrier_name", "contract_number", "allocation_percent"];
	groupByColumns = ["origin_dest_port"];
	validityDateError: string;
	sopCarrierPrefColl = [];
	dispCarrierPrefColumns = ["carrier_name", "contract_number", "preference"];
	carrierColl = [];
	colorCA = "var(--lightgray)";
	dispCA = false;
	fwCA = 'normal;'
	colorCCP = "var(--lightgray)";
	dispCCP = false;
	fwCCP = 'normal;'

	dispWIP: boolean;
	cmGrpParam = {};
	cmGrpColl = [];
	cmTemplete: string = 'template2';
	portPairNotAvailable: boolean;
	sopCarrierPortColl = [];
	CMSOPColl = [];
	CMSOPPortColl = new MatTableDataSource<SOPPortClass>([]);
	crColl = [];
	caColl = [];
	allocatedValuesColl = [];
	cmGrpTitle: string;
	allocatedByList = ['Principal', 'Freight Forwarder'];
	carriers = [];
	allocationTypesList = ['Custom Allocation', 'Uniform Allocation'];
	allocationIntervalsList = [];
	unitOfAllocationList = ["TEU", "Percentage (%)"];
	serviceTypesList = ["Door to Door (DTD)", "Door to Port (DTP)", "Port to Door (PTD)", "Port to Port (PTP)"];
	isPercentage: boolean;
	isPrincipal: boolean;
	isUniform: boolean;
	isContractDetailSelect: boolean;
	principalContactColl = [];
	ffContactColl = [];
	IntervalLastDates = [];
	unitValuesList = [];
	carriersList = [];
	IsSopCarrierReqMsg = false;
	form: FormGroup;
	isForm: boolean = true;
	allocationFormValues;
	selectedSopPortId: number;
	isValid: boolean;
	isEditmode: boolean = false;
	displayColumns;
	carrierIds;
	isAllocatedByChanges: boolean = false;
	isUnitOfAllocationChanges: boolean = false;
	isAllocationIntervalChanges: boolean = false;
	isStartDateChanges: boolean = false;
	isEndDateChanges: boolean = false;
	isAllocationTypeChanges: boolean = false;
	isServiceTypeChanges: boolean = false;
	isCarrierValueChanges: boolean = false;
	isInsUpdate: boolean = false;
	selectedCarriers = [];
	displayColumnsCarrier = [];
	carrierIdsRows = [];
	inputMinRange = 0;
	inputMaxRange = 100;
	intervalType: string;
	sopCaId: number;
	carrierPrefIds = [];
	allocatedTEUSum = [];
	IntervalWeekNumbers = [];
	pageStartTime: Date;
	pageCurrentUrl: string;
	expandButtonTitle: string = 'Collapse All';
	accessibleSections = [];
	isAccessibleSection = {};
	accessibleEvents = [];
	isAccessibleEvents = [];

	@ViewChild(MatSort, { static: false }) sort: MatSort;
	@ViewChild('table') table: MatTableDataSource<ClassSOPContainer>;

	constructor(
		private authService: AuthenticationService,
		private reusable: ReusableComponent,
		private router: Router,
		private formBuilder: FormBuilder,
		private SopLanding: SopLandingComponent,
		public dialog: MatDialog,
		private dateAdapter: DateAdapter<Date>,
	) { this.dateAdapter.setLocale('en-GB'); }

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
		this.getConsigneeContacts();
		this.getFFContacts();
		this.checkCreateCarrierForSOP();

		/* Carrier Allocation Functions */
		this.getAllocationIntervals();
		this.getSOPPortForCarrier();
		this.getSOPCarrierList();
		this.caColl = [];
	}

	ngOnDestroy() {
		this.authService.savePageAccess(this.pageStartTime, new Date(), this.pageCurrentUrl, 'Sop-Carrier');
	}

	/* port search */
	applyCMPortFilter(event) {
		const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
		this.CMSOPPortColl.filter = filterValue.trim().toLowerCase();
		if (filterValue == '') {
			this.CMSOPPortColl.filteredData = this.CMSOPPortColl.data;
			this.portPairNotAvailable = false;
		}
		if (event.key == 'Escape') {
			(event.target as HTMLInputElement).value = '';
			this.CMSOPPortColl.filteredData = this.CMSOPPortColl.data;
		}
		if (this.CMSOPPortColl.filteredData.length == 0) {
			this.portPairNotAvailable = true;
		}
	}

	async getEventsSubModulesWise(){
		this.isLoading = true;
		let param = {
			company_id : this.sop.principal_id,
			sub_module_name : 'Carrier',
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
			});
			this.isLoading = false;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	//carrier Requirements
	async getConsigneeContacts() {
		let param = {
			sop_id: this.sop.sop_id
		}
		let result = await this.authService.getSOPConsigneeContacts({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			this.principalContactColl = result.result;
		}
	}

	async getFFContacts() {
		let param = {
			sop_id: this.sop.sop_id
		}
		let result = await this.authService.getSOPFFContacts({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			this.ffContactColl = result.result;
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async checkCreateCarrierForSOP() {
		this.isLoading = true;
		let param = {
			sop_id: this.sop.sop_id
		}
		let result = await this.authService.checkCreateCarrierForSOP({ param: this.reusable.encrypt(JSON.stringify(param)) });
		this.isLoading = false;
		if (result.success) {
			this.IsSopCarrierReqMsg = result.rowCount > 1 ? true : false;
			this.getCMGrp();
			this.getSOPCarrierForGroup();
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async getSOPCarrierForGroup() {
		this.isLoading = true;
		let param = {
			sop_id: this.sop.sop_id
		}
		let result = await this.authService.getSOPCarrierForGroup({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			this.expandButtonTitle = 'Collapse All';
			result.result.map((cm)=>{
				if (this.isAccessibleEvents.some(v => v.includes(cm.carrier_name.toLowerCase() + ' enable'))) {
					cm['is_enable'] = true;
				} 
				else{
					cm['is_enable'] = false;
				}
				cm.expand = cm.is_enable ? cm.is_selected : !cm.is_selected;;
				cm.fields.map(fld =>{
					if (this.isAccessibleEvents.some(v => v.includes(fld.group.toLowerCase()))) {
						fld['is_accessible'] = true;
					} 
					else{
						fld['is_accessible'] = false;
					}
				});
			})
			this.CMSOPColl = result.result;
			this.CMSOPColl[1].fields[2].field0.field[0].options = this.principalContactColl;
			this.CMSOPColl[1].fields[2].field0.field[1].options = this.ffContactColl;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
		this.isLoading = false;
	}

	async getCMGrp() {
		this.cmGrpColl = [
			{
				"grp_seq": 1,
				"grp": "Carrier Requirements",
				"html_template": 'template2',
			},
			{
				"grp_seq": 2,
				"grp": "Carrier Allocation",
				"html_template": 'template2',
			},
			{
				"grp_seq": 3,
				"grp": "Carrier Preference",
				"html_template": 'template2',
			},
			{
				"grp_seq": 4,
				"grp": "TEU",
				"html_template": 'template2',
			},
		]

		this.cmGrpColl.map((grp, i) => {
			this.cmGrpParam[i] = { color: "var(--lightgray)", disp: false, fw: "normal", isClicked: false };
		});
		this.getEventsSubModulesWise();
		this.onClickCMGrp(0, this.cmGrpColl[0].grp);
	}

	expandCollapseAll(){
		if(this.expandButtonTitle == 'Collapse All'){
			this.CMSOPColl.map((cm)=>{
				cm.expand = false;
			})
			this.expandButtonTitle = 'Expand All';
		} else {
			this.CMSOPColl.map((cm)=>{
				cm.expand = cm.is_selected;
			})
			this.expandButtonTitle = 'Collapse All';
		}
	}

	async updCMFieldValue(idx, chField, grid) {
		let param = {
			fields: JSON.stringify(grid.fields),
			sop_carrier_id: grid.sop_carrier_id
		};
		let result = await this.authService.updSOPCarrierfields({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			chField["status"] = "Update Successful";
		}
		else {
			chField["status"] = "Update Failed";
		}
		setTimeout(() => {
			chField["status"] = undefined;
		}, 1500);
	}


	async updCMisSelected(grid) {
		grid.is_selected = !grid.is_selected;
		let param = {
			is_selected: grid.is_selected,
			sop_carrier_id: grid.sop_carrier_id
		};
		let result = await this.authService.updCarrierisSelected({ param: this.reusable.encrypt(JSON.stringify(param)) });
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
		this.CMSOPColl[grididx].expand = !this.CMSOPColl[grididx].expand;
	}

	selectedChange(value, chField, grid) {
		if (chField.child[0].field[0].value.find(val => val.contact_invite_id == value.contact_invite_id) == undefined) {
			chField.child[0].field[0].value.push(value);
			this.updCMFieldValue(0, chField, grid);
		}
	}

	/* carrier allcation */
	async getSOPPortForCarrier() {
		let param = {
			sop_id: this.sop.sop_id,
		}
		let result = await this.authService.getSopPortList({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			result.result.map((x => {
				x.is_selected = false,
					x.is_allocated = false;
			}));
			this.CMSOPPortColl = new MatTableDataSource<SOPPortClass>(result.result);
		}
	}

	changeActiveCard() {
		this.CMSOPPortColl.data.map((ele) => {
			ele.is_selected = false;
			if (ele.sop_port_id == this.selectedSopPortId) {
				ele.is_selected = true;
			}
		})
	}

	async getAllocationIntervals() {
		let result = await this.authService.getAllocationIntervals();
		if (result.success) {
			this.allocationIntervalsList = result.result;
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async getSOPCarrierList() {
		let param = {
			principal_id: this.sop.principal_id,
			sop_id: this.sop.sop_id
		}
		let result = await this.authService.getSOPCarrierList(param);
		if (result.success) {
			this.carriers = result.result;
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	isDataCollExists: boolean = false;

	async onClickPortPair(port, i) {
		this.isValid = false;
		this.isForm = true;
		this.caColl = [];
		this.selectedSopPortId = port.sop_port_id;
		this.allocationForm();
		this.changeActiveCard();
		let param = {
			sop_id: this.sop.sop_id,
			sop_port_id: port.sop_port_id
		}
		let result = await this.authService.getSOPCarrierAllocation(param);
		if (result.success) {
			this.caColl = result.result;
			if (result.rowCount > 0) {
				this.form.get('StartDate').setValue(new Date(this.caColl[0].effective_start_date));
				this.form.get('EndDate').setValue(new Date(this.caColl[0].effective_end_date));
				this.form.get('AllocatedBy').setValue(this.caColl[0].allocated_by);
				this.form.get('Carrier').setValue(this.caColl[0].carrier);
				this.form.get('AllocationType').setValue(this.caColl[0].allocation_type);
				this.form.get('AllocationInterval').setValue(this.caColl[0].allocation_interval);
				this.form.get('UnitOfAllocation').setValue(this.caColl[0].unit_of_allocation);
				this.form.get('ServiceType').setValue(this.caColl[0].service_type);
				this.isPrincipal = this.form.get('AllocatedBy').value == 'Principal' ? true : false;
				this.isUniform = this.form.get('AllocationType').value == 'Uniform Allocation' ? true : false;
				this.isPercentage = this.form.get('UnitOfAllocation').value == 'Percentage (%)' ? true : false;
				this.inputMaxRange = this.isPercentage ? 100 : 500;
				this.caColl[0].allocated_by == 'Freight Forwarder' ? this.isValid =true : this.isValid = false;
				this.carrierIds = this.caColl[0].carrier;
				if (this.form.get('AllocationType').value == 'Uniform Allocation') {
					this.isUniform = true;
					this.form.get('AllocationInterval').clearValidators();
					this.form.get('ServiceType').clearValidators();
					this.form.get('AllocationInterval').setValue(null);
					this.form.get('ServiceType').setValue(null);
					this.form.get('UnitOfAllocation').disable();
				} else {
					this.isUniform = false;
					this.form.get('UnitOfAllocation').enable();
				}
				if (this.isPrincipal) {
					this.allocatedValuesColl = this.caColl[0].allocation_value;
					this.displayColumns = Object.keys(this.allocatedValuesColl[0]);
				}
				this.allocationIntervalsList.map((x) => {
					if (this.form.get('AllocationInterval').value == x.carrier_interval_id) {
						this.intervalType = x.carrier_interval_name;
					}
				});
				this.isDataCollExists = true;
				this.detectValueChanges();
			} else {
				this.isPrincipal = false;
				this.isUniform = false;
				this.isPercentage = false;
				this.isDataCollExists = false;
			}
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	allocationForm() {
		this.form = this.formBuilder.group({
			StartDate: ['', Validators.compose([
				Validators.required,
			])],
			EndDate: ['', Validators.compose([
				Validators.required,
			])],
			AllocatedBy: ['', Validators.compose([
				Validators.required,
			])],
			Carrier: ['', Validators.compose([
				Validators.required,
			])],
			AllocationType: ['', Validators.compose([
				Validators.required,
			])],
			AllocationInterval: ['', Validators.compose([
				Validators.required,
			])],
			UnitOfAllocation: ['', Validators.compose([
				Validators.required,
			])],
			ServiceType: ['', Validators.compose([
				Validators.required,
			])],
		},
		);
	}

	getcarrieridsRows() {
		this.carrierIdsRows = [];
		this.carrierIds.map((x) => {
			this.carrierIdsRows.push('value_' + x);
		})
	}

	getselectedCarrier() {
		this.selectedCarriers = [];
		this.carriers.map((x) => {
			if (this.carrierIds.includes(x.stakeholder_id)) {
				x.carrier_value = 'value_' + x.stakeholder_id;
				this.selectedCarriers.push(x);
			}
		})
	}

	async updCAFieldValue(row, idx, value) {
		if (this.isPercentage) {
			let filterData = JSON.parse(JSON.stringify(row));
			delete filterData['date'];
			let sumValue:any = Object.values(filterData).reduce((a: number, b: number) => a + b);
			row[value] = sumValue > 100 ? row[value] - (sumValue - 100) : row[value];
		}
		this.allocatedValuesColl[idx] = row;
		let param = {
			sop_id: this.sop.sop_id,
			sop_port_id: this.selectedSopPortId,
			allocation_value: this.allocatedValuesColl,
		}
		let result = await this.authService.updCAFieldValue(param);
		if (result.success) {
			if (!this.isPercentage) {
				this.sumTEUValues();
			}
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	BackToAllocationForm(content) {
		this.isForm = true;
	}

	findNextMonday(d) {
		let date = new Date(d);
		let weeklength = 6;
		let day = (weeklength - date.getDay()) + 2;
		return new Date(date.setDate(date.getDate() + day));
	}

	getDateWeekRange() {
		let weekList = [];
		this.IntervalWeekNumbers = [];
		let start = new Date(this.form.get('StartDate').value);
		let end = new Date(this.form.get('EndDate').value);
		let firstweek = this.findNextMonday(start);
		for (let a = firstweek; a <= end; a.setDate(a.getDate() + 7)) {
			weekList.push(a.toLocaleDateString(undefined, { day: '2-digit' }) + '-' + a.toLocaleDateString(undefined, { month: '2-digit' }) + '-' + a.toLocaleDateString(undefined, { year: 'numeric' }).slice(0, 10))
		}
		this.IntervalLastDates = weekList;
		this.IntervalLastDates.map((date)=>{
			date = date.split("-").reverse().join("-");
			date = new Date(date);
			let oneJan:any =  new Date(date.getFullYear(), 0, 1);
			let numberOfDays =  Math.floor((date - oneJan) / (24 * 60 * 60 * 1000));
			let result = Math.ceil(( date.getDay() + 1 + numberOfDays) / 7);
			this.IntervalWeekNumbers.push(result);
		})
	}

	getDateMonthRange() {
		let start = new Date(this.form.get('StartDate').value);
		let end = new Date(this.form.get('EndDate').value);
		let monthList = [];
		for (let a = start; a <= end; a.setDate(a.getDate() + 30)) {
			monthList.push(a.toLocaleDateString(undefined, { day: '2-digit' }) + '-' + a.toLocaleDateString(undefined, { month: '2-digit' }) + '-' + a.toLocaleDateString(undefined, { year: 'numeric' }).slice(0, 10))
		}
		monthList.shift();
		this.IntervalLastDates = monthList;
	}

	getDateQuarterRange() {
		let start = new Date(this.form.get('StartDate').value);
		let end = new Date(this.form.get('EndDate').value);
		let quarterList = [];
		for (let a = start; a <= end; a.setDate(a.getDate() + 90)) {
			quarterList.push(a.toLocaleDateString(undefined, { day: '2-digit' }) + '-' + a.toLocaleDateString(undefined, { month: '2-digit' }) + '-' + a.toLocaleDateString(undefined, { year: 'numeric' }).slice(0, 10))
		}
		quarterList.shift();
		this.IntervalLastDates = quarterList;
	}

	getDateYearlyRange() {
		let start = new Date(this.form.get('StartDate').value);
		let end = new Date(this.form.get('EndDate').value);
		let yearList = [];
		for (let a = start; a <= end; a.setDate(a.getDate() + 90)) {
			yearList.push(a.toLocaleDateString(undefined, { day: '2-digit' }) + '-' + a.toLocaleDateString(undefined, { month: '2-digit' }) + '-' + a.toLocaleDateString(undefined, { year: 'numeric' }).slice(0, 10))
		}
		yearList.shift();
		this.IntervalLastDates = yearList;
	}
	// new Array(yearlength).fill(0);

	detectValueChanges() {
		this.form.get("UnitOfAllocation").valueChanges.subscribe(selectedValue => {
			if (this.caColl[0].unit_of_allocation != selectedValue) {
				this.isUnitOfAllocationChanges = true;
			} else {
				this.isUnitOfAllocationChanges = false;
			}
		})
		this.form.get("AllocatedBy").valueChanges.subscribe(selectedValue => {
			if (this.caColl[0].allocated_by != selectedValue) {
				this.isAllocatedByChanges = true;
			} else {
				this.isAllocatedByChanges = false;
			}
		})
		this.form.get('AllocationType').valueChanges.subscribe(selectedValue => {
			if (this.caColl[0].allocation_type != selectedValue) {
				this.isAllocationTypeChanges = true;
			} else {
				this.isAllocationTypeChanges = false;
			}
		})
		this.form.get("AllocationInterval").valueChanges.subscribe(selectedValue => {
			if (this.caColl[0].allocation_interval != selectedValue) {
				this.isAllocationIntervalChanges = true;
			} else {
				this.isAllocationIntervalChanges = false;
			}
		})
		this.form.get("StartDate").valueChanges.subscribe(selectedValue => {
			if(this.form.get('AllocatedBy').value == 'Freight Forwarder') {
				this.isValid = true;
			}
			if (this.caColl[0].effective_start_date != selectedValue) {
				this.isStartDateChanges = true;
			} else {
				this.isStartDateChanges = false;
			}
		})
		this.form.get("EndDate").valueChanges.subscribe(selectedValue => {
			if(this.form.get('AllocatedBy').value == 'Freight Forwarder') {
				this.isValid = true;
			}
			if (this.caColl[0] != null && this.caColl[0].effective_end_date != selectedValue) {
				this.isEndDateChanges = true;
			} else {
				this.isEndDateChanges = false;
			}
		})
		this.form.get("ServiceType").valueChanges.subscribe(selectedValue => {
			if (this.caColl[0].service_type != selectedValue) {
				this.isServiceTypeChanges = true;
			} else {
				this.isServiceTypeChanges = false;
			}
		})
	}

	sumTEUValues() {
		this.allocatedTEUSum = [];
		if(this.allocatedValuesColl[0].date == 'TEU SUM'){
			this.allocatedValuesColl.splice(0, 1); // removing teu total value and re-calculating
		}
		for (let i of this.carrierIdsRows) {
			let sum = 0;
			let group = this.allocatedValuesColl.reduce((r, a) => {
				sum += a[i];
				// r[a[i]] = [...r[a[i]] || []];
				// return r;
			}, {});
			let val = {
				[i]: sum,
			}
			this.allocatedTEUSum.push(val);
		}

		let allocatedTEUValues = [
			{
				"date": 'TEU SUM',
			}
		]

		allocatedTEUValues.map((x) => {
			for (let i of this.allocatedTEUSum) {
				Object.assign(x, i)
			}
		})
		this.allocatedValuesColl.unshift(allocatedTEUValues[0]);
		this.allocatedValuesColl = [...this.allocatedValuesColl];
	}

	async saveAllocationForm() {
		let param = {};
		this.isInsUpdate = false;
		console.log('first',this.form.value)
		this.allocationFormValues = this.form.value;
		//this.detectValueChanges();
		//this.getcarrieridsRows();
		//this.getselectedCarrier();
		this.isForm = false;
		if (!this.isDataCollExists) {
			this.isInsUpdate = true;
			if(this.isPrincipal && this.isUniform){
				this.createUniformNewdata();
			} else if(this.isPrincipal && !this.isUniform) {
				this.createNewdata();
			}
			// this.isPrincipal ? this.createNewdata() : '';
		}
		else if ((this.isStartDateChanges && this.isEndDateChanges) || this.isAllocatedByChanges || this.isUnitOfAllocationChanges) {
			this.allocatedValuesColl = null;
			this.getselectedCarrier();
			this.isInsUpdate = true;
			this.isPrincipal ? this.createNewdata() : '';
			this.isStartDateChanges = false;
			this.isEndDateChanges = false;
			this.isAllocatedByChanges = false;
			this.isUnitOfAllocationChanges = false;
		} else if (this.isAllocationTypeChanges) {
			this.allocatedValuesColl = [];
			this.isInsUpdate = true;
			this.isUniform ? this.createUniformNewdata() : this.createNewdata();
			this.isAllocationTypeChanges = false;
		} else if (this.isAllocationIntervalChanges) {
			this.allocatedValuesColl = null;
			this.isInsUpdate = true;
			this.isUniform ? this.createUniformNewdata() : this.createNewdata();
			this.isAllocationIntervalChanges = false;
		} else if (this.isCarrierValueChanges) {
			this.isInsUpdate = true;
			this.isCarrierValueChanges = false;
			this.carrierIdChanges();
			this.displayColumns = Object.keys(this.allocatedValuesColl[0]);
		} else {
			this.isInsUpdate = this.isServiceTypeChanges ? true : false;
			this.isPrincipal ? this.getcarrieridsRows() : '';
			this.isPrincipal ? this.getselectedCarrier() : '';
		}
		if (!this.isPercentage && this.isPrincipal) {
			this.sumTEUValues();
		}
		this.getDateWeekRange();
		param = {
			sop_ca_id: this.caColl.length != 0 ? this.caColl[0].sop_ca_id : undefined,
			sop_id: this.sop.sop_id,
			sop_port_id: this.selectedSopPortId,
			effective_start_date: this.form.get('StartDate').value,
			effective_end_date: this.form.get('EndDate').value,
			allocated_by: this.form.get('AllocatedBy').value,
			carrier: this.form.get('Carrier').value,
			allocation_type: this.form.get('AllocationType').value,
			allocation_interval: this.form.get('AllocationInterval').value,
			unit_of_allocation: this.form.get('UnitOfAllocation').value,
			service_type: this.form.get('ServiceType').value,
			allocation_value: this.isPrincipal ? this.allocatedValuesColl : [],
			carrier_preference: this.form.get('Carrier').value
		}
		if (this.isInsUpdate) {
			let result = await this.authService.insSOPCarrierAllocation(param);
			if (!result.success) {
				this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
			}
		}
	}

	async carrierIdChanges() {
		let existsCarrierIds = this.caColl[0].carrier;
		let existsCarrierValues = this.caColl[0].allocation_value;
		let RemoveIds = existsCarrierIds.filter(function (n) { return !this.has(n) }, new Set(this.carrierIds));
		let addedIds = this.carrierIds.filter(function (n) { return !this.has(n) }, new Set(existsCarrierIds));
		this.allocatedValuesColl.map(data => {
			RemoveIds.map(removeId => {
				delete data['value_' + removeId];
			});
			addedIds.map(addId => {
				data['value_' + addId] = 0;
			})
		});
	}

	getIntervalRange() {
		if (this.intervalType == 'Weekly') {
			this.getDateWeekRange();
		} else if (this.intervalType == 'Monthly') {
			this.getDateMonthRange();
		} else if (this.intervalType == 'Quarterly') {
			this.getDateQuarterRange();
		} else {
			this.getDateYearlyRange();
		}
	}

	createNewdata() {
		this.getIntervalRange();
		var allocatedValues = [];
		var allocatedzeros = [];
		this.carrierIdsRows.map((row) => {
			let val = {
				[row]: 0,
			}
			allocatedzeros.push(val)
		})

		this.IntervalLastDates.map((d, i) => {
			d = d.split("-").reverse().join("-");
			let date = new Date(d);
			let format = date.toLocaleDateString('en-GB', {
				day: 'numeric', month: 'short', year: 'numeric'
			  }).replace(/ /g, '-');
			let val = {
				'date': format,
			}
			allocatedValues.push(val);
		})

		allocatedValues.map((x) => {
			for (let i of allocatedzeros) {
				Object.assign(x, i)
			}
		})
		this.allocatedValuesColl = allocatedValues;
		this.displayColumns = Object.keys(this.allocatedValuesColl[0]);
	}

	disableSaveButton() {
		let disable = true;
		if(this.isPrincipal) {
			disable = !this.form.valid;
		} else {
			if(this.form.get('AllocatedBy').value == 'Freight Forwarder' && this.form.get('StartDate').valid && this.form.get('EndDate').valid) {
				disable = false;
			} else {
				disable = true;
			}
		}
		return disable;
	}

	createUniformNewdata() {
		var allocatedzeros = [];
		let allocatedValues = [
			{
				"date": 'Allocation',
			}
		]
		this.carrierIdsRows.map((row) => {
			let val = {
				[row]: 0,
			}
			allocatedzeros.push(val)
		})

		allocatedValues.map((x) => {
			for (let i of allocatedzeros) {
				Object.assign(x, i)
			}
		})
		this.allocatedValuesColl = allocatedValues;
		this.displayColumns = Object.keys(this.allocatedValuesColl[0]);
	}

	selectAllocatedBy() {
		if (this.form.get('AllocatedBy').value == 'Principal') {
			this.form.get('Carrier').setValue(null);
			this.form.get('AllocationType').setValue(null);
			this.form.get('UnitOfAllocation').setValue(null);
			this.form.get('AllocationInterval').setValue(null);
			this.isValid = false;
			this.isPrincipal = true;
		} else if (this.form.get('AllocatedBy').value == 'Freight Forwarder') {
			if(this.form.get('StartDate').value && this.form.get('EndDate').value) {
				this.isValid = true;
			} else {
				this.isValid = false;
			}
			this.form.get('AllocationType').setValue('Custom Allocation');
			this.form.get('AllocationInterval').setValue(1);
			this.form.get('ServiceType').setValue(null);
			this.form.get('UnitOfAllocation').setValue('Percentage (%)');
			this.form.get('Carrier').setValue(null);
			this.isPrincipal = false;
			this.selectAllocationInterval();
		}
	}

	selectCarrier() {
		this.isCarrierValueChanges = true;
		this.carrierIds = this.form.get('Carrier').value;
		this.getcarrieridsRows();
		this.getselectedCarrier();
	}

	selectAllocationType() {

		if (this.form.get('AllocationType').value == 'Uniform Allocation') {
			this.isUniform = true;
			this.isPercentage = true;
			this.form.get('UnitOfAllocation').setValue('Percentage (%)');
			this.form.get('AllocationInterval').clearValidators();
			this.form.get('ServiceType').clearValidators();
			this.form.get('AllocationInterval').setValue(null);
			this.form.get('ServiceType').setValue(null);
			this.form.get('UnitOfAllocation').disable();
		} else {
			this.isUniform = false;
			this.form.get('UnitOfAllocation').enable();
		}
	}

	selectAllocationInterval() {
		var interval = this.form.get('AllocationInterval').value;
		this.allocationIntervalsList.map((x) => {
			if (interval == x.carrier_interval_id) {
				this.intervalType = x.carrier_interval_name;
			}
		})
	}

	selectUnitOfAllocation() {
		if (this.form.get('UnitOfAllocation').value == 'Percentage (%)') {
			this.isPercentage = true;
			this.inputMaxRange = 100;
		} else if (this.form.get('UnitOfAllocation').value == 'TEU') {
			this.isPercentage = false;
			this.inputMaxRange = 500;
		}
	}

	selectServiceType() { }

	async onClickCMGrp(idx, grp) {
		this.cmGrpColl.map((group, ix) => {
			if (idx == ix) {
				this.cmGrpParam[idx] = { color: "var(--active)", disp: true, fw: 600, isClicked: true };
				// this.cmTemplete = this.cmGrpColl[idx].html_template;
				this.cmGrpTitle = grp;
			} else {
				if (this.cmGrpParam[ix]["disp"] || this.cmGrpParam[ix]["isClicked"]) this.cmGrpParam[ix] = { color: "var(--green)", disp: false, fw: "normal", isClicked: true };
				else {
					this.cmGrpParam[ix]["color"] = "var(--lightgray)";
					this.cmGrpParam[ix]["disp"] = false;
					this.cmGrpParam[ix]["fw"] = "normal";
				}
			}
		});
		if (idx == 0) {
			this.dispWIP = false;
			this.getSOPCarrierForGroup();  //temporary added to get carrier requirement coll
		} else if (idx == 1) {
			this.dispWIP = false;
			if (this.CMSOPPortColl.data.length == 0) {
				this.dialog.open(ConfirmDialog, {
					data: {
						type: 'add-port-info',
						content: "You have not selected any Port pair for this SOP (" + this.sop.sop_id + "), carrier Allocation requires the same",
					},
					disableClose: true,
				});
				setTimeout(() => {
					this.SopLanding.selTabIndex = 0;
					this.router.navigate(['nav/soplanding/sopstakeholder']);
					this.dialog.closeAll();
				}, 5000);

			} else {
				this.allocationForm();
				this.onClickPortPair(this.CMSOPPortColl.data[0], 0);
			}
		}
		else {
			this.dispWIP = false;
			if (this.CMSOPPortColl.data.length == 0) {
				this.dialog.open(ConfirmDialog, {
					data: {
						type: 'add-port-info',
						content: "You have not selected any Port pair for this SOP (" + this.sop.sop_id + "), carrier Preference requires the same",
					},
					disableClose: true,
				});
				setTimeout(() => {
					this.SopLanding.selTabIndex = 0;
					this.router.navigate(['nav/soplanding/sopstakeholder']);
					this.dialog.closeAll();
				}, 5000);

			} else {
				this.onClickPreferencePortPair(this.CMSOPPortColl.data[0], 0);
			}

		}
	}

	async onClickPreferencePortPair(port, i) {
		this.allocationFormValues = null;
		this.selectedCarriers = [];
		this.selectedSopPortId = port.sop_port_id;
		this.changeActiveCard();
		let param = {
			sop_id: this.sop.sop_id,
			sop_port_id: port.sop_port_id
		}
		let result = await this.authService.getSOPCarrierAllocation(param);
		if (result.rowCount > 0) {
			if (result.success) {
				this.caColl = result.result;
				this.sopCaId = result.result[0].sop_ca_id,
					this.allocationFormValues = {
						"StartDate": this.caColl[0].effective_start_date,
						"EndDate": this.caColl[0].effective_end_date,
						"AllocatedBy": this.caColl[0].allocated_by,
						"AllocationType": this.caColl[0].allocation_type,
						"ServiceType": this.caColl[0].service_type,
						"AllocationInterval": this.caColl[0].allocation_interval,
					}
				this.allocationIntervalsList.map((x) => {
					if (this.caColl[0].allocation_interval == x.carrier_interval_id) {
						this.intervalType = x.carrier_interval_name;
					}
				});
				this.isPrincipal = this.caColl[0].allocated_by == 'Principal' ? true : false;
				this.carrierPrefIds = this.caColl[0].carrier_preference;
				this.getselectedPreferenceCarrier();
			} else {
				this.caColl = [];
			}
		} else {
			this.onClickCMGrp(1, 'Carrier Allocation');
			setTimeout(() => {
				this.onClickPortPair(port, i)
			}, 1000);
			this.reusable.openAlertMsg('Update Allocation values', "error");
		}
	}

	getselectedPreferenceCarrier() {
		this.selectedCarriers = [];
		for (let i = 0; i < this.carrierPrefIds.length; i++) {
			let filteredValue = this.carriers.filter(x => x.stakeholder_id == this.carrierPrefIds[i]);
			filteredValue[0]['preference'] = i + 1;
			filteredValue[0].valid_from = (new Date(filteredValue[0].valid_from)).toISOString();
			filteredValue[0].valid_to = (new Date(filteredValue[0].valid_to)).toISOString();
			this.selectedCarriers.push(filteredValue[0]);
		}
	}

	async savePref(reOrder) {
		var prefer = [];
		this.selectedCarriers.map((x, i) => {
			x.preference = i + 1;
			prefer.push(x.stakeholder_id)
		});
		if (reOrder) {
			let param = {
				sop_ca_id: this.sopCaId,
				carrier_preference: prefer,
			}
			let result = await this.authService.saveCarrierPreference(param);
			if (!result.success) {
				this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
			}
		}
	}

	dragDrop(event: CdkDragDrop<SOPCarrierPreference[]>) {
		let reOrder = false;
		if (event.previousContainer === event.container) {
			reOrder = true;
			moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
		} else {
			reOrder = false;
			transferArrayItem(event.previousContainer.data,
				event.container.data,
				event.previousIndex,
				event.currentIndex);
		}
		this.selectedCarriers = [...this.selectedCarriers]
		this.savePref(reOrder);
	}
	// not is use after 23-11-2021
	async getSOPCarrierAllocation() {
		let param = {
			sop_id: this.sop.sop_id
		}
		let result = await this.authService.getSOPCarrierAlloc({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			this.sopCarrierAllocColl = result.result;
			this._alldata = this.sopCarrierAllocColl;
			this.datasource.data = this.addGroups(this._alldata, this.groupByColumns);
			this.datasource.filterPredicate = this.customFilterPredicate.bind(this);
			this.datasource.filter = performance.now().toString();
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
		this.onClickCA();
	}

	// not is use after 23-11-2021
	async delSOPCarrierAlloc(orginDestPort) {
		let conf = confirm("Are you sure to delete the allocations for this port " + orginDestPort);
		if (!conf) return;
		let delContent = this.sopCarrierAllocColl.filter(x => x.origin_dest_port == orginDestPort)[0];
		let param = {
			sop_id: delContent.sop_id,
			origin_port_id: delContent.origin_port_id,
			dest_port_id: delContent.dest_port_id
		}
		let result = await this.authService.delSOPCarrierAllocForPort({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			this.reusable.openAlertMsg("Successfully removed Allocation", "info");
			this.getSOPCarrierAllocation();
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	// not is use after 23-11-2021
	async delSOPCarrierPref(orginDestPort) {
		let conf = confirm("Are you sure to delete the preference for this port " + orginDestPort);
		if (!conf) return;
		let delContent = this.sopCarrierAllocColl.filter(x => x.origin_dest_port == orginDestPort)[0];
		let param = {
			sop_id: delContent.sop_id,
			origin_port_id: delContent.origin_port_id,
			dest_port_id: delContent.dest_port_id
		}
		let result = await this.authService.delSOPCarrierPrefForPort({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			this.reusable.openAlertMsg("Successfully removed Preference", "info");
			this.getSOPCarrierPreference();
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	// not is use after 23-11-2021
	groupBy(event, column) {
		event.stopPropagation();
		this.checkGroupByColumn(column.field, true);
		this.datasource.data = this.addGroups(this._alldata, this.groupByColumns);
		this.datasource.filter = performance.now().toString();
	}

	// not is use after 23-11-2021
	checkGroupByColumn(field, add) {
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
			if (add) {
				this.groupByColumns.push(field);
			}
		}
	}

	// not is use after 23-11-2021
	//currently we are not allowing to ungroup
	unGroupBy(event, column) {
		event.stopPropagation();
		this.checkGroupByColumn(column.field, false);
		this.datasource.data = this.addGroups(this._alldata, this.groupByColumns);
		this.datasource.filter = performance.now().toString();
	}

	// not is use after 23-11-2021
	// below is for grid row grouping
	customFilterPredicate(data: any | TblGroup, filter: string): boolean {
		return (data instanceof TblGroup) ? data.visible : this.getDataRowVisible(data);
	}

	// not is use after 23-11-2021
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

	// not is use after 23-11-2021
	groupHeaderClick(row) {
		row.expanded = !row.expanded;
		this.datasource.filter = performance.now().toString();  // bug here need to fix
	}

	// not is use after 23-11-2021
	addGroups(data: any[], groupByColumns: string[]): any[] {
		const rootGroup = new TblGroup();
		rootGroup.expanded = true;
		return this.getSublevel(data, 0, groupByColumns, rootGroup);
	}

	// not is use after 23-11-2021
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

	// not is use after 23-11-2021
	uniqueBy(a, key) {
		const seen = {};
		return a.filter((item) => {
			const k = key(item);
			return seen.hasOwnProperty(k) ? false : (seen[k] = true);
		});
	}

	// not is use after 23-11-2021
	isGroup(index, item): boolean {
		return item.level;
	}

	// not is use after 23-11-2021
	addCarrierAlloc() {
		let alloc = [];
		this.openCarrierAllocDialog(alloc);
	}

	// not is use after 23-11-2021
	openCarrierAllocDialog(alloc) {
		const dialogRef = this.dialog.open(CarrierAddEditDialog, {
			width: '930px',
			minHeight: '370px',
			data: { sop_id: this.sop.sop_id, data: alloc }
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) this.getSOPCarrierAllocation();
		});
	}

	// not is use after 23-11-2021
	onClickCA() {
		if (!this.dispCA) {
			this.colorCA = 'var(--active)';
			this.dispCA = true;
			this.fwCA = "600";
			this.dispCCP = false;
			this.getSOPCarrierAllocation();
		}
		if (this.dispCCP) {
			this.colorCCP = 'var(--green)';
			this.dispCCP = false;
			this.fwCCP = 'normal'
		}
	}

	// not is use after 23-11-2021
	onClickCCP() {
		if (this.dispCA) {
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

	// not is use after 23-11-2021
	async getSOPCarrierPreference() {
		let param = {
			sop_id: this.sop.sop_id
		}
		let result = await this.authService.getSOPCarrierPref({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			this.sopCarrierPrefColl = result.result;
			this._alldata = this.sopCarrierPrefColl;
			this.datasource.data = this.addGroups(this._alldata, this.groupByColumns);
			this.datasource.filterPredicate = this.customFilterPredicate.bind(this);
			this.datasource.filter = performance.now().toString();
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	// not is use after 23-11-2021
	addCarrierPref() {
		let pref = [];
		this.openCarrierPrefDialog(pref);
	}

	// not is use after 23-11-2021
	openCarrierPrefDialog(pref) {
		const dialogRef = this.dialog.open(CarrierPrefAddEditDialog, {
			width: '930px',
			minHeight: '370px',
			data: { sop_id: this.sop.sop_id, data: pref }
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) this.getSOPCarrierPreference();
		});
	}

	// not is use after 23-11-2021
	async getCarrier() {
		let result = await this.authService.getCarrier();
		if (result.success) {
			this.carrierColl = result.result;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

}

/* Carrier Allocation Add/Edit between ports */
@Component({
	selector: 'carrier-add-edit',
	templateUrl: 'carrier-add-edit-dialog.html',
	styleUrls: ['./sop-carrier.component.css']
})
export class CarrierAddEditDialog implements OnInit {
	portColl: ClassPorts[] = [];
	destPortColl: ClassPorts[] = [];
	carrierColl: ClassCompany[] = [];
	form: FormGroup;
	filterPortOP: Observable<ClassPorts[]>;
	filterPortDP: Observable<ClassPorts[]>;
	errMsg = '';
	totalPercent100 = false;
	originalSCAIds = [];

	constructor(
		public dialogRef: MatDialogRef<CarrierAddEditDialog>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private formBuilder: FormBuilder,
		private authService: AuthenticationService,
		private reusable: ReusableComponent,
	) { }

	ngOnInit() {
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

	clearCarrierAllocations() {
		let len = this.carrierAlloc.controls.length
		for (let i = len - 1; i >= 0; i--) {
			this.removeCarrierAlloc(i);
		}
	}

	async getSOPCarrierAllocation() {
		this.clearCarrierAllocations();
		let param = {
			sop_id: this.data.sop_id,
			origin_port_id: this.form.get("OriginPort").value.port_id,
			dest_port_id: this.form.get("DestPort").value.port_id
		}
		let result = await this.authService.getSOPCarrierAllocByPort({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			this.data.data = result.result;
			this.data.data.map(row => {
				this.originalSCAIds.push(row.sca_id);
				let carrier = this.carrierColl.filter(x => x.company_id == row.carrier_id)[0];
				this.addCarrierAlloc(row, carrier);
			});
			if (this.data.data.length == 0) {
				this.addContract();
			}
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
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

	onSelOP() {
		this.destPortColl = this.portColl.filter(x => x.country != this.form.get("OriginPort").value.country);
		if (this.data.data.length > 0) {
			let dPort = this.destPortColl.filter(x => x.port_id == this.data.data[0].dest_port_id);
			this.form.get("DestPort").setValue(dPort[0]);
		}
		if (this.filterPortDP != undefined) this.filterPortDP = undefined;
		this.filterPortDP = this.form.get("FilterDP").valueChanges
			.pipe(
				startWith(''),
				map(value => typeof value === 'string' ? value : value != undefined ? value.portwithregion : ''),
				map(name => name ? this._filterDP(name) : this.destPortColl)
			);
		if (this.form.get("DestPort").value != undefined) {
			this.onSelDP();
		}
	}

	onSelDP() {
		if (this.form.get("OriginPort").value != undefined && this.form.get("DestPort").value != undefined) {
			this.getSOPCarrierAllocation();
		}
	}

	async getPorts() {
		let result = await this.authService.getPorts();
		if (result.success) {
			this.portColl = result.result;
			this.form.get('FilterOP').setValue('');
			this.form.get('FilterDP').setValue('');
			if (this.data.data.length > 0) {
				let oPort = this.portColl.filter(x => x.port_id == this.data.data[0].origin_port_id);
				this.form.get("OriginPort").setValue(oPort[0]);
			}
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error")
		}
	}

	async getCarrier() {
		let result = await this.authService.getCarrier();
		if (result.success) {
			let res = await this.authService.getFF();
			if (res.success) {
				let cons = res.result.concat(result.result);
				this.carrierColl = cons;
			}
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error")
		}
	}

	createForm() {
		this.form = this.formBuilder.group({
			OriginPort: [null, Validators.compose([
				Validators.required,
			])],
			DestPort: [null, Validators.compose([
				Validators.required,
			])],
			CarrierAlloc: this.formBuilder.array([]),
			FilterOP: [null],
			FilterDP: [null]
		});
	}

	get carrierAlloc() {
		return this.form.get('CarrierAlloc') as FormArray;
	}

	getCarrierAllocArrControls() {
		return (this.form.get('CarrierAlloc') as FormArray).controls;
	}

	addCarrierAlloc(row, carrier) {
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
			SCAId: [row.sca_id]
		}));
	}

	removeCarrierAlloc(idx) {
		this.carrierAlloc.removeAt(idx);
		this.form.markAsDirty();
	}

	onClose(status) {
		this.dialogRef.close(status)
	}

	getErrorMessage(control) {
		let msg = '';
		msg += control.hasError('required') ? 'You must enter a value' : '';
		return msg;
	}

	addContract() {
		this.validateAllocPerct();
		if (this.errMsg.length == 0 && !this.totalPercent100) {
			this.addCarrierAlloc({ allocation_percent: undefined, contract_number: undefined }, null);
		}
	}

	validateAllocPerct() {
		let valuePercent = 0;
		for (let i = 0; i < this.carrierAlloc.length; i++) {
			if (typeof this.carrierAlloc.controls[i].get('AllocationPercent').value != "number" || this.carrierAlloc.controls[i].get('AllocationPercent').value.toString().includes('e')) {
				this.errMsg = "Invalid data in Allocation Percent";
				this.totalPercent100 = false;
				return;
			}
			valuePercent += this.carrierAlloc.controls[i].get('AllocationPercent').value;
			if (valuePercent > 100) {
				this.errMsg = "Allocation percentage must not exceed 100";
				this.totalPercent100 = false;
				return;
			}
			else {
				this.errMsg = ''
				if (valuePercent == 100) {
					this.totalPercent100 = true;
				}
				else {
					this.totalPercent100 = false;
				}
			}
		}
	}

	async saveSOPCarrierAllocation() {
		this.validateAllocPerct();
		if (!this.totalPercent100) return;
		let insData = [];
		let updData = [];
		let removedIds = [];
		let curSCAIds = []
		for (let i = 0; i < this.carrierAlloc.length; i++) {
			if (this.carrierAlloc.controls[i].get('AllocationPercent').value != 0) {
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
		removedIds = this.originalSCAIds.filter(x => curSCAIds.indexOf(x) == -1);
		let msg = ''
		if (removedIds.length > 0) {
			let param = {
				removedIds: removedIds
			};
			let result = await this.authService.removeSOPCarrierAlloc({ param: this.reusable.encrypt(JSON.stringify(param)) });
			if (result.success) {
				msg += "Successfully removed SOP Carrier Allocation"
			}
			else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
			}
		}
		if (updData.length > 0) {
			let param = {
				data: updData
			};
			let result = await this.authService.updSOPCarrierAlloc({ param: this.reusable.encrypt(JSON.stringify(param)) });
			if (result.success) {
				msg += "Successfully updated SOP Carrier Allocation"
			}
			else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
			}
		}
		if (insData.length > 0) {
			let param = {
				data: JSON.stringify(insData)
			};
			let result = await this.authService.insSOPCarrierAlloc({ param: this.reusable.encrypt(JSON.stringify(param)) });
			if (result.success) {
				msg += "Successfully added SOP Carrier Allocation"
			}
			else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
			}
		}
		if (msg.length > 95) {
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
		else if (msg.length > 0 && msg.length <= 46) {
			this.reusable.openAlertMsg(msg, "info");
			this.onClose(true);
		}
	}
}

/* Carrier Preference Add/Edit between ports */
@Component({
	selector: 'carrier-pref-add-edit',
	templateUrl: 'carrier-pref-add-edit-dialog.html',
	styleUrls: ['./sop-carrier.component.css']
})
export class CarrierPrefAddEditDialog implements OnInit {
	portColl: ClassPorts[] = [];
	destPortColl: ClassPorts[] = [];
	carrierColl = new MatTableDataSource([]);
	sopCarrierPrefColl = new MatTableDataSource([]);
	form: FormGroup;
	filterPortOP: Observable<ClassPorts[]>;
	filterPortDP: Observable<ClassPorts[]>;
	errMsg = '';
	originalSCPIds = [];
	tblDispCarrier = ["carrier_name"]
	tblDispSOPCarrierPref = ["carrier_name", "contract_number", "preference", "edit"];

	constructor(
		public dialogRef: MatDialogRef<CarrierPrefAddEditDialog>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private formBuilder: FormBuilder,
		private authService: AuthenticationService,
		private reusable: ReusableComponent,
	) { }

	ngOnInit() {
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

	async getSOPCarrierPreference() {
		let param = {
			sop_id: this.data.sop_id,
			origin_port_id: this.form.get("OriginPort").value.port_id,
			dest_port_id: this.form.get("DestPort").value.port_id
		}
		let result = await this.authService.getSOPCarrierPrefByPort({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			this.data.data = result.result;
			this.data.data.map(row => {
				if (row.scp_id != undefined) this.originalSCPIds.push(row.scp_id);
				row["edit_mode"] = false;

			});
			this.carrierColl = new MatTableDataSource(result.result.filter(x => x.scp_id == undefined));
			this.sopCarrierPrefColl = new MatTableDataSource(result.result.filter(x => x.scp_id != undefined));
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
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

	onSelOP() {
		this.destPortColl = this.portColl.filter(x => x.country != this.form.get("OriginPort").value.country);
		if (this.data.data.length > 0) {
			let dPort = this.destPortColl.filter(x => x.port_id == this.data.data[0].dest_port_id);
			this.form.get("DestPort").setValue(dPort[0]);
		}
		if (this.filterPortDP != undefined) this.filterPortDP = undefined;
		this.filterPortDP = this.form.get("FilterDP").valueChanges
			.pipe(
				startWith(''),
				map(value => typeof value === 'string' ? value : value != undefined ? value.portwithregion : ''),
				map(name => name ? this._filterDP(name) : this.destPortColl)
			);
		if (this.form.get("DestPort").value != undefined) {
			this.onSelDP();
		}
	}

	onSelDP() {
		if (this.form.get("OriginPort").value != undefined && this.form.get("DestPort").value != undefined) {
			this.getSOPCarrierPreference();
		}
	}

	async getPorts() {
		let result = await this.authService.getPorts();
		if (result.success) {
			this.portColl = result.result;
			this.form.get('FilterOP').setValue('');
			this.form.get('FilterDP').setValue('');
			if (this.data.data.length > 0) {
				let oPort = this.portColl.filter(x => x.port_id == this.data.data[0].origin_port_id);
				this.form.get("OriginPort").setValue(oPort[0]);
			}
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error")
		}
	}

	createForm() {
		this.form = this.formBuilder.group({
			OriginPort: [null, Validators.compose([
				Validators.required,
			])],
			DestPort: [null, Validators.compose([
				Validators.required,
			])],
			CarrierPref: this.formBuilder.array([]),
			FilterOP: [null],
			FilterDP: [null]
		});
	}

	onClose(status) {
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

	dragDrop(event: CdkDragDrop<any[]>) {
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

	async saveSOPCarrierPreference() {
		let insData = [];
		let updData = [];
		let removedIds = [];
		let curSCPIds = [];
		let data = this.sopCarrierPrefColl.data;
		data.map((d, idx) => {
			if (d.scp_id != undefined) {
				curSCPIds.push(d.scp_id);
				updData.push({
					scp_id: d.scp_id,
					carrier_id: d.carrier_id,
					contract_number: d.contract_number,
					preference: idx + 1
				})
			}
			else {
				insData.push({
					sop_id: this.data.sop_id,
					origin_port_id: this.form.get("OriginPort").value.port_id,
					dest_port_id: this.form.get("DestPort").value.port_id,
					carrier_id: d.carrier_id,
					contract_number: d.contract_number,
					preference: idx + 1
				});

			}
		})
		removedIds = this.originalSCPIds.filter(x => curSCPIds.indexOf(x) == -1);
		let msg = ''
		if (removedIds.length > 0) {
			let param = {
				removedIds: removedIds
			};
			let result = await this.authService.removeSOPCarrierPref({ param: this.reusable.encrypt(JSON.stringify(param)) });
			if (result.success) {
				msg += "Successfully removed SOP Carrier Preference"
			}
			else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
			}
		}
		if (updData.length > 0) {
			let param = {
				data: updData
			};
			let result = await this.authService.updSOPCarrierPref({ param: this.reusable.encrypt(JSON.stringify(param)) });
			if (result.success) {
				msg += "Successfully updated SOP Carrier Preference"
			}
			else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
			}
		}
		if (insData.length > 0) {
			let param = {
				data: JSON.stringify(insData)
			};
			let result = await this.authService.insSOPCarrierPref({ param: this.reusable.encrypt(JSON.stringify(param)) });
			if (result.success) {
				msg += "Successfully added SOP Carrier Preference"
			}
			else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
			}
		}
		if (msg.length > 95) {
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
		else if (msg.length > 0 && msg.length <= 46) {
			this.reusable.openAlertMsg(msg, "info");
			this.onClose(true);
		}
	}
}
