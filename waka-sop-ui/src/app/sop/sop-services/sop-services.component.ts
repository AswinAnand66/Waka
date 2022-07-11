import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../_services/index';
import { ReusableComponent } from '../../reusable/reusable.component';
import { FlexAlignStyleBuilder } from '@angular/flex-layout';

@Component({
	selector: 'sop-services',
	templateUrl: 'sop-services.html',
	styleUrls: ['./sop-services.component.css']
})
export class SopServicesComponent implements OnInit {
	objectKeys = Object.keys;
	objectValues = Object.values;
    isLoading: boolean = false;
    isDataLoading: boolean = false;
    userDetails:any;
    sop:any;
    screen: { width: number; height: number; };
	serviceNameColl = ["Selected services will be handled by the Freight Forwarder at the origin","Selected vendor services will be handled by the Freight Forwarder","Selected service will be handled by the Freight Forwarder","Selected service will be handled by the Freight Forwarder","Selected services will be handled by the Freight Forwarder at the destination","Selected services will be tracked on the platform",""];
	serviceName: string;
	othServices = [];
	othServiceColor = [];
	serviceTypes = [];
	serviceTypeColl = {};
	selType: string;
	selTypeEvent: string;
	communicationColl = [];
	shipmentTrackingColl = [];
	serviceSaveFlag = true;
	timerServiceSave:any;
	newInstruction: string;
	newShipmentTrackingIns: string;
	pageStartTime: Date;
	pageCurrentUrl: string;
	accessibleSections = [];
	isAccessibleSection = {};
	accessibleEvents = [];
	isAccessibleEvents = {};
	isEventDisable: boolean = true;
	commInsSel: boolean = true;
	openCommunicationSection: boolean = false;
	
    constructor (
		private authService: AuthenticationService,
		private reusable: ReusableComponent,
		private router: Router,
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
		this.reusable.headHt.next(60);
		this.reusable.screenChange.subscribe(res => {
			this.screen = { width: res.width-112, height: res.height-140};
		});
		this.reusable.curRoute.next("/nav/sop");
		if (this.sop == undefined) this.reusable.titleHeader.next("Standard Operating Procedure");
		else {
			this.reusable.titleHeader.next("Edit Standard Operating Procedure ("+	this.sop.sop_id+")");
		}
		this.getSOPServices();
    }

	

	isOpened(){
		console.log("isOpened");
	}

