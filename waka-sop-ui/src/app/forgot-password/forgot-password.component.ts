import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../_services/index';
import { ReusableComponent } from '../reusable/reusable.component';

@Component({
	selector: 'app-forgot-password',
	templateUrl: './forgot-password.component.html',
	styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

	isLoading = false; checkEmail = true; phide = true; cphide = true;
	form: FormGroup;
	isVerified: boolean;
	height: number = window.innerHeight;
	width: number = window.innerWidth;
	cardPadtb: number = 40;
	cardPadrl: number = 40;
	fxGap: string = "30px";
	colWidth = 80;
	formLayoutAlign = "center center"
	isOTPSent: boolean;
	checkEmailTimer:any;
	gpDisabled = false;
	timer = 60;
	firstStep: boolean = true;
	passwordStrengthLabel:string = 'Weak';
	isError:boolean = false;
	isOpen =false;
	layoutAlign:string = "end center"

	getErrorMessage(control, controlName) {
		let msg = '';
		msg += control.hasError('required') ? 'Field Cannot be empty. ' : '';
		if (controlName == 'Email') { msg += control.hasError('Email') ? 'Not a valid Email. ' : '' }
		// if (controlName == "Email") { msg += control.hasError('emailexists') ? 'Email Id already Exists, use forgot password link in login page ' : '' }
		if (controlName == 'Code') { msg += (control.errors.minlength || control.errors.maxlength) ? 'Must be 4 digit number. ' : '' }
		if (controlName == 'Code') { msg += (control.errors.validateName) ? 'Special Characters/Numbers are not allowed. ' : '' }
		if (controlName =='form') {msg += control.hasError('matchingPasswords') ? 'Password, confirm password must be same' :''}
		if (controlName =='Email') {msg += (control.errors.EmailNotVerified) ? 'Your Account is not verified yet! please verify' :''}
		return msg;
	}

	createForm() {
		this.form = this.formBuilder.group({
			Email: ['', Validators.compose([
				Validators.required,
				Validators.email
			])],
			Code: [{value:'', disabled: true}, Validators.compose([ Validators.required, Validators.maxLength(4), Validators.minLength(4)])],
			Password: ['', Validators.compose([
				Validators.required,
				Validators.pattern('^(?=.{8,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$')
			])],
			Confirm: ['', Validators.required],
		},
			{ validators: this.matchingPasswords('Password', 'Confirm') }
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
			if (this.height <= 650) {
				this.cardPadtb = 10;
				this.cardPadrl = 10
				this.fxGap = "10px";
				this.formLayoutAlign = "center start"
			}
			else {
				this.formLayoutAlign = "center center"
			}
			if (res.width < 599) {
				this.layoutAlign = "center center"
			} else {
				this.layoutAlign = "end center"
			}
			if (this.width <= 700) {
				this.colWidth = 95;
			} else {
				this.colWidth = 80;
			}
		})
	}

	validateName(controls) {
		const reqExp = new RegExp("^[a-zA-Z ]+$");
		if (reqExp.test(controls.value)) {
			if (controls.value.trim().length == 0) return { 'validateName': true };
			return null;
		} else {
			return { 'validateName': true };
		}
	}

	matchingPasswords(pass, conf) {
		return (group: FormGroup) => {
			if (group.controls[pass].value === group.controls[conf].value) {
				return null;
			} else {
				return { 'matchingPasswords': true };
			}
		}
	}

	validateMobile(controls) {
		const reqExp = new RegExp(/^[+][0-9]*$/);
		if (reqExp.test(controls.value)) {
			return null;
		} else {
			return { 'validateMobile': true };
		}
	}

	passwordStrength() {
		let score = this.evaluatePassword(this.form.get('Password').value);
		let bar = document.querySelector( '.js--password-bar');
		(bar as HTMLElement).style.width = score.width;
		(bar as HTMLElement).style.background = score.color;
		this.passwordStrengthLabel= score.label;	
	}

	evaluatePassword(password) {
		let score = 0;
        var strong = new RegExp("^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$", "g");
        var medium = new RegExp("^(?=.{8,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$", "g");
        var enough = new RegExp("(?=.{8,}).*", "g");
        if (password.length == 0) {
            score = 0;
        } else if (false == enough.test(password)) {
            score = 0;
        } else if (strong.test(password)) {
            score = 100;
        } else if (medium.test(password)) {
            score = 22;
        } else {
            score = 0;
        }
		if ( score >= 30 ) {
			return {
				width: '100%',
				color: '#26de81',
				label: 'Strong',
			};
		} else if ( score >= 20 ) {
			return {
				width: '66%',
				color: '#fd9644',
				label: 'Medium',
			};
		} else {
			return {
				width: '15%',
				color: '#fc5c65',
				label: 'Weak',
			};
		}
	  };

	async validateEmail() {
		if (this.form.get("Email").status == "VALID") {
			let param = { email: this.form.get("Email").value };
            let result = await this.authService.checkEmail({param: param});
			if (result.success && result.result == "available") {
				this.checkEmail = true;
				this.form.get('Email').setErrors(null);
				this.isOpen = false;
			} else {
				this.checkEmail = false;
				this.isOpen = true;
				this.form.get('Email').setErrors({'EmailNotAvailable':true});
				if (this.checkEmailTimer != undefined) clearInterval(this.checkEmailTimer);
				this.checkEmailTimer= setTimeout(() => {
					this.checkEmail = true;
				}, 3000);
			}
		} else {
			this.checkEmail = false;
			if (this.checkEmailTimer != undefined) clearInterval(this.checkEmailTimer);
			this.checkEmailTimer= setTimeout(() => {
				this.checkEmail = true;
			}, 3000);
		}
	}

	async checkEmailLinkVerified(){
		if (this.form.get("Email").status == "VALID"){
			let param = { email: this.form.get("Email").value };
			let result = await this.authService.checkEmailLinkVerified({param: param});
			if (result.success && result.result == "verified") {
				this.form.get('Email').setErrors(null);
				this.checkEmail = true;
				this.isOpen = false;
			} else if (!result.success && result.message == "Not Available"){
				this.isOpen = false;
				this.checkEmail = false;
				this.form.get('Email').setErrors({'EmailNotAvailable':true});
			}  else {
				this.checkEmail = false;
				this.isOpen = true;
				this.form.get('Email').setErrors({'EmailNotVerified':true});
			}
		}
	}

	async getVerifyCode() {
		this.starttimer();
		setTimeout(() => {
			this.gpDisabled = false;
		}, 60000);
		await this.validateEmail();
		if (this.checkEmail){
			let sendData = { email: this.form.get('Email').value, type: 'Forgot Password' };
			let data = await this.authService.getOTP({ param : sendData });
			if (data.success) {
				this.isOTPSent = true;
				this.form.get("Code").enable();
				this.reusable.openAlertMsg(data.message, "info");
				this.firstStep = false;
			} else {
				this.reusable.openAlertMsg(this.authService.invalidSession(data), "error");
			}
		} else {
			this.gpDisabled = false;
		}
	}

	starttimer(){
		let tim = setInterval(()=>{
			this.timer -= 1
			if (this.timer == 0 || this.isVerified){
				clearInterval(tim);
			}
		},1000)
	}

	async verifyCode() {
		let sendData;
		sendData = { 
			email: this.form.get('Email').value, 
			type: 'Forgot Password',
			otp: this.form.get('Code').value
		};
		let data = await this.authService.validateOTP({ param: sendData });
		if (data.success) {
			this.isVerified = true;
			this.reusable.openAlertMsg(data.message, "info");
		} else {
			this.isVerified = false;
			this.isError = true;
			this.form.controls.Code.setErrors({'incorrect': true});
			// this.reusable.openAlertMsg(data.message, 'error');
			setTimeout(() => {
				this.isError = false;
				this.form.controls.Code.setErrors(null);
			}, 4500);
			// this.reusable.openAlertMsg(this.authService.invalidSession(data), "error");
		}
	}

	async changeForgottenPassword() {
		if (this.form.valid) {
			this.isLoading = true;
			const user = {
				email: this.form.get('Email').value,
				password: btoa(this.form.get('Password').value),
			};
			let data = await this.authService.changeForgottenPassword({ param: btoa(JSON.stringify(user)) });
			this.isLoading = false;
			if (data.success) {
				this.reusable.openAlertMsg("Password Changed Successfully", "info");
				this.router.navigate(['/login']);
			} else {
				this.reusable.openAlertMsg(this.authService.invalidSession(data), "error");
			}
		} else {
			this.reusable.openAlertMsg("Form is not valid, please check for errors", "info");
		}
	}
}