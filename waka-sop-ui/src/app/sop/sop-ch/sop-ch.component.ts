import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, Validators, FormControl, FormBuilder, FormArray } from '@angular/forms';
import { AuthenticationService } from '../../_services/index';
import { ReusableComponent } from '../../reusable/reusable.component';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDropList } from '@angular/cdk/drag-drop';
import { ClassSOPCh, ClassSOPContainer, ClassSOPPOB, ClassTmpGrp } from '../sop-global-class';
import { MatTable } from '@angular/material/table';

@Component({
	selector: 'sop-ch',
	templateUrl: 'sop-ch.html',
	styleUrls: ['./sop-ch.component.css']
})
export class SopChComponent implements OnInit {
	objectKeys = Object.keys;
	objectValues = Object.values;
    isLoading: boolean = false;
    permissionDenied: boolean = false;
    userDetails:any;
    sop:any;
    screen: { width: number; height: number; };

	chGrpParam = {};
	chGrpColl:ClassTmpGrp[] = [];
	chSOPColl:ClassSOPCh[] = [];
	chTemplate:string = 'template1';
	chGrpTitle:string = '';
	fwCP = 'normal';
	colorCP = "var(--lightgray)";
	dispCP = false;
	isClickedCP = false;
	dispLCLCons = false;
	fwLCLCons = 'normal';
	colorLCLCons = "var(--lightgray)";
	lclConsColl = [];
	isClickedLCL = false;
	dispFCLCons = false;
	fwFCLCons = 'normal';
	colorFCLCons = "var(--lightgray)";
	fclConsColl = [];
	isClickedFCL = false;
	containerColl = new MatTableDataSource<ClassSOPContainer>([]);
	sopContainerColl = new MatTableDataSource<ClassSOPContainer>([]);
	tblDispContainer = ["iso_type_code","description","max_cbm","max_weight_kgs"];
	tblSOPDispContainer = ["iso_type_code","description","fcl_min","min_cbm","optimal_cbm","max_cbm", "preference", "edit"];
	fetchedSopContainerIds:number[] = [];
	ContainerTypesColl = [];
	portStorageColl = new MatTableDataSource([]);
	portColumnNames = ["port_name","number_of_free_storage_days","validity_for_free_storage_days"];
	columnNames;
	LCLValidityColl = [];
	pageStartTime: Date;
	pageCurrentUrl: string;
	expandButtonTitle: string = 'Collapse All';
	accessibleSections = [];
	isAccessibleSection = {};
	accessibleEvents = [];
	isAccessibleEvents = [];
	approveEvents = [];
	isEventApprove = {};
	isEventDisable: boolean = true;
	LCLConsSel: boolean = true;
	FCLProSel: boolean = true;
	newInstruction: any;
	instructionType: string = '';

	@ViewChild(MatSort, { static: false }) sort: MatSort;
	@ViewChild('table') table: MatTableDataSource<ClassSOPContainer>;