	async getEventsSubModulesWise(){
		this.isLoading = true;
		let param = {
			company_id : this.sop.principal_id,
			sub_module_name : 'Services Instruction',
		}
		let result = await this.authService.getEventsSubModulesWise({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.isEventDisable = false;
			if(result.result[0].event_descriptions && result.result[0].section_names){
				this.accessibleSections = result.result[0].section_names;
				this.accessibleEvents = result.result[0].event_names;
			}
			this.accessibleSections.map((res) =>{
				this.isAccessibleSection[res.section_name.toLowerCase().replaceAll('_instruction','')] = res.status;
			});
			this.accessibleEvents.map((res)=>{
				this.isAccessibleEvents[res.event_name] = res.status;
			})
			let index = 0;
			if(result.result[0].event_descriptions != null && result.result[0].section_names != null){
				for (let idx in this.othServices){
					let data = this.accessibleSections.filter(value => value.section_name.toLowerCase().replaceAll('_instruction','') == this.othServices[idx].toLowerCase().replaceAll(' ','_'));
					if(data.length>0){
						index = parseInt(idx);
						break;
					}
				}
				this.onClickOthSer(index,this.othServices[index]);
			}
			this.isLoading = false;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async getSOPServices(){
		this.isLoading = true;
		let param = {
			sop_id: this.sop.sop_id,
		}
		let result = await this.authService.getSOPServices(param);
		if (result.success){
			/* beloiw changes done due to change of services as new submodule for admin*/
			// this.othServices = [...new Set(result.result.map(({service_type})=>service_type))];
			this.othServices = ['Origin Logistics Services', 'Destination Services', 'Shipment Tracking Services', 'Communication']
			// this.othServices.push("Communication Instructions")
			this.othServices.map((oc,i)=>{
				this.othServiceColor[i] = {color:"var(--lightgray)", disp:false, fw:'normal', isClicked: false};
				// this.serviceTypeColl[oc] = result.result.filter(x => x.service_type == oc);
				this.serviceTypeColl[oc] = [];
			});
			this.isLoading = false;
			this.getEventsSubModulesWise();
		}
	}

	async onClickOthSer(idx,selService){
		this.othServices.map((oc,ix)=>{
			if (idx == ix){
				this.othServiceColor[idx] = {color:"var(--active)", disp:true, fw:600, isClicked: true};
			} else {
				if (this.othServiceColor[ix]["disp"] || this.othServiceColor[ix]["isClicked"]) this.othServiceColor[ix] = {color:"var(--green)", disp:false, fw:"normal", isClicked:true};
				else {
					this.othServiceColor[ix]["color"] = "var(--lightgray)";
					this.othServiceColor[ix]["disp"] = false;
					this.othServiceColor[ix]["fw"] = "normal";
				}
			}
		});
		this.selType = selService;
		var matches = this.selType.match(/\b(\w)/g);
		this.selTypeEvent = matches.join('') + 'I_CREATE';
		this.serviceName = this.serviceNameColl[idx];
		let selectedType = this.selType.toLowerCase().replace(/[^a-zA-Z]/g, "");
		if(selectedType.includes('originlogistics') || selectedType.includes('communication') || selectedType.includes('destination')  || selectedType.includes('shipmenttracking')) {
			this.isDataLoading = true;
			this.communicationColl = [];
			this.openCommunicationSection = true;
			let param = {
				sop_id : this.sop.sop_id,
				instruction_type: this.selType.toLowerCase(),
			}
			let result = await this.authService.checkCreateCommIns(param);
			if (result.success){
				this.getSOPCommunication();
			}
			else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
			}
		} else {
			this.openCommunicationSection = false;
		}
		// if (this.selType == "Communication Instructions"){
		// 	let param = {
		// 		sop_id : this.sop.sop_id,
		// 		instruction_type: 'communication',
		// 	}
		// 	let result = await this.authService.checkCreateCommIns(param);
		// 	if (result.success){
		// 		this.getSOPCommunication();
		// 	}
		// 	else {
		// 		this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		// 	}
		// }
		if(this.selType == 'Shipment Tracking Services'){
			this.getShipmentTrackingIns();
		}	
	}

	async getSOPCommunication() {
		let param = {
			sop_id : this.sop.sop_id,
			instruction_type: this.selType.toLowerCase(),
		}
		let result = await this.authService.getSOPCommunication(param);
		if (result.success){
			var matches = this.selType.match(/\b(\w)/g);
			var del_event_name = matches.join('') + 'I_DELETE';
			var add_rem_event_name = matches.join('') + 'I_ADD_REMOVE';
			result.result.map((res)=> {
				let delData = this.accessibleEvents.filter(val => val.event_name == del_event_name);
				res['delete_access'] = delData[0] != null ? delData[0].status : false;
				let delData_1 = this.accessibleEvents.filter(val => val.event_name == add_rem_event_name);
				res['add_remove_access'] = delData_1[0] != null ? delData_1[0].status : false;
			})
			this.communicationColl = result.result;

			this.isDataLoading = false;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async getShipmentTrackingIns(){
		let param = {
			sop_id : this.sop.sop_id,
		}
		let result = await this.authService.getShipmentTrackingIns(param);
		if (result.success){
			this.shipmentTrackingColl = result.result;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}
	
	async insShipmentTrackingIns(event){
		if(event.key == 'Enter'){
			let param = {
				sop_id : this.sop.sop_id,
				instruction: this.newShipmentTrackingIns,
				is_selected: true,
			}
			let result = await this.authService.insShipmentTrackingIns(param);
			if (result.success){
				this.newShipmentTrackingIns = null;
				this.getShipmentTrackingIns();
			}
			else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
			}
		}
		
	}

	async updShipmentTrackingIns(grid){
		grid.is_selected= !grid.is_selected;
		let param = {
			sop_sts_id : grid.sop_sts_id,
			is_selected : grid.is_selected,
			sop_id : this.sop.sop_id,
		}
		let result = await this.authService.updShipmentTrackingIns(param);
		if (result.success){
			this.getShipmentTrackingIns();
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}
	
	selParService(){
		this.serviceSaveFlag = false;
		if(this.timerServiceSave == undefined) {
			this.timerServiceSave = setInterval(() => {
				this.saveService();
			}, 5000);
		}
	}

	async addCommunicationIns(keyEvent: KeyboardEvent) {
		if(keyEvent.key == 'Enter') {
			keyEvent.preventDefault();
			let param = {
				instruction : this.newInstruction.trim(),
				instruction_type: this.selType.toLowerCase(),
				sop_id: this.sop.sop_id,
				is_selected: this.commInsSel,
				communication_id: null,
			}
			let result = await this.authService.insSOPCommunication({param:this.reusable.encrypt(JSON.stringify(param))});
			if (result.success){
				this.newInstruction = '';
				this.getSOPCommunication();
			}
			else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
			}
		}
	}
	
	async saveCommunication(grid, instructionType, key){
		if(typeof(grid) != "undefined"){
			grid.is_selected=true;
		}
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
			else this.communicationColl.push({sop_communication_id:result.result[0].sop_communication_id,sop_id:this.sop.sop_id,instruction:this.newInstruction,communication_id:undefined,is_selected:true,instruction_type:instructionType});
			this.newInstruction = undefined;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
		// else {
		// 	let param = {
		// 		sop_communication_id: grid.sop_communication_id,
		// 		instruction: grid.instruction,
		// 	}
		// 	let result = await this.authService.updSOPCommunication({param:this.reusable.encrypt(JSON.stringify(param))});
		// 	if (result.success){
		// 		grid["msg"] = "Successfully updated the instruction";
		// 		setTimeout(() => {
		// 			grid["msg"] = undefined;
		// 		}, 3000);
		// 	}
		// 	else {
		// 		this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		// 	}
		// }
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
			this.getSOPCommunication();
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
			this.getSOPCommunication();
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}
	
	async removeComm(grid,ix){
		grid.is_selected=false;
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

	async saveService(){
		if (this.serviceSaveFlag) return;
		let selectedService = [];
		this.othServices.map(service=>{
			let filter = this.serviceTypeColl[service].filter(x=>x.is_selected);
			if(filter.length > 0){
				filter.map(fil=>{
					fil.sop_id = this.sop.sop_id;
					selectedService.push(fil);
				})
			}
		})
		let param = {
			sop_id: this.sop.sop_id,
			sopServiceColl: selectedService
		}
		await this.authService.insSOPServices({param:this.reusable.encrypt(JSON.stringify(param))});
		this.serviceSaveFlag = true;
	}

	addNewInst(){
		this.communicationColl.push({
			communication_id: null,
			edit: true,
			instruction: "",
			is_selected: true,
			sop_communication_id: null,
			sop_id: this.sop.sop_id,
			focus:true
		});
		setTimeout(() => {
			let htmlEle = document.getElementById('inst'+(this.communicationColl.length-1));
			htmlEle.focus();
		}, 500);
	}

	ngOnDestroy(){
		this.authService.savePageAccess(this.pageStartTime, new Date(), this.pageCurrentUrl, 'Sop-Services');
		if (!this.serviceSaveFlag) this.saveService();
		clearInterval(this.timerServiceSave);
	}
}