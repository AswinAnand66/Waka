import { MatDialog } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ReusableComponent } from './../../reusable/reusable.component';
import { AuthenticationService } from './../../_services/authentication.service';
import { Component, OnInit } from '@angular/core';

export interface ClassSOPlc {
	sop_lc_id: number,
	sop_id: number,
	lc_id: number,
	lc_seq: number,
	grp: string,
	grp_seq: number,
	sub_grp_seq: number,
	sub_grp: string,
	lc_name: string,
	control_name: string,
	has_child: boolean,
	view_text: string,
	fields: any,
	is_selected: boolean,
	expand: boolean

}

@Component({
	selector: 'app-sop-landing-cost',
	templateUrl: './sop-landing-cost.component.html',
	styleUrls: ['./sop-landing-cost.component.css']
})
export class SopLandingCostComponent implements OnInit {
	objectKeys = Object.keys;
	objectValues = Object.values;
	isLoading: boolean = false;
	permissionDenied: boolean = false;
	userDetails: any;
	sop: any;
	lcTemplate: string = 'template2';
	screen: { width: number; height: number; };
	pageStartTime: Date;
	pageCurrentUrl: string;
	accessibleSections = [];
	isAccessibleSection = {};
	accessibleEvents = [];
	isAccessibleEvents = [];
	

	lcGrpTitle: string = 'Estimated Landed Cost';
	lcSOPColl: ClassSOPlc[] = [];

	constructor(
		private authService: AuthenticationService,
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
			this.getEventsSubModulesWise();
		}
		else {
			this.router.navigate(['/nav/sop']);
		}
		if (this.sop == undefined) this.reusable.titleHeader.next("Standard Operating Procedure");
		else {
			this.reusable.titleHeader.next("Edit Standard Operating Procedure (" + this.sop.sop_id + ")");
		}
		this.reusable.headHt.next(60);
		this.reusable.curRoute.next("/nav/sop");
		this.reusable.screenChange.subscribe(res => {
			this.screen = { width: res.width, height: res.height - 142 };
		});
		this.checkCreateLCForSOP();
	}

	ngOnDestroy() {
		this.authService.savePageAccess(this.pageStartTime, new Date(), this.pageCurrentUrl, 'Sop-Landing-Cost');
	}

	onClickgridExpand(grididx) {
		this.lcSOPColl[grididx].expand = !this.lcSOPColl[grididx].expand;
	}

	async checkCreateLCForSOP() {
		this.isLoading = true;
		let param = {
			sop_id: this.sop.sop_id
		}
		let result = await this.authService.checkCreateLCForSOP({ param: this.reusable.encrypt(JSON.stringify(param)) });
		this.isLoading = false;
		if (result.success) {
			this.getSOPLCForGroup();
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async getEventsSubModulesWise(){
		this.isLoading = true;
		let param = {
			company_id : this.sop.principal_id,
			sub_module_name : 'Landing Cost',
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

	async getSOPLCForGroup() {
		this.isLoading = true;
		let param = {
			sop_id: this.sop.sop_id
		}
		let result = await this.authService.getSOPLCForGroup({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			result.result.map((lc)=>{
				if (this.isAccessibleEvents.some(v => v.includes(lc.lc_name.toLowerCase()))) {
					lc['is_enable'] = true;
				} 
				else{
					lc['is_enable'] = false;
				}
				lc.fields.map(fld =>{
					if (this.isAccessibleEvents.some(v => v.includes(fld.group.toLowerCase()))) {
						fld['is_accessible'] = true;
					} 
					else{
						fld['is_accessible'] = false;
					}
				});
				lc.expand = lc.is_enable;
			});
			console.log(result.result)
			this.lcSOPColl = result.result;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
		this.isLoading = false;
	}

	async updCHFieldValue(idx, field, grid) {
		let param = {
			fields: JSON.stringify(grid.fields),
			sop_lc_id: grid.sop_lc_id
		};
		let result = await this.authService.updSOPLCfields({ param: this.reusable.encrypt(JSON.stringify(param)) });
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

}
