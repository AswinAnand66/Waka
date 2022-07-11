import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { Router, RouterLinkWithHref } from '@angular/router';
import { AuthenticationService } from '../_services/index';
import { ReusableComponent } from '../reusable/reusable.component';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, Validators, FormBuilder} from '@angular/forms';
//import { ClassCompany, ClassCountryCode, ClassLookup } from '../sop-add-edit-old-notinuse/sop-add-edit.component';

export interface UsrClass {
  user_id: number, 
  email: string,
  //mobile_country: ClassCountryCode,
  mobile: string, 
  full_name: string, 
  is_active: boolean, 
  is_deleted: boolean, 
  created_on: Date,
  is_admin:boolean,
  company_type_id: number
}

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css'],
})

export class RegisterComponent implements OnInit {
	ht:number; 
	width:number;
	userDetails;
	usrColl = new MatTableDataSource<UsrClass>([]);
	dispUsr = ["email", "mobile", "full_name", "created_on","company","role","edit","active","delete"];
	usr:UsrClass;
	@ViewChild(MatSort, { static: false }) sort: MatSort;
	companyTypeId:number ;

	constructor(
		private reusable: ReusableComponent,
		private authService: AuthenticationService,
		private router: Router,
		public dialog: MatDialog,
	) { }

	ngOnInit() {
		this.reusable.screenChange.subscribe(res => {
			this.ht = res['height'] - 64;
			this.width = res["width"] - 64;
		});
		this.userDetails = ReusableComponent.usr;
		if (!this.userDetails.is_admin && this.userDetails.company_admin == 0){
			this.router.navigate(['/home']);
		} 
		else if (!this.userDetails.is_admin){
			this.getUsersForCompAdmin()
		}
		else {
			this.reusable.titleHeader.next("Registered Users");
			this.getAllUsers();
		}
	}

	goBack(){
		this.router.navigate(['/home/admin']);
	}

	addUsr(){
		//this.usr = {user_id:null, email:null, full_name: null,mobile_country:null,mobile:null,is_active:true, is_deleted:false,created_on:null, is_admin: this.userDetails.is_admin, company_type_id:this.companyTypeId};
		this.openUserDialog(this.usr);
	}

