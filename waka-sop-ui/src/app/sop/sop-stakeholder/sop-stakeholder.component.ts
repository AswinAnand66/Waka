import { Component, OnInit, Inject, ViewChild, SystemJsNgModuleLoader, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, Validators, FormControl, FormBuilder } from '@angular/forms';
import { AuthenticationService } from '../../_services/index';
import { ReusableComponent } from '../../reusable/reusable.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClassSOPPort, ClassPorts, ClassSOPCompany } from '../sop-global-class';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
	selector: 'app-sop-stakeholder',
	templateUrl: './sop-stakeholder.component.html',
	styleUrls: ['./sop-stakeholder.component.css']
})

export class SopStakeholderComponent implements OnInit {
	objectKeys = Object.keys;
	objectValues = Object.values;
	isLoading: boolean = false;
	permissionDenied: boolean = false;
	isDisabled = true;
	userDetails: any;
	form: FormGroup;
	sop: any;
	screen: { width: number; height: number; };
	sopId: any
	sopPortColl = new MatTableDataSource<ClassSOPPort>([]);
	sopStakeholderColl = new MatTableDataSource([]);
	port_count: any;
	portColl: ClassPorts[] = [];
	destPortColl: ClassPorts[] = [];
	orgPortColl: ClassPorts[] = [];
	filterPortOP: Observable<ClassPorts[]>;
	filterPortDP: Observable<ClassPorts[]>;
	dispSOPPort = ["origin_country_name", "origin_port", "dest_port", "dest_country_name", "remove"];
	dispSOPStakeholder = ["company_name", "company_type", "contract_no", "contract_validity", "country_name", "name", "email", "mobile"];
	isPrevious: boolean = true;
	countryIds = [];
	showPorts = true;
	selectedTabIndex = 0;
	showAddPort = false;
	isOpenFilter: boolean = false;
	isAllSelected: boolean = false;
	stakeholderTypes = [];
	stakeholderTypesIds = [];
	pageStartTime: Date;
	pageCurrentUrl: string;
	accessibleEvents = [];
	isAccessible = {};
	isEventDisable: boolean = true;

	@ViewChild(MatSort) sort: MatSort;
	@ViewChild(MatSort) set matSort(ms: MatSort) {
		this.sort = ms;
		this.setSopPortListSorting();
	}

	@HostListener('click', ['$event.target']) onClick() {
		this.isOpenFilter = false;
	}

	constructor(
		private authService: AuthenticationService,
		private reusable: ReusableComponent,
		private router: Router,
		private formBuilder: FormBuilder,
		public dialog: MatDialog,
	) { }

	createForm() {
		this.form = this.formBuilder.group({
			OriginPort: [null, Validators.compose([
				Validators.required,
			])],
			DestPort: [null, Validators.compose([
				Validators.required,
			])],
			FilterOP: [null],
			FilterDP: [null]
		});
	}

	ngOnInit(): void {
		this.pageStartTime = new Date();
		this.pageCurrentUrl = this.router.url;
		// console.log('this.pageStartTime,this.pageCurrentUrl',this.pageStartTime,this.pageCurrentUrl);
		this.userDetails = ReusableComponent.usr;
		if (sessionStorage.getItem("sop")) {
			this.sop = JSON.parse(this.reusable.decrypt(sessionStorage.getItem("sop")));
			this.sop["validFrom"] = new Date(this.sop.valid_from);
			this.sop["validTo"] = new Date(this.sop.valid_to);
			this.getEventsSubModulesWise();
		}
		else {
			this.router.navigate(['/nav/sop']);
		}
		this.reusable.headHt.next(60);
		this.reusable.screenChange.subscribe(res => {
			this.screen = { width: res.width - 112, height: res.height - 140 };
		});
		if (this.sop == undefined) this.reusable.titleHeader.next("Standard Operating Procedure");
		else {
			this.reusable.titleHeader.next("Edit Standard Operating Procedure (" + this.sop.sop_id + ")");
			this.sopId = this.sop.sop_id;
		}
		this.reusable.curRoute.next("/nav/sop");
		this.getPorts();
		this.getSopPortList();
		this.showPorts = true;
		this.createForm();

		this.filterPortOP = this.form.get("FilterOP").valueChanges
			.pipe(
				startWith(''),
				map(value => typeof value === 'string' ? value : value != undefined ? value.portwithregion : ''),
				map(name => name ? this._filter(name) : this.portColl)
			);
	}

	ngOnDestroy() {
		this.authService.savePageAccess(this.pageStartTime, new Date(), this.pageCurrentUrl, 'Sop-Stakeholder');
	}

	applyPortSearchFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.sopPortColl.filter = filterValue.trim().toLowerCase();
	}

	tabChanged(tabChangeEvent: MatTabChangeEvent): void {
		if (tabChangeEvent.index == 0) {
			this.sopPortColl.data = [];
			this.getSopPortList();
			this.showPorts = true;
		} else {
			this.stakeholderTypes = [];
			this.sopStakeholderColl.data = [];
			this.getSOPStakeholderList();
			this.showPorts = false;
		}
	}

	changeTab(index, showport) {
		this.selectedTabIndex = index;
		this.showPorts = showport;
	}

	openFilterOptions() {
		this.sopStakeholderColl.filteredData = this.sopStakeholderColl.data;
		this.isOpenFilter = !this.isOpenFilter;
	}

	updateSelectAll() {
		if (this.isAllSelected) {
			this.stakeholderTypes.map((x) => {
				x.type_check = true;
			})
		} else {
			this.stakeholderTypes.map((x) => {
				x.type_check = false;
			})
		}
	}

	clearAllSelected() {
		this.isAllSelected = false;
		this.stakeholderTypes.map((x) => {
			x.type_check = false;
		})
	}

	async getEventsSubModulesWise(){
		let param = {
			company_id : this.sop.principal_id,
			sub_module_name : 'Stakeholders'
			// sub_module_name : this.router.url.replace('/nav/soplanding/sop', '')
		}
		let result = await this.authService.getEventsSubModulesWise({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			this.accessibleEvents.length == 0 ? this.permissionDenied = true : this.permissionDenied = false;
			if(result.result[0].event_names){
				this.accessibleEvents = result.result[0].event_names;
				this.isEventDisable = false;
			}
			this.accessibleEvents.map((res) =>{
				this.isAccessible[res.event_name] = res.status;
			})
			if(this.isAccessible['VIEW_PORT_PAIR']){
				this.showPorts = true;
				this.selectedTabIndex = 0;
			}
			else if(this.isAccessible['STAKEHOLDER_MAP_CONTRACT']){
				this.showPorts = false;
				this.selectedTabIndex = 1;
			}
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async getCompanyTypeList() {
		this.stakeholderTypes = [];
		let result = await this.authService.getCompanyTypeList();
		if (result.success) {
			this.sopStakeholderColl.data.map((x) => {
				this.stakeholderTypesIds.push(x.company_type_id);
			})
			result.result.map((id) => {
				if (this.stakeholderTypesIds.includes(id.lookup_id)) {
					this.stakeholderTypes.push(id);
				}
			})
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	saveFilterOptions() {
		var selectedTypes = [];
		this.stakeholderTypes.map((type) => {
			if (type.type_check == true) {
				selectedTypes.push(type.lookup_id);
			}
		})
		this.sopStakeholderColl.filteredData = [];
		this.sopStakeholderColl.data.map((x) => {
			if (selectedTypes.includes(x.company_type_id)) {
				this.sopStakeholderColl.filteredData.push(x);
			}
		})
		this.isOpenFilter = false;
	}

	updateTypeCheck() {
		this.isAllSelected = this.stakeholderTypes != null && this.stakeholderTypes.every(t => t.type_check);
	}

	validateFilterSave() {
		let disable = true;
		this.stakeholderTypes.filter(t => t.type_check).length == 0 ? disable = true : disable = false;
		return disable;
	}
	
	async setSopPortListSorting() {
		this.sopPortColl.sort = this.sort;
	}

	async getSopPortList() {
		this.isLoading = true;
		let param = {
			sop_id: this.sop.sop_id,
		}
		let result = await this.authService.getSopPortList({ param: this.reusable.encrypt(JSON.stringify(param)) });
		this.isLoading = false;
		if (result.success) {
			this.port_count = result.rowCount;
			result.rowCount > 0 ? this.isDisabled = false : this.isDisabled = true;
			this.sopPortColl = new MatTableDataSource(result.result);
			//this.sopPortColl.sort = this.sort;
			if (result.rowCount > 0) {
				this.countryIds = [...new Set((this.sopPortColl.data.map(({ origin_country_id }) => origin_country_id)))];
				let destCountryIds = [...new Set((this.sopPortColl.data.map(({ dest_country_id }) => dest_country_id)))];
				destCountryIds.map(id => {
					if (this.countryIds.indexOf(id) == -1) {
						this.countryIds.push(id);
					}
				})
				if (this.countryIds.length > 0) {
					this.getSOPStakeholderList();
				}
			}
			this.setSopPortListSorting();
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	private _filter(portName: string): ClassPorts[] {
		const filterValue = portName.toLowerCase();
		let returnValue = this.portColl.filter(option => option.portwithregion.toLowerCase().replace(/ /g, '').indexOf(filterValue) >= 0);
		if (this.form.get("OriginPort").value != undefined) {
			this.form.get("OriginPort").value.map(value => {
				let findVal = returnValue.find(x => x.port_id == value.port_id);
				if (findVal == undefined) {
					returnValue.push(value);
				}
			})
		}
		return returnValue;
	}

	private _filterDP(portName: string): ClassPorts[] {
		const filterValue = portName.toLowerCase();
		let returnValue = this.destPortColl.filter(option => option.portwithregion.replace(/ /g, '').toLowerCase().indexOf(filterValue) >= 0);
		if (this.form.get("DestPort").value != undefined) {
			this.form.get("DestPort").value.map(value => {
				let findVal = returnValue.find(x => x.port_id == value.port_id);
				if (findVal == undefined) {
					returnValue.push(value);
				}
			})
		}
		return returnValue;
	}

	private _filterOP(portName: string): ClassPorts[] {
		const filterValue = portName.toLowerCase();
		let returnValue = this.orgPortColl.filter(option => option.portwithregion.replace(/ /g, '').toLowerCase().indexOf(filterValue) >= 0);
		if (this.form.get("OriginPort").value != undefined) {
			this.form.get("OriginPort").value.map(value => {
				let findVal = returnValue.find(x => x.port_id == value.port_id);
				if (findVal == undefined) {
					returnValue.push(value);
				}
			})
		}
		return returnValue;
	}

	onSelOP() {
		/*Notes: Single select filter operation. */
		//this.destPortColl = this.portColl.filter(x => x.country != this.form.get("OriginPort").value.country);

		/* Notes: multiple select filter operation. */
		this.destPortColl = this.portColl.filter((x) => {
			console.log(this.form.get('DestPort').value)
			return this.form.get("OriginPort").value.every((f: any) => {
				return f.port_id !== x.port_id;
			});
		});

		/* Notes: this is to ensure already added destination ports are not shown in the drop down. */
		this.sopPortColl.data.map(port => {
			this.form.get("OriginPort").value.map(orgPort => {
				let findIdx = this.destPortColl.findIndex(x => x.port_id == port.dest_port_id && port.origin_port_id == orgPort.port_id);
				if (findIdx != -1) {
					this.destPortColl.splice(findIdx, 1);
				}
			})
		})

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
		
		/* Notes: multiple select filter operation. */
		this.orgPortColl = this.portColl.filter((x) => {
			console.log(this.form.get('OriginPort').value)
			return this.form.get("DestPort").value.every((f: any) => {
				return f.port_id !== x.port_id;
			});
		});

		/* Notes: this is to ensure newly added Origin ports are not shown in the drop down. */
		this.sopPortColl.data.map(port => {
			this.form.get("DestPort").value.map(orgPort => {
				let findIdx = this.orgPortColl.findIndex(x => x.port_id == port.dest_port_id && port.origin_port_id == orgPort.port_id);
				if (findIdx != -1) {
					this.orgPortColl.splice(findIdx, 1);
				}
			})
		})
		this.filterPortOP = this.form.get("FilterOP").valueChanges
		.pipe(
			startWith(''),
			map(value => typeof value === 'string' ? value : value != undefined ? value.portwithregion : ''),
			map(name => name ? this._filterOP(name) : this.orgPortColl)
		);
	}

	async getPorts() {
		this.isLoading = true;
		let result = await this.authService.getPorts();
		this.isLoading = false;
		if (result.success) {
			this.portColl = result.result;
			this.form.get('FilterOP').setValue('');
			this.form.get('FilterDP').setValue('');
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error")
		}
	}

	async closeAddPort(){
		this.form.get('OriginPort').setValue(null);
		this.form.get('DestPort').setValue(null);
	}
	
	async addPort() {
		let orgPortIds = [];
		let destPortIds = [];
		this.form.get("OriginPort").value.map(port => {
			orgPortIds.push(port.port_id);
		});
		this.form.get("DestPort").value.map(port => {
			destPortIds.push(port.port_id);
		});
		let param = {
			sop_id: this.sop.sop_id,
			//origin_port_id: this.form.get("OriginPort").value.port_id,
			orgPortIds: orgPortIds,
			destPortIds: destPortIds,
			ff_id: this.sop.ff_id,
			principal_id: this.sop.principal_id,
		}
		let result = await this.authService.addSOPSHPort({ param: this.reusable.encrypt(JSON.stringify(param)) });
		this.isLoading = false;
		if (result.success) {
			this.getSopPortList();
			this.form.get('FilterOP').setValue('');
			this.form.get('FilterDP').setValue('');
			this.form.get('OriginPort').setValue(null);
			this.form.get('DestPort').setValue(null);
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async delSOPPort(ele) {
		let conf = confirm("Are you sure you like to delete this Port Pair?");
		if (!conf) return;
		let param = {
			sop_port_id: ele.sop_port_id,
			sop_id: this.sop.sop_id,
			origin_port_id: ele.origin_port_id
		}
		let result = await this.authService.delSOPPort({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			this.getSopPortList();
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	applyStakeSearchFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.sopStakeholderColl.filter = filterValue.trim().toLowerCase();
	}

	async setSOPStakeholderSorting() {
		this.sopStakeholderColl.sort = this.sort;
	}

	async getSOPStakeholderList() {
		this.isLoading = true;
		let param = {
			principal_id: this.sop.principal_id,
			sop_id: this.sop.sop_id
		}
		let result = await this.authService.getSOPStakeholderList(param);
		if (result.success) {
			this.sopStakeholderColl = new MatTableDataSource(result.result);
			var data = [];
			this.sopStakeholderColl.data.map((sh, i) => {
				this.getCurrentContractByCompanyId(sh);
				if (this.countryIds.includes(sh.country_id) || sh.company_type.toLowerCase() == 'carrier') {
					data.push(sh);
				}
			})
			this.sopStakeholderColl.data = data;

			this.getCompanyTypeList();
			setTimeout(() => {
				let newSopStakeholders = this.sopStakeholderColl.data.filter(x => x.sop_stakeholder_id == undefined && x.contract_id != undefined);
				if (newSopStakeholders.length > 0) this.insNewSOPStakeholders(newSopStakeholders);
			}, 5000);
			this.setSOPStakeholderSorting();
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
		this.isLoading = false;
	}

	async getCurrentContractByCompanyId(stakeholder) {
		let param = {
			pp_id: this.sop.principal_id,
			stakeholder_id: stakeholder.company_id,
			stakeholder_type_id: stakeholder.company_type_id
		}
		let result = await this.authService.getCurrentContractByCompanyId(param);
		if (result.success) {
			if (result.rowCount > 1) {
				stakeholder["contractColl"] = result.result;
				let contract;
				if (stakeholder.contract_id != undefined) {
					contract = stakeholder["contractColl"].find(x => x.contract_id == stakeholder.contract_id);
					stakeholder["contract_id"] = contract.contract_id;
					stakeholder["contract_no"] = contract.contract_no;
					stakeholder["valid_from"] = contract.valid_from;
					stakeholder["valid_to"] = contract.valid_to;
				}
				stakeholder["FrmCntrlContract"] = new FormControl(contract, [Validators.required]);
			}
			else if (result.rowCount == 1) {
				stakeholder["contract_id"] = result.result[0].contract_id;
				stakeholder["contract_no"] = result.result[0].contract_no;
				stakeholder["valid_from"] = result.result[0].valid_from;
				stakeholder["valid_to"] = result.result[0].valid_to;
			}
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async saveSOPStakeHolder(row) {
		if (row.sop_stakeholder_id == undefined) {
			let newSH = [];
			newSH.push({
				company_id: row.company_id,
				company_type_id: row.company_type_id,
				country_id: row.country_id,
				contract_id: row.FrmCntrlContract.value.contract_id
			});
			row.success = await this.insNewSOPStakeholders(newSH);
			if (row.success) {
				row["contract_id"] = row.FrmCntrlContract.value.contract_id;
				row["contract_no"] = row.FrmCntrlContract.value.contract_no;
				row["valid_from"] = row.FrmCntrlContract.value.valid_from;
				row["valid_to"] = row.FrmCntrlContract.value.valid_to;
				this.getSOPStakeholderList();
			}
			else {
				row.err = "Update Failed";
				setTimeout(() => {
					row.err = undefined;
				}, 3000);
			}
		}
		else {
			let param = {
				sop_stakeholder_id: row.sop_stakeholder_id,
				contract_id: row.FrmCntrlContract.value.contract_id
			}
			let result = await this.authService.updSOPStakeholders(param);
			if (result.success) {
				row["contract_id"] = row.FrmCntrlContract.value.contract_id;
				row["contract_no"] = row.FrmCntrlContract.value.contract_no;
				row["valid_from"] = row.FrmCntrlContract.value.valid_from;
				row["valid_to"] = row.FrmCntrlContract.value.valid_to;
			}
			else {
				row.err = "Update Failed";
				setTimeout(() => {
					row.err = undefined;
				}, 3000);
			}
		}
	}

	async insNewSOPStakeholders(newSopStakeholders) {
		let newSH = [];
		newSopStakeholders.map(sh => {
			newSH.push({
				sop_id: this.sop.sop_id,
				stakeholder_id: sh.company_id,
				type_id: sh.company_type_id,
				country_id: sh.country_id,
				contract_id: sh.contract_id,
				created_by: this.userDetails.user_id
			})
		});
		let param = {
			stakeholders: newSH
		}
		let result = await this.authService.insNewSOPStakeholders(param);
		return result.success;
	}

	nextTab() {
		//this request must go to sop-landing and change the tab sequence from there. 
		// this.router.navigate(['/nav/soplanding/sopservices']);
	}
}