    constructor (
		private authService: AuthenticationService,
		private reusable: ReusableComponent,
		private router: Router,
		private formBuilder: FormBuilder,
		public dialog: MatDialog,
	) {	}

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
			this.reusable.titleHeader.next("Edit Standard Operating Procedure ("+	this.sop.sop_id+")");
		}
		this.reusable.curRoute.next("/nav/sop");
		this.reusable.headHt.next(60);
		this.reusable.screenChange.subscribe(res => {
			this.screen = { width: res.width-112, height: res.height-150};
		});
		this.checkCreateCHForSOP();
    }

	ngOnDestroy() {
		this.authService.savePageAccess(this.pageStartTime, new Date(), this.pageCurrentUrl, 'Sop-CargoHandling');
	}

	@ViewChild('table2') table2: MatTable<[]>;
	displayedColumns: string[] = ['position', 'container_size', 'max_cbm','lcl_min', 'fcl_min','optimal_cbm', 'max_weight', 'preference', 'delete'];

	getErrorMessage(control, controlName) {
		let msg = '';
		msg += control.hasError('required') ? 'You must enter a value' : '';
		msg += (control.errors.min) ? 'Must be >='+control.errors.min.min : '';
		msg += (control.errors.max) ? 'Must be <= '+control.errors.max.max : '';
		return msg;
	}

	async getEventsSubModulesWise(){
		this.isLoading = true;
		let param = {
			company_id : this.sop.principal_id,
			sub_module_name : 'Cargo Handling',
		}
		let result = await this.authService.getEventsSubModulesWise({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.accessibleSections.length == 0 ? this.permissionDenied = true : this.permissionDenied = false;
			if(result.result[0].event_descriptions && result.result[0].section_names && result.result[0].event_names){
				this.accessibleSections = result.result[0].section_names;
				this.accessibleEvents = result.result[0].event_descriptions;
				this.approveEvents = result.result[0].event_names;
			}
			this.isEventDisable = false;
			this.accessibleSections.map((res) =>{
				this.isAccessibleSection[res.section_name.replaceAll('_',' ')] = res.status;
			});
			this.accessibleEvents.map((res)=>{
				this.isAccessibleEvents.push(res.event_description.toLowerCase());
			});
			this.approveEvents.map((res)=>{
				this.isEventApprove[res.event_name] = res.status;
			});
			let index = 0;
			let isGrpcoll = false;
			for (let idx in this.chGrpColl){
				let data = this.accessibleSections.filter(value => value.section_name.replaceAll('_',' ') == this.chGrpColl[idx].grp);
				if(data.length>0){
					isGrpcoll = true;
					index = parseInt(idx);
					break;
				}
			}
			if(isGrpcoll){
				this.onClickChGrp(index,this.chGrpColl[index].grp);
			}
			else{
				if(this.isAccessibleSection['Container Preference']){
					this.onClickCP();
				}
				else if(this.isAccessibleSection['LCL Consolidation']){
					this.onClickLCLCons();
				}
				else{
					this.onClickFCLCons();
				}
			}
			this.isLoading = false;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async updateContainerItem(element){
		let result = await this.authService.updSOPCHOptimalValue({param:this.reusable.encrypt(JSON.stringify(element))});
		if (result.success) {
			
		} 
		else {
			
		}
	}

	checkAllowedValues(event, element) {
		let maxValue = parseFloat(event.target.max);
		let minValue = parseFloat(event.target.min);
		if((event.keyCode >= 48 && event.keyCode <= 57) || event.keyCode == 190) {
			console.log('first', event.target.name)
			if(event.target.value >= minValue && event.target.value <= maxValue){
				element[event.target.name] = event.target.value
			} else {
				(event.target.value > maxValue / 2) ? element[event.target.name] = maxValue : element[event.target.name] = minValue;
			}
		} else {
			let val = event.target.value.match(/(\d+)/);
			event.target.value = val[0];
		}
	}

	async updSOPCHIsSelected(grid){
		grid.is_selected = !grid.is_selected;
		let param = {
			sop_ch_id: grid.sop_ch_id,
			is_selected: grid.is_selected
		};
		let result = await this.authService.updSOPCHIsSelected({param:this.reusable.encrypt(JSON.stringify(param))});
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

	// async updCHFieldValue(idx, field, grid){
	// 	console.log(field);
	// 	let param = {
	// 		fields : JSON.stringify(grid.fields),
	// 		sop_ch_id: grid.sop_ch_id
	// 	};
	// 	let result = await this.authService.updSOPCHfields({param:this.reusable.encrypt(JSON.stringify(param))});
	// 	if (result.success){
	// 		field["status"] = "Update Successful";
	// 	} 
	// 	else {
	// 		field["status"] = "Update Failed";
	// 	}
	// 	setTimeout(() => {
	// 		field["status"] = undefined;
	// 	}, 1500);
	// }

	async updCHFieldValue(idx, field, grid){
		let valCheck;
		if(field.controlname == 'CRLCLRCAQVRFROM'|| field.controlname == 'CRLCLRCAQVRTo') {
			valCheck = grid.fields[1].field0.field
		} else {
			valCheck = grid.fields[0].field0.field
		}
		let result;
		let minMaxVal = [];
		if (grid.control_name == 'CRLCLRecvCond') {
			valCheck.map((x)=>{ minMaxVal.push(x.value); })
		}
		let param = {
			fields : JSON.stringify(grid.fields),
			sop_ch_id: grid.sop_ch_id
		};
		if (grid.control_name == 'CRLCLRecvCond' && minMaxVal[0] > minMaxVal[1]) {
			field["status"] = "Update Failed - Please check your input";
		} else if (grid.control_name == 'CRLCLRecvCond' && minMaxVal[0] < minMaxVal[1]) {
			result = await this.authService.updSOPCHfields({param:this.reusable.encrypt(JSON.stringify(param))});
			if (result.success){
				field["status"] = "Update Successful";
			} 
			else {
				field["status"] = "Update Failed";
			}
		} else {
			result = await this.authService.updSOPCHfields({param:this.reusable.encrypt(JSON.stringify(param))});
			if (result.success){
				field["status"] = "Update Successful";
			} 
			else {
				field["status"] = "Update Failed";
			}
		}
		setTimeout(() => {
			field["status"] = undefined;
		}, 1500);
	}

	async checkCreateCHForSOP(){
		this.isLoading = true;
		let param = {
			sop_id : this.sop.sop_id
		}
		let result = await this.authService.checkCreateCHForSOP({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.getCHGrp();
			this.isLoading = false;
		} 
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async getCHGrp(){
		this.isLoading = true;
		let result = await this.authService.getCHGrp();
		if (result.success){
			this.chGrpColl = result.result;
			this.chGrpColl.map((grp,i)=>{
				this.chGrpParam[i] = {color:"var(--lightgray)", disp:false, fw:"normal", isClicked:false};
			});
			this.getEventsSubModulesWise();
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
		this.isLoading = false;
	}

	onClickCP(){
		this.chTemplate ="none";
		this.chGrpColl.map((group,ix)=>{
			if (this.chGrpParam[ix]["disp"] || this.chGrpParam[ix]["isClicked"]) this.chGrpParam[ix] = {color:"var(--green)", disp:false, fw:"normal",isClicked:true};
			else {
				this.chGrpParam[ix]["color"] = "var(--lightgray)";
				this.chGrpParam[ix]["disp"] = false;
				this.chGrpParam[ix]["fw"] = "normal";
			} 
		});
		if (this.dispFCLCons || this.isClickedFCL){
			this.colorFCLCons = 'var(--green)';
			this.dispFCLCons = false;
			this.fwFCLCons = "normal";
		}
		else {
			this.colorFCLCons = 'var(--lightgray)';
			this.dispFCLCons = false;
			this.fwFCLCons = "normal";
		}
		if (this.dispLCLCons || this.isClickedLCL){
			this.colorLCLCons = 'var(--green)';
			this.dispLCLCons = false;
			this.fwLCLCons = "normal";
		}
		else {
			this.colorLCLCons = 'var(--lightgray)';
			this.dispLCLCons = false;
			this.fwLCLCons = "normal";
		}
		this.colorCP = 'var(--active)';
		this.dispCP = true;
		this.fwCP = "600";
		this.isClickedCP = true;
		this.getSOPContainer();
	}

	async onClickLCLCons(){
		this.instructionType = 'LCL Consolidation';
		this.chTemplate ="none";
		this.chGrpColl.map((group,ix)=>{
			if (this.chGrpParam[ix]["disp"] || this.chGrpParam[ix]["isClicked"]) this.chGrpParam[ix] = {color:"var(--green)", disp:false, fw:"normal",isClicked:true};
			else {
				this.chGrpParam[ix]["color"] = "var(--lightgray)";
				this.chGrpParam[ix]["disp"] = false;
				this.chGrpParam[ix]["fw"] = "normal";
			} 
		});
		if (this.dispFCLCons || this.isClickedFCL){
			this.colorFCLCons = 'var(--green)';
			this.dispFCLCons = false;
			this.fwFCLCons = "normal";
		}
		else {
			this.colorFCLCons = 'var(--lightgray)';
			this.dispFCLCons = false;
			this.fwFCLCons = "normal";
		}
		if (this.dispCP || this.isClickedCP){
			this.colorCP = 'var(--green)';
			this.dispCP = false;
			this.fwCP = "normal";
		}
		else {
			this.colorCP = 'var(--lightgray)';
			this.dispCP = false;
			this.fwCP = "normal";
		}
		this.colorLCLCons = 'var(--active)';
		this.dispLCLCons = true;
		this.fwLCLCons = "600";
		this.isClickedLCL = true;
		// this.getSOPLCLCons();
		let param = {
			sop_id : this.sop.sop_id,
			instruction_type: this.instructionType,
		}
		let result = await this.authService.checkCreateCommIns(param);
		if (result.success){
			this.getSOPLCLCons();
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async onClickFCLCons(){
		this.instructionType = 'FCL Program';
		this.chTemplate ="none";
		this.chGrpColl.map((group,ix)=>{
			if (this.chGrpParam[ix]["disp"] || this.chGrpParam[ix]["isClicked"]) this.chGrpParam[ix] = {color:"var(--green)", disp:false, fw:"normal", isClicked:true};
			else {
				this.chGrpParam[ix]["color"] = "var(--lightgray)";
				this.chGrpParam[ix]["disp"] = false;
				this.chGrpParam[ix]["fw"] = "normal";
			} 
		});
		if (this.dispLCLCons || this.isClickedLCL){
			this.colorLCLCons = 'var(--green)';
			this.dispLCLCons = false;
			this.fwLCLCons = "normal";
		}
		else {
			this.colorLCLCons = 'var(--lightgray)';
			this.dispLCLCons = false;
			this.fwLCLCons = "normal";
		}
		if (this.dispCP || this.isClickedCP){
			this.colorCP = 'var(--green)';
			this.dispCP = false;
			this.fwCP = "normal";
		}
		else {
			this.colorCP = 'var(--lightgray)';
			this.dispCP = false;
			this.fwCP = "normal";
		}
		this.colorFCLCons = 'var(--active)';
		this.dispFCLCons = true;
		this.fwFCLCons = "600";
		// this.getSOPFCLCons();
		let param = {
			sop_id : this.sop.sop_id,
			instruction_type: this.instructionType,
		}
		let result = await this.authService.checkCreateCommIns(param);
		if (result.success){
			this.getSOPFCLCons();
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async getSopPortFreeStorageDetails(){
		let param = {
			sop_id: this.sop.sop_id,
			reqType: 'Portal'
		}
		let result = await this.authService.getSopPortFreeStorageDetails(param);
		if (result.success && result.rowCount > 0){
			this.portStorageColl = new MatTableDataSource(result.result);
		}
		else if (!result.success) {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error")
		}
	}

	async getLCLValidity() {
		let result = await this.authService.getLCLValidity();
		if (result.success) {
			this.LCLValidityColl = result.result;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async updateLCLValidity(element) {
		let param = {
			free_storage_days_validity: element.free_storage_days_validity,
			sop_opd_id: element.sop_opd_id,
			sop_id: this.sop.sop_id
		}
		let result = await this.authService.addSopPortFreeStorageValidity(param);
		if (!result.success) {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error")
		}
	}

	async updateFreeStorageDays(element) {
		let param = {
			free_storage_days: element.free_storage_days,
			sop_opd_id: element.sop_opd_id,
			sop_id: this.sop.sop_id
		}
		let result = await this.authService.addSopPortFreeStorageDays(param);
		if (!result.success) {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error")
		}
	}

	capitalize(s: string): string {
		return s.replace(/_/gi, ' ');
	}

	async getSOPFCLCons(){
		let param = {
			sop_id: this.sop.sop_id,
			instruction_type: this.instructionType
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
			sop_id: this.sop.sop_id,
			instruction_type:  this.instructionType
		}
		let result = await this.authService.getSOPCommunication(param);
		if (result.success){
			this.lclConsColl = result.result;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error")
		}
	}

	async addremoveCommunicationIns(grid) {
		if(grid.is_selected) {
			let conf =confirm("Are you sure you like to remove this instruction?");
			if (!conf) return;
		}
		grid.is_selected = !grid.is_selected;
		let param = {
			sop_communication_id: grid.sop_communication_id,
			is_selected: grid.is_selected
		}
		let result = await this.authService.addremoveCommunicationIns({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.instructionType  == 'LCL Consolidation' ? this.getSOPLCLCons() : this.getSOPFCLCons;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async delCommunicationIns(grid) {
		let conf =confirm("Are you sure you want to delete this instruction?");
		if (!conf) return;
		let param = {
			sop_communication_id: grid.sop_communication_id,
		}
		let result = await this.authService.delSOPCommunication({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.instructionType  == 'LCL Consolidation' ? this.getSOPLCLCons() : this.getSOPFCLCons();
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async onClickChGrp(idx,grp){
		if (this.dispCP){
			this.colorCP = "var(--green)";
			this.dispCP = false;
			this.fwCP = "normal";
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
			sop_id:this.sop.sop_id
		};
		let result = await this.authService.getSOPCHForGroup({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.expandButtonTitle = 'Collapse All';
			this.dispFCLCons = false;
			this.dispLCLCons = false;
			let resp = result.result;
			resp.map(ch => {
				if (this.isAccessibleEvents.some(v => v.includes(ch.ch_name.toLowerCase() + ' enable'))) {
					ch['is_enable'] = true;
				}
				else{
					ch['is_enable'] = false;
				}
				ch.fields.map(fld =>{
					if(fld.group != '' && fld.group!= null){
						if (this.isAccessibleEvents.some(v => v.includes(fld.group.toLowerCase()))) {
							fld['is_accessible'] = true;
						} 
						else{
							fld['is_accessible'] = false;
						}
					}
					else if(fld.group == null){
						fld.field0.field.map(f =>{
							if (this.isAccessibleEvents.some(v => v.includes(f.fieldname.toLowerCase()))) {
								f['is_accessible'] = true;
								fld['is_accessible'] = true;
							} 
							else{
								f['is_accessible'] = false;
								fld['is_accessible'] = false;
							}
						})
					}
					else{
						fld['is_accessible'] = true;
						fld.field0.field.map(f =>{
							if (this.isAccessibleEvents.some(v => v.includes(f.fieldname.toLowerCase()))) {
								f['is_accessible'] = true;
							} 
							else{
								f['is_accessible'] = false;
							}
						})
					}
				});
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
				if (ch.ui_img_file_name != undefined){
					ch.img_url = "url('../../assets/image/"+ch.ui_img_file_name+"')";
					let split = ch.ui_img_file_name.split('.');
					ch.img_url_grey = "url('../../assets/image/"+split[0]+'_grey.'+split[1]+"')";
				}
				ch.expand = ch.is_enable ? ch.is_selected : !ch.is_selected;			
			});
			this.chSOPColl = resp;
		} 
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
		this.getLCLValidity();
		this.getSopPortFreeStorageDetails();
	}

	expandCollapseAll(){
		if(this.expandButtonTitle == 'Collapse All'){
			this.chSOPColl.map((ch)=>{
				ch.expand = false;
			})
			this.expandButtonTitle = 'Expand All';
		} else {
			this.chSOPColl.map((ch)=>{
				ch.expand = ch.is_selected;
			})
			this.expandButtonTitle = 'Collapse All';
		}
	}

	async getSOPContainer(){
		let param = {
			sop_id: this.sop.sop_id
		}
		let result = await this.authService.getSOPContainer({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			let container = result.result.filter(x=>x.sop_container_id == undefined);
			let sopContainer = result.result.filter(x=>x.sop_container_id != undefined);
			this.containerColl = new MatTableDataSource<ClassSOPContainer>(container);
			this.fetchedSopContainerIds = [];
			sopContainer.map(container => {
				this.fetchedSopContainerIds.push(container.sop_container_id);
				// if (container.lcl_min == undefined && container.optimal_cbm == null && container.fcl_min== null) {
				// 	container.is_valid = false;
				// 	container.lcl_min = 0;
				// 	container.optimal_cbm = 0;
				// 	container.fcl_min = 0;
				// } else {
				// 	container.is_valid = true;
				// }
			});
			this.sopContainerColl = new MatTableDataSource<ClassSOPContainer>(sopContainer);
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	dragDrop(event: CdkDragDrop<ClassSOPContainer[]>){
		// const previousIndex = this.containerColl.data.findIndex(row => row === event.item.data);
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
		  this.containerColl.data = [...this.containerColl.data];
		  this.sopContainerColl.data = [...this.sopContainerColl.data];
		  this.savePref(reOrder);
	}

	//NOT IN USE FROM 18-NOV-2021
	// async savePref(){
	// 	let currentContainerIds = []
	// 	this.sopContainerColl.data.map((cont,ix)=>{
	// 		this.validateInput(ix,cont);
	// 		if (cont.sop_container_id != undefined) currentContainerIds.push(cont.sop_container_id);
	// 	});
	// 	let errors = this.sopContainerColl.data.filter(x=>x["errMsg"] != undefined);
	// 	if (errors.length > 0) {
	// 		return;
	// 	}
	// 	let insColl = this.sopContainerColl.data.filter(x=>x.sop_container_id == undefined);
	// 	let updColl = this.sopContainerColl.data.filter(x=>x.sop_container_id != undefined);
	// 	let removedColl = this.fetchedSopContainerIds.filter(x => currentContainerIds.indexOf(x)==-1);
	// 	let msg = '';
	// 	if (insColl.length > 0){
	// 		let param = {
	// 			data: JSON.stringify(insColl),
	// 			sop_id: this.sop.sop_id
	// 		}
	// 		let result = await this.authService.insSOPContainer({param:this.reusable.encrypt(JSON.stringify(param))});
	// 		if (!result.success){
	// 			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
	// 		} else {
	// 			msg += "Successfully added SOP Container Preference";
	// 		}
	// 	}
	// 	if (updColl.length > 0){
	// 		updColl.map(ele=>{
	// 			let arrPort = ele.port_id_exception;
	// 			let updArrPort = "{}";
	// 			if (arrPort.length >0){
	// 				updArrPort ="{";
	// 				arrPort.map((p,i)=>{
	// 					if (i!=0) updArrPort += ','
	// 					updArrPort += p;
	// 				})
	// 				updArrPort += "}";
	// 			}
	// 			ele.port_id_exception = updArrPort;
	// 		});
	// 		let param = {
	// 			data: updColl,
	// 			sop_id: this.sop.sop_id
	// 		}
	// 		let result = await this.authService.updSOPContainer({param:this.reusable.encrypt(JSON.stringify(param))});
	// 		if (result.success){
	// 			msg += " Successfully updated SOP Container Preference";
	// 		}
	// 		else {
	// 			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
	// 		}
	// 	}
	// 	if (removedColl.length > 0){
	// 		let param = {
	// 			removedContainerIds: removedColl
	// 		}
	// 		let result = await this.authService.removeSOPContainer({param:this.reusable.encrypt(JSON.stringify(param))});
	// 		if (result.success){
	// 			msg += " Successfully removed SOP Container Preference";
	// 		}
	// 		else {
	// 			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
	// 		}
	// 	}
	// 	if (msg.length > 95){
	// 		this.reusable.openAlertMsg("Successfully added/updated/removed SOP Container", "info");
	// 	}
	// 	else if (msg.length > 46 && msg.length < 95) {
	// 		if (msg.includes("removed") && msg.includes("updated"))
	// 			this.reusable.openAlertMsg("Successfully updated/removed SOP Container", "info");
	// 		else if (msg.includes("removed") && msg.includes("added"))
	// 			this.reusable.openAlertMsg("Successfully added/removed SOP Container", "info");
	// 		else
	// 			this.reusable.openAlertMsg("Successfully added/updated SOP Container", "info");
	// 	}
	// 	else if (msg.length>0 && msg.length < 50){
	// 		this.reusable.openAlertMsg(msg, "info");
	// 	}
	// 	this.getSOPContainer();
	// }

	async savePref(reOrder){
		this.sopContainerColl.data.map((x, i)=>{ x.preference = i + 1 });
		let newPref = this.sopContainerColl.data.filter(x=>x.sop_container_id == undefined);
		let removedPref = this.containerColl.data.filter(x=>x.sop_container_id != undefined);
		if (newPref.length > 0 || reOrder) {
			let param = {
				data: JSON.stringify(this.sopContainerColl.data),
				sop_id: this.sop.sop_id
			}
			let result = await this.authService.insSOPContainer({param:this.reusable.encrypt(JSON.stringify(param))});
			if (!result.success){
				this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
			}
		} else if (removedPref.length > 0) {
			let param = {
				sop_container_id: removedPref[0].sop_container_id,
				sop_id: this.sop.sop_id
			}
			let result = await this.authService.removeSOPContainer({param:this.reusable.encrypt(JSON.stringify(param))});
			if (!result.success){
				this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
			}
		}
		this.getSOPContainer();
	}

	async delPref(ele){
		let conf = confirm("Are you sure you like to delete this container size preference?");
		if (!conf) return;
		let param = {
			sop_container_id: ele.sop_container_id,
			sop_id: this.sop.sop_id
		}
		let result = await this.authService.removeSOPContainer({param:this.reusable.encrypt(JSON.stringify(param))});
		if (!result.success){
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		} else {
			this.reusable.openAlertMsg('Successfully removed SOP Container', "info");
			this.getSOPContainer();
		}
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

	async addCommunicationIns() {
		let param = {
			instruction : this.newInstruction,
			instruction_type: this.instructionType,
			sop_id: this.sop.sop_id,
			is_selected: this.LCLConsSel,
			communication_id: null,
		}
		console.log('param',param)
		let result = await this.authService.insSOPCommunication({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.newInstruction = '';
			this.LCLConsSel = false;
			this.instructionType  == 'LCL Consolidation' ? this.getSOPLCLCons() : this.getSOPFCLCons();
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	//not in use
	async saveCommunication(grid, instructionType,key){
		if (key != 'Enter' && key != undefined) return;
		if ((this.newInstruction == undefined || this.newInstruction.trim().length == 0) && grid == undefined) {
			return;
		} 
		let instruction = grid != undefined ? grid.instruction : this.newInstruction;
		let communicationId = grid != undefined ? grid.communication_id : undefined;
		let param = {
			sop_id: this.sop.sop_id,
			instruction: instruction,
			communication_id: communicationId,
			instruction_type: instructionType
		}
		let result = await this.authService.insSOPCommunication({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			if (grid != undefined) grid["sop_communication_id"] = result.result[0].sop_communication_id;
			else {
				if (instructionType == "FCL Program"){
					this.fclConsColl.push({sop_communication_id:result.result[0].sop_communication_id,sop_id:this.sop.sop_id,instruction:this.newInstruction,communication_id:undefined,is_selected:true,instruction_type:instructionType});
				}
				else {
					this.lclConsColl.push({sop_communication_id:result.result[0].sop_communication_id,sop_id:this.sop.sop_id,instruction:this.newInstruction,communication_id:undefined,is_selected:true,instruction_type:instructionType});

				}
			}
			this.newInstruction = undefined;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	//not  in use
	async removeComm(grid,ix){
		let conf =confirm("Are you sure you like to remove this instruction?");
		if (!conf) return;
		if (grid.sop_communication_id == undefined){
			if (grid.instruction_type == "LCL Consolidation") this.lclConsColl.splice(ix,1);
			else this.fclConsColl.splice(ix,1);
			return;
		}
		let param = {
			sop_communication_id: grid.sop_communication_id
		}
		let result = await this.authService.delSOPCommunication({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			grid["msg"] = "Successfully removed the instruction";
			if (grid.communication_id == undefined){
				if (grid.instruction_type == "LCL Consolidation") this.lclConsColl.splice(ix,1);
				else this.fclConsColl.splice(ix,1);
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

	// async getSOPContainerTypes(){
	// 	let result = await this.authService.getSOPContainerTypes();
	// 	if (result.success){
	// 		//let container = this.sopContainerColl.data.filter(x=>x.container_id == result.result);
	// 		let data = result.result.map((y)=>{
	// 			this.sopContainerColl.data.filter(x=>x.container_id == y.container_id);
	// 		});
	// 		//this.ContainerTypesColl = result.result;
	// 		console.log("ContainerTypesColl",data);
	// 	}
	// 	else {
	// 		this.reusable.openAlertMsg(this.authService.invalidSession(result),"error")
	// 	}
	// }

	addNewFCLInst(){
		this.fclConsColl.push({
			communication_id: null,
			edit: true,
			instruction: "",
			is_selected: true,
			sop_communication_id: null,
			sop_id: this.sop.sop_id,
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
			sop_id: this.sop.sop_id,
			focus:true
		});
		setTimeout(() => {
			let htmlEle = document.getElementById('inst'+(this.lclConsColl.length-1));
			htmlEle.focus();
		}, 500);
	}

}

/* Cargo Handling Edit Dialog for a content inside a group */
@Component({
	selector: 'ch-sop-edit',
	templateUrl: 'ch-sop-edit-dialog.html',
	styleUrls: ['./sop-ch.component.css']
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