	openUserDialog(regUsr){
		const dialogRef = this.dialog.open(UserAddEditDialog, {
			width: '920px',
			data:regUsr
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result){
				this.getUsers()
			}
		});
	}

	getUsers(){
		if (!this.userDetails.is_admin){
			this.getUsersForCompAdmin();
		}
		else {
			this.getAllUsers();
		}
	}
	mapCompany(element){
		const dialogRef = this.dialog.open(MapUserCompanyDialog, {
			width: '920px',
			data: element
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result){
				// this.getAllUsers();
			}
		});
	}

	async activateUser(element){
		let param = {
			user_id: element.user_id,
			is_active:element.is_active
		}
		let result = await this.authService.activateUser({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			if (param.is_active) this.reusable.openAlertMsg("User Successfully Activated.", "info");
			else this.reusable.openAlertMsg("User Successfully Deactivated.", "info");
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}
	
	async delUser(element){
		let param = {
			user_id: element.user_id,
			is_deleted:element.is_deleted
		}
		let result = await this.authService.delUsr({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			if (param.is_deleted) this.reusable.openAlertMsg("User Successfully Deleted.", "info");
			else this.reusable.openAlertMsg("User Successfully Revoked.", "info");
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	applyUserFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.usrColl.filter = filterValue.trim().toLowerCase();
	}

	async getAllUsers(){
		let result = await this.authService.getAllUsers();
		if (result.success){
			this.usrColl = new MatTableDataSource<UsrClass>(result.result);
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async getUsersForCompAdmin(){
		let result = await this.authService.getUsersForCompAdmin();
		if (result.success){
			this.usrColl = new MatTableDataSource<UsrClass>(result.result);
			this.companyTypeId = this.usrColl.data[0].company_type_id;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}
}
  
/* Add Edit User */
@Component({
	selector: 'user-add-edit',
	templateUrl: 'user-add-edit-dialog.html',
	styleUrls: ['./register.component.css']
})

export class UserAddEditDialog implements OnInit {
	objectKeys = Object.keys;
	objectValues = Object.values;
	form: FormGroup;
	dispForm = false;
	checkEmail: boolean = false;
	countryCodeColl=[];
	phide:boolean = true;
	cphide:boolean = true;
	userDetails:any;
	compColl = [];

	constructor(
		public dialogRef: MatDialogRef<UserAddEditDialog>,
		@Inject(MAT_DIALOG_DATA) public data:UsrClass,
		private formBuilder: FormBuilder,
		private authService: AuthenticationService,
		private reusable: ReusableComponent,
	) { }

	ngOnInit(){
		this.userDetails = ReusableComponent.usr;
		this.getCountryCode();
		if (!this.data.is_admin && this.data.user_id == undefined){
			this.getUserCompany();
		}
		if (this.data.user_id == undefined && this.data.is_admin) this.createForm();
		else if (this.data.user_id != undefined) this.createFormEdit();
		else if (this.data.user_id == undefined) this.createCompAdminForm();
	}

	onClose(status){
		this.dialogRef.close(status);
	}

	createCompAdminForm() {
		this.form = this.formBuilder.group({
			Email:[this.data.email,Validators.compose([
				Validators.required,
				Validators.email,
			])],
			Name:[this.data.full_name,Validators.compose([
				this.validateName,
				Validators.minLength(3),
				Validators.maxLength(50),
				Validators.required,
			])],
			//MobileCountry:[this.data.mobile_country],
			Mobile:[this.data.mobile, Validators.compose([
				Validators.minLength(6),
				Validators.maxLength(15),
				this.validateMobile,
			])],
			Password:[null,Validators.compose([
				Validators.required,
			])],
			Confirm:[null,Validators.compose([
				Validators.required,
			])],
			Company:[null,Validators.compose([
				Validators.required,
			])],
		},
			{validators: this.matchingPasswords('Password', 'Confirm')}
    	);
	}

 	createForm() {
		this.form = this.formBuilder.group({
			Email:[this.data.email,Validators.compose([
				Validators.required,
				Validators.email,
			])],
			Name:[this.data.full_name,Validators.compose([
				this.validateName,
				Validators.minLength(3),
				Validators.maxLength(50),
				Validators.required,
			])],
			//MobileCountry:[this.data.mobile_country],
			Mobile:[this.data.mobile, Validators.compose([
				Validators.minLength(6),
				Validators.maxLength(11),
				this.validateMobile,
			])],
			Password:[null,Validators.compose([
				Validators.required,
			])],
			Confirm:[null,Validators.compose([
				Validators.required,
			])],
		},
			{validators: this.matchingPasswords('Password', 'Confirm')}
    	);
	}

	createFormEdit() {
		this.form = this.formBuilder.group({
			Email:[this.data.email,Validators.compose([
				Validators.required,
				Validators.email,
			])],
			Name:[this.data.full_name,Validators.compose([
				this.validateName,
				Validators.minLength(3),
				Validators.maxLength(50),
				Validators.required,
			])],
			//MobileCountry:[this.data.mobile_country],
			Mobile:[this.data.mobile, Validators.compose([
				Validators.minLength(6),
				Validators.maxLength(11),
				this.validateMobile,
			])],
		});
	}

  	getErrorMessage(control, controlName) {
		let msg ='';
		msg += control.hasError('required') ? controlName+' must have value. ' :'';
		if (controlName =='Email') {msg += control.hasError('Email') ? 'Not a valid email. ' :''}
		if (controlName == "Email") {msg += control.hasError('emailexists') ? 'Email Id already Exists. ' :''}
		if (controlName =='Name') {msg += (control.errors.minlength || control.errors.maxlength) ? 'Must be between 3 & 50 char length. ': ''}
		if (controlName =='Name') {msg += (control.errors.validateName) ? 'Special Characters/Numbers are not allowed. ': ''}
		if (controlName =='Mobile') {msg += (control.errors.minlength || control.errors.maxlength) ? 'Must be between 6 & 15 Char length. ': ''}
		if (controlName =='Mobile') {msg += control.hasError('validateMobile') ? 'Numeric,hypen,space allowed. ' :''}
		if (controlName =='form') {msg += control.hasError('matchingPasswords') ? 'Password, confirm password must be same' :''}
		return msg;
	}

  	matchingPasswords(pass:string,conf:string){
		return (group: FormGroup) => {
			if(group.controls[pass].value === group.controls[conf].value){
				return null;
			} 
			else {
				return {'matchingPasswords' : true};
			}
		}
	}

	validateMobile(controls){
		if (controls.value == undefined) return null;
		const reqExp = new RegExp("^[0-9\- ]+$");
		if (reqExp.test(controls.value)){
			if(controls.value.trim().length == 0)  return {'validateMobile' : true};
			return null;
		} 
		else {
			return { 'validateMobile' : true};
		}
	}

	validateName(controls){
		if (controls.value == undefined) return null;
		const reqExp = new RegExp("^[a-zA-Z ]+$");
		if (reqExp.test(controls.value)){
			if(controls.value.trim().length == 0) return {'validateName' : true};
			return null;
		} 
		else {
			return { 'validateName' : true};
		}
	}

	async validateEmail(){
		let param = {email: this.form.get("Email").value, user_id: this.data.user_id };
		let result = await this.authService.checkUsrEmailExists({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success && result.rowCount == 0){
			this.checkEmail = true; 
			return true;
		}
		else if (result.success) {
			this.checkEmail = false; 
			this.form.get("Email").setErrors({emailexists:true});
			return false;
		}
		else (this.authService.invalidSession(result));
	}

	async getCountryCode(){
		/*let result = await this.authService.getCountryCode();
		if (result.success){
			this.countryCodeColl = result.result;
			if (this.data.mobile_country != undefined ){
				let mbCountry = this.countryCodeColl.filter(x=>x.country_code_id == this.data.mobile_country.country_code_id);
				this.form.get("MobileCountry").setValue(mbCountry[0]);
			}
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}*/
	}
	
	async register(){
		if (this.data.user_id == undefined){
			let param = {
				email: this.form.get("Email").value.trim(),
				full_name: this.form.get("Name").value.trim(),
				mobile_country:JSON.stringify(this.form.get("MobileCountry").value),
				mobile: this.form.get("Mobile").value,
				password: this.form.get("Password").value
			};
			let result = await this.authService.registerUser({param:this.reusable.encrypt(JSON.stringify(param))});
			if (result.success){
				if (!this.data.is_admin){
					this.insUsrCompanyForCompAdmin(result.result[0].user_id, this.data.company_type_id, this.form.get("Company").value);
				} else {
					this.reusable.openAlertMsg("User Successfully Registered. Please map a role to the user", "info");
					this.onClose(true);
				}
			}
			else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
			}
		} 
		else {
			let param = {
				email: this.form.get("Email").value.trim(),
				full_name: this.form.get("Name").value.trim(),
				mobile_country:JSON.stringify(this.form.get("MobileCountry").value),
				mobile: this.form.get("Mobile").value,
				user_id: this.data.user_id
			}
			let result = await this.authService.updUser({param:this.reusable.encrypt(JSON.stringify(param))});
			if (result.success){
				this.reusable.openAlertMsg("User Successfully Updated.", "info");
				this.onClose(true);
			}
			else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
			}
		}
	}

	async getUserCompany(){
		let param = {
			user_id : this.userDetails.user_id
		}
		let result = await this.authService.getUserCompany({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success) {
			this.compColl = result.result.filter(x=>x.is_selected);
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

	async insUsrCompanyForCompAdmin(userId, companyTypeId, company){
		let param = {
			user_id: userId,
			company_type_id: companyTypeId,
			company_id: company.company_id
		};
		let result = await this.authService.insUsrCompanyForCompAdmin({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.reusable.openAlertMsg("User Successfully Registered And Company Mapped. Please map a role to the user", "info");
			this.onClose(true);
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}
}

/* Map Company User */
@Component({
	selector: 'map-user-company',
	templateUrl: 'map-user-company-dialog.html',
	styleUrls: ['./register.component.css']
})

export class MapUserCompanyDialog implements OnInit {
	objectKeys = Object.keys;
	objectValues = Object.values;
	form: FormGroup;
	dispForm = false;
	checkEmail: boolean = false;
	//countryCodeColl:ClassCountryCode[];
	phide:boolean = true;
	cphide:boolean = true;
	//companyTypeColl:ClassLookup[] = [];
	dispCompanyType:boolean = false;
	selCompanyType:any;
	companyColl = new MatTableDataSource([]);
	dispCompany = ["company_name", "company_type", "city", "state", "country","is_selected", "is_admin"];

	constructor(
		public dialogRef: MatDialogRef<MapUserCompanyDialog>,
		@Inject(MAT_DIALOG_DATA) public data:any,
		private formBuilder: FormBuilder,
		private authService: AuthenticationService,
		private reusable: ReusableComponent,
	) { }

	ngOnInit(){
		this.getUserCompany();
	}

	onClose(status){
		this.dialogRef.close(status);
	}

	async getUserCompany(){
		let param = {
			user_id: this.data.user_id,
		}
		let result = await this.authService.getUserCompany({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success && result.rowCount>0){
			this.companyColl = new MatTableDataSource(result.result);
		}
		else if (result.success) {
			this.getCompanyType();
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
			this.onClose(false);
		}
	}

	async getCompanyType(){
		//get available company type and allow admin to choose company type for which this user needs to be mapped.
		let result = await this.authService.getAllCompanyType();
		if (result.success){
			//this.companyTypeColl = result.result;
			this.dispCompanyType = true;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
			this.onClose(false);
		}
	}

	applyCompFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.companyColl.filter = filterValue.trim().toLowerCase();
	}

	async saveMapCompany(){
		let mappedComp = this.companyColl.data.filter(x=>x.is_selected);
		let data = [];
		mappedComp.map(comp =>{
			data.push({user_id:this.data.user_id, company_id:comp.company_id, company_type_id: comp.company_type_id,is_admin:comp.is_admin});
		});
		let param = {
			user_id: this.data.user_id,
			data: JSON.stringify(data)
		}
		let result = await this.authService.insUserCompany({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			this.reusable.openAlertMsg("Successfully Mapped Company", "info");
			this.onClose(true);
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}
}