import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../_services/index';
import { ReusableComponent } from '../reusable/reusable.component';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

    isLoading = false; 
	phide = true; 
	cphide = true;
	ophide = true;	
	form: FormGroup;
	height: number;
	width: number;
	cardPadtb:number = 40;
	cardPadrl:number = 40;
	fxGap:string = "30px";
	colWidth = 80;
	formLayoutAlign = "center center";
	title = 'Change Password';
	passwordTouched : boolean = false;
	
	getErrorMessage(control, controlName) {
		let msg ='';
		msg += control.hasError('required') ? `${controlName == 'Password' ? 'Password' : 'Confirm Password'} is required` :'';
		if (controlName == 'Password') { msg += (control.errors.pattern) ? 'Make it at least 8 characters long, with numbers and special characters($,%,&,…)' : ''}
		if (controlName =='form') {msg += control.hasError('matchingPasswords') ? 'Password, confirm password must be same' :''}
		return msg;
	}

	constructor(
		private router: Router,
		private authService: AuthenticationService,
		private reusable: ReusableComponent,
		private formBuilder: FormBuilder
	) {
		this.createForm();
	}

	ngOnInit() {
		this.reusable.titleHeader.next(this.title);
		this.reusable.screenChange.subscribe(res => {
			this.height = res['height'] - 104;
			this.width = res["width"] - 64;
		});
		this.form.get('Password').valueChanges.subscribe((res) => {
			this.form.get('Confirm').reset();
		})
		// this.reusable.screenChange.subscribe(res=>{
		// 	this.height = res.height;
		// 	this.width = res.width;
		// 	this.reusable.titleHeader.next(this.title);
		// 	if (this.height<=600){
		// 		this.cardPadtb = 10;
		// 		this.cardPadrl = 10
		// 		this.fxGap ="10px"
		// 		this.formLayoutAlign = "center start"
		// 	}
		// 	else {
		// 		this.formLayoutAlign = "center center"
		// 	}
		// 	if (this.width <= 700){
		// 		this.colWidth = 95;
		// 	} else {
		// 		this.colWidth = 80;
		// 	}
		// })
	}

	createForm() {
		this.form = this.formBuilder.group({
			// OldPassword:['', Validators.compose([
			// 		Validators.required,
			// 	])],
			Password:['', Validators.compose([
				Validators.required,
				Validators.pattern('^(?=.{8,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$')
			])],
			Confirm:['', Validators.compose([
				Validators.required,
				Validators.pattern('^(?=.{8,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$')
			])],
			},
			{ validators: this.matchingPasswords('Password', 'Confirm') }
		);	
	}
	
	
	matchingPasswords(pass,conf){
		return (group: FormGroup) => {
			if(group.controls[pass].value === group.controls[conf].value){
				return null;
			} else{
				return { 'matchingPasswords' : true };
			}
		}
	}

  onClose(){
    this.router.navigate([this.reusable.curRoute.value != null ? this.reusable.curRoute.value : '/nav/home']);
  }
	
  async changePassword() {
	if (this.form.valid){
		this.isLoading = true;
		const param = {
			password: btoa(this.form.get('Password').value),
		};
        let result = await this.authService.changePassword({ param: btoa(JSON.stringify(param)) });
	  	this.isLoading = false;
	  	if (result.success){
		 	this.reusable.openAlertMsg('Password Changed Successfully',"info");
		 	this.router.navigate(['/nav/company']);
		 } else {
		 	this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		 }
	} else {
		this.reusable.openAlertMsg("Form is not valid, please check for errors","info");
	 }
 }
 
}