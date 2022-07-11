import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, Validators, FormControl, FormBuilder, FormArray } from '@angular/forms';
import { AuthenticationService } from '../../_services/index';
import { ReusableComponent } from '../../reusable/reusable.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClassSOPCh, ClassSOPPOB, ClassTmpGrp } from '../sop-global-class';

@Component({
	selector: 'sop-pobooking',
	templateUrl: 'sop-pobooking.html',
	styleUrls: ['./sop-pobooking.component.css']
})
export class SopPobookingComponent implements OnInit {
	objectKeys = Object.keys;
	objectValues = Object.values;
    isLoading: boolean = false;
    permissionDenied: boolean = false;
    userDetails:any;
    sop:any;
    screen: { width: number; height: number; };
	pobGrpParam = {};
	pobGrpColl:ClassTmpGrp[] = [];
	pobSOPColl:ClassSOPCh[] = [];
	pobTemplate:string = 'template1';
	pobGrpTitle:string = '';
	principalContactColl = [];
	ffContactColl = [];
	IsSopPOBReqMsg:boolean = false;
	pageStartTime: Date;
	pageCurrentUrl: string;
	expandButtonTitle: string = 'Collapse All';
	accessibleSections = [];
	isAccessibleSection = {};
	accessibleEvents = [];
	isAccessibleEvents = [];
	
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
			this.screen = { width: res.width-112, height: res.height-142};
		});
		this.getConsigneeContacts();
		this.getFFContacts();
		this.checkCreatePOBForSOP();
    }

	ngOnDestroy() {
		this.authService.savePageAccess(this.pageStartTime, new Date(), this.pageCurrentUrl, 'Sop-Po & Booking');
	}

	async getEventsSubModulesWise(){
		this.isLoading = true;
		let param = {
			company_id : this.sop.principal_id,
			sub_module_name : 'PO Booking',
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
			for (let idx in this.pobGrpColl){
				let data = this.accessibleSections.filter(value => value.section_name.replaceAll('_',' ') == this.pobGrpColl[idx].grp);
				if(data.length>0){
					index = parseInt(idx);
					break;
				}
			}
			this.isLoading = false;
			this.onClickPOBGrp(index,this.pobGrpColl[index].grp);
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

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

	async checkCreatePOBForSOP(){
		this.isLoading = true;
		let param = {
			sop_id : this.sop.sop_id
		}
		let result = await this.authService.checkCreatePOBForSOP({param:this.reusable.encrypt(JSON.stringify(param))});
		this.isLoading = false;
		if (result.success){
			this.isLoading = false;
			this.IsSopPOBReqMsg = result.rowCount > 1 ? true : false;
			this.getPOBGrp();
		} 
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	onClickgridExpand(grididx) {
		this.pobSOPColl[grididx].expand = !this.pobSOPColl[grididx].expand;
		let collCount = this.pobSOPColl.length;
		let collExpandCount = 0;
		let collCollapseCount = 0;
		this.pobSOPColl.map((pob)=>{
			if(!pob.expand){
				collCollapseCount += 1;
			} else {
				collExpandCount += 1;
			}
		})
		if(collCount == collCollapseCount){
			this.expandButtonTitle = 'Expand All';
		} else if (collCount == collExpandCount){
			this.expandButtonTitle = 'Collapse All';
		}
		
	}

	async getPOBGrp(){
		this.isLoading = true;
		let result = await this.authService.getPOBGrp();
		if (result.success){
			this.pobGrpColl = result.result;
			this.pobGrpColl.map((grp,i)=>{
				this.pobGrpParam[i] = {color:"var(--lightgray)", disp:false, fw:"normal", isClicked:false};
			});
			this.isLoading = false;
			this.getEventsSubModulesWise();
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
		this.isLoading = false;
	}

	onClickPOB(){
		this.pobTemplate ="none";
		this.pobGrpColl.map((group,ix)=>{
			if (this.pobGrpParam[ix]["disp"] || this.pobGrpParam[ix]["isClicked"] ) this.pobGrpParam[ix] = {color:"var(--green)", disp:false, fw:"normal", isClicked:true};
			else {
				this.pobGrpParam[ix]["color"] = "var(--lightgray)";
				this.pobGrpParam[ix]["disp"] = false;
				this.pobGrpParam[ix]["fw"] = "normal";
			}  
		});
	}

	expandCollapseAll(){
		if(this.expandButtonTitle == 'Collapse All'){
			this.pobSOPColl.map((pob)=>{
				pob.expand = false;
			})
			this.expandButtonTitle = 'Expand All';
		} else {
			this.pobSOPColl.map((pob)=>{
				pob.expand = pob.is_selected;
			})
			this.expandButtonTitle = 'Collapse All';
		}
	}
	
	async onClickPOBGrp(idx,grp){
		this.pobGrpColl.map((group,ix) => {
			if (idx == ix){
				this.pobGrpParam[idx] = {color:"var(--active)", disp:true, fw:600, isClicked: true};
				this.pobTemplate = this.pobGrpColl[idx].html_template;
				this.pobGrpTitle = grp;
			} else {
				if (this.pobGrpParam[ix]["disp"] || this.pobGrpParam[ix]["isClicked"]) this.pobGrpParam[ix] = {color:"var(--green)", disp:false, fw:"normal", isClicked:true};
				else {
					this.pobGrpParam[ix]["color"] = "var(--lightgray)";
					this.pobGrpParam[ix]["disp"] = false;
					this.pobGrpParam[ix]["fw"] = "normal";
				}
			}
		});
		let param = {
			grp: grp,
			sop_id:this.sop.sop_id
		};
		let result = await this.authService.getSOPPOBForGroup({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.expandButtonTitle = 'Collapse All';
			let resp = result.result;
			resp.map(pob => {
				if (this.isAccessibleEvents.some(v => v.includes(pob.pob_name.toLowerCase() + ' enable'))) {
					pob['is_enable'] = true;
				} 
				else{
					pob['is_enable'] = false;
				}
				pob.fields.map(fld =>{
					if (this.isAccessibleEvents.some(v => v.includes(fld.group.toLowerCase()))) {
						fld['is_accessible'] = true;
					} 
					else{
						fld['is_accessible'] = false;
					}
				});
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
				pob.expand = pob.is_enable ? pob.is_selected : !pob.is_selected;
			});
			if (idx == 0) {
				resp[0].fields[1].field0.field[0].options = this.principalContactColl;
				resp[0].fields[1].field0.field[1].options = this.ffContactColl;
			}
			this.pobSOPColl = resp;
		} 
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	selectedChange(value, chField, grid) {
		if (chField.child[0].field[0].value.find(val => val.contact_invite_id == value.contact_invite_id) == undefined) {
			chField.child[0].field[0].value.push(value);
			this.updPOBFieldValue(0, chField, grid);
		}
	}

	editIPField(field){
		if (field["FormCntrl"]) delete field["FormCntrl"];
		field["FormCntrl"] = new FormControl(field.value,[Validators.required])
		if (field.range != undefined && field.range.length > 0){
			field["FormCntrl"].setValidators([Validators.required, Validators.min(field.range[0]), Validators.max(field.range[1])]);
		}
		field.edit=true;
	}

	editField(chField){
		if (chField.options != undefined && chField.options.indexOf(chField.value) == -1) {
			chField["FormCntrl"] = new FormControl()
			chField["FormCntrlOthers"] = new FormControl(null);
			setTimeout(() => {
				chField["FormCntrl"].setValue("Others");
				chField["FormCntrlOthers"].setValue(chField.value.replace(/[a-zA-Z ]*/g,""));
				if (chField.range != undefined){
					chField["FormCntrlOthers"].setValidators([Validators.required,Validators.min(chField.range[0]),Validators.max(chField.range[1])]);
				}
			}, 100);
		}
		else {
			chField["FormCntrl"] = new FormControl()
			chField["FormCntrlOthers"] =  new FormControl(null);
			chField["FormCntrl"].setValue(chField.value);
			if (chField.range != undefined){
				chField["FormCntrlOthers"].setValidators([Validators.required,Validators.min(chField.range[0]),Validators.max(chField.range[1])]);
			}
		}
		chField["edit"] = true;
	}

	async updPOBFieldValue(idx, field, grid){
		console.log(field.controlname);
		let valCheck;
		if(field.controlname == 'SABRCAQV'|| field.controlname == 'SABRCAQVSecondValue') {
			valCheck = grid.fields[0].field0.field
		} else if(field.controlname == 'ATCRDSecondValue' || field.controlname == 'ATCRD'){
			valCheck = grid.fields[1].field0.field
		} else {
			valCheck = grid.fields[0].field0.field
		}
		let result;
		let minMaxVal = []
		if (grid.control_name == 'SABRCBySupplier') {
			valCheck.map((x)=>{ minMaxVal.push(x.value); })
		}
		let param = {
			fields : JSON.stringify(grid.fields),
			sop_pob_id: grid.sop_pob_id,
			sop_id: grid.sop_id,
			controlname: field.controlname
		};
		if (grid.control_name == 'SABRCBySupplier' && minMaxVal[0] > minMaxVal[1]) {
			field["status"] = "Update Failed - Please check your input";
		} else if(grid.control_name == 'SABRCBySupplier' && minMaxVal[0] < minMaxVal[1]) {
			result = await this.authService.updSOPPOBfields({param:this.reusable.encrypt(JSON.stringify(param))});
			if (result.success){
				field["status"] = "Update Successful";
			} 
			else {
				field["status"] = "Update Failed";
			}
		} else {
			if(field.controlname == 'RemainderToGenerate') {
				let res = await this.authService.updSOPPOBfields({param:this.reusable.encrypt(JSON.stringify(param))});
				if (res.success){
					result = await this.authService.updSOPPOBfields({param:this.reusable.encrypt(JSON.stringify(param))});
					if (result.success){
						field["status"] = "Update Successful";
					} 
					else {
						field["status"] = "Update Failed";
					}
				} 
				else {
					field["status"] = "Update Failed";
				}
			} else {
				result = await this.authService.updSOPPOBfields({param:this.reusable.encrypt(JSON.stringify(param))});
				if (result.success){
					field["status"] = "Update Successful";
				} 
				else {
					field["status"] = "Update Failed";
				}
			}
		}
		setTimeout(() => {
			field["status"] = undefined;
		}, 1500);
	}

	async updPOBisSelected(grid){
		grid.is_selected = !grid.is_selected;
		let param = {
			sop_id: grid.sop_id,
			sop_pob_id: grid.sop_pob_id,
			is_selected: grid.is_selected,
			control_name: grid.control_name
		};
		let result = await this.authService.updSOPPOBIsSelected({param:this.reusable.encrypt(JSON.stringify(param))});
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

	getErrorMessage(control, controlName) {
		let msg = '';
		msg += control.hasError('required') ? 'You must enter a value' : '';
		msg += (control.errors.min) ? 'Must be >='+control.errors.min.min : '';
		msg += (control.errors.max) ? 'Must be <= '+control.errors.max.max : '';
		return msg;
	}

	async savePOBField(chField,grid, type){
		if (type=='radio'){
			if (chField["FormCntrl"].value != "Others"){
				chField.value = chField["FormCntrl"].value
				if (grid.view_text != undefined) grid.disp_text = grid.disp_text.replace('$$'+chField.controlname+'$$',chField.value);
			} 
			else {
				chField.value = chField.Others.replace("$$val$$", chField["FormCntrlOthers"].value);
				if (grid.view_text != undefined) grid.disp_text = grid.disp_text.replace('$$'+chField.controlname+'$$',chField.value);
			}
		}
		else {
			chField.value = chField["FormCntrl"].value
			if (grid.view_text != undefined) grid.disp_text = grid.disp_text.replace('$$'+chField.controlname+'$$',chField.value);
		}
		delete chField["FormCntrl"] ;
		delete chField["FormCntrlOthers"];
		chField.edit = false;
		let param = {
			fields : JSON.stringify(grid.fields),
			sop_pob_id: grid.sop_pob_id
		};
		let result = await this.authService.updSOPPOBfields({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			chField.status = "Update Successful";
		} 
		else {
			chField.status = "Update Failed";
			this.authService.invalidSession(result);
		}
		setTimeout(() => {
			chField.status = undefined;
		}, 1500);
	}
	// async pobSOPEdit(row){
	// 	row["template"] = this.pobTemplate;
	// 	const dialogRef = this.dialog.open(POBSopEditDialog, {
	// 		width: '450px',
	// 		data: row
	// 	});
	// 	dialogRef.afterClosed().subscribe(result => {
	// 		let fields = result.fields;
	// 		result.disp_text = result.view_text;
	// 		fields.map(fld =>{
	// 			fld.fields.map(fldoffld=>{
	// 				fld[fldoffld]["field"].map(actField=>{
	// 					let val = actField.value;
	// 					if (typeof val == 'boolean'){
	// 						val = val ? 'Required': 'Not Required';
	// 					}
	// 					if (result.view_text != undefined)
	// 						result.disp_text = result.disp_text.replace('$$'+actField.controlname+'$$',val==null?'':val);
	// 				})
	// 			})
	// 		});
	// 	});
	// }

}

/* PO Booking Edit Dialog for a content inside a group */
@Component({
	selector: 'pob-sop-edit',
	templateUrl: 'pob-sop-edit-dialog.html',
	styleUrls: ['./sop-pobooking.component.css']
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
