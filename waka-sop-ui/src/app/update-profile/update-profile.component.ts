import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../_services/index';
import { ReusableComponent } from '../reusable/reusable.component';

@Component({
	selector: 'app-update-profile',
	templateUrl: './update-profile.component.html',
	styleUrls: ['./update-profile.component.css'],
})

export class UpdateProfileComponent implements OnInit {
	isLoading = false; checkEmail = false;
	form: FormGroup;
	height: number = window.innerHeight;
	width: number = window.innerWidth;
	cardPadtb:number = 40;
	cardPadrl:number = 40;
	fxGap:string = "30px";
	colWidth = 80;
	formLayoutAlign = "center center";
	title = 'Update Profile';
	
	getErrorMessage(control, controlName) {
		let msg ='';
		if (controlName =='Email') {msg += control.hasError('Email') ? 'Not a valid email. ' :''}
		if (controlName == "Email") {msg += control.hasError('emailexists') ? 'Email Id already Exists, use forgot password link in login page ' :''}
		if (controlName =='Name') {msg += (control.errors.minlength || control.errors.maxlength) ? 'Must be between 3 & 50 char length. ': ''}
		if (controlName =='Name') {msg += (control.errors.validateName) ? 'Special Characters/Numbers are not allowed. ': ''}
		if (controlName =='Mobile') {msg += (control.errors.minlength || control.errors.maxlength) ? 'Must be a 10 digit number':''}
		if (controlName =='Mobile') {msg += control.hasError('validateMobile') ? 'Only Numeric value allowed. ' : ''}
		if (controlName =='WeChat') {msg += (control.errors.minlength || control.errors.maxlength || this.form.get('WeChat').value.length == 0) ? 'Must be between 3 & 50 char length. ': control.hasError('whitespace') ? 'No white spaces' : ''}
		return msg;
	}

	createForm() {
		this.form = this.formBuilder.group({
			Email:[''],
			Name:['', Validators.compose([
				Validators.required,
				Validators.minLength(3),
				Validators.maxLength(50),
				this.validateName
			])],
			Mobile:['',Validators.pattern("[0-9]*")],
			WeChat:['', Validators.compose([
				Validators.minLength(3),
				Validators.maxLength(50),
				this.noWhitespaceValidator
			])]
		}
		);	
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
		this.reusable.screenChange.subscribe(res => {
			this.height = res.height;
			this.width = res.width;
			this.getProfile();
			this.reusable.titleHeader.next(this.title);
			if (this.height<=450){
				this.cardPadtb = 10;
				this.cardPadrl = 10
				this.fxGap ="10px"
				this.formLayoutAlign = "center start"
			}
			else {
				this.formLayoutAlign = "center center"
			}
			if (this.width <= 700){
				this.colWidth = 95;
			} else {
				this.colWidth = 80;			
			}
		})
	}

	validateName(controls){
		const reqExp = new RegExp("^[a-zA-Z ]+$");
		if (reqExp.test(controls.value)){
			if(controls.value.trim().length == 0)  return {'validateName' : true};
			return null;
		} else{
			return { 'validateName' : true};
		}
	}

	noWhitespaceValidator(control: FormControl){
		const isWhitespace = (control.value || '').toString().trim().length === 0;
		const isValid = !isWhitespace;
		return isValid ? null : { 'whitespace': true };
	}

	validateMobile(controls){
		const reqExp = new RegExp(/^[0-9]*$/);
		if (reqExp.test(controls.value)){
			return null;
		} else{
			return { 'validateMobile' : true};
		}
	}
	  
	async getProfile(){
		let profile = ReusableComponent.usr;
		this.form.get('Name').setValue(profile.full_name);
		this.form.get('Email').setValue(profile.email);
		this.form.get('Mobile').setValue(profile.mobile);
		this.form.get('WeChat').setValue(profile.wechat_id);
	  }
	
  async UpdateProfile() {
	if (this.form.valid){
      this.isLoading = true;
      const param = {
        email:this.form.get('Email').value,
        user_name: this.form.get('Name').value,
        mobile: this.form.get('Mobile').value,
				wechat_id: this.form.get('WeChat').value,
      };
      let result = await this.authService.updateProfile(param);
      this.isLoading = false;
      if (result.success){
		this.fetchProfileInfo();
        this.reusable.openAlertMsg('Profile Updated Successfully',"info");
        this.router.navigate(['/nav/company']);
      } else {
        this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
      }
	} else {
		this.reusable.openAlertMsg("Form is not valid, please check for errors","info");
	}
  }

  async fetchProfileInfo(){
	let result = await this.authService.fetchProfileInfo();
      this.isLoading = false;
      if (result.success){
		  ReusableComponent.usr.mobile = this.form.get('Mobile').value;
		  ReusableComponent.usr.full_name = this.form.get('Name').value;
		  ReusableComponent.usr.wechat_id = this.form.get('WeChat').value;
      } else {
        this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
      }
}

  onClose(){
    this.router.navigate([this.reusable.curRoute.value != null ? this.reusable.curRoute.value : '/nav/home']);
  }
	
}
