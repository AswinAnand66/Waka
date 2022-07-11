import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../_services/index';
import { ReusableComponent } from '../reusable/reusable.component';

@Component({
	selector: 'app-signup',
	templateUrl: './signup.component.html',
	styleUrls: ['./signup.component.css'],
})

export class SignupComponent implements OnInit {
	isLoading = false; checkEmail = true; phide = true; cphide = true;
	form: FormGroup;
	height: number = window.innerHeight;
	width: number = window.innerWidth;
	cardPadtb: number = 40;
	cardPadrl: number = 40;
	fxGap: string = "30px";
	colWidth = 80;
	formLayoutAlign = "center center"
	checkModel: boolean;
	acceptUpdEmails: boolean = true;
	isInvite: boolean = false;
	firstStep: boolean = true;
	regSuccess:boolean = false;
	passwordTouched = false
	passwordStrengthLabel:string = 'Weak';

	getErrorMessage(control, controlName) {
		let msg = '';
		msg += control.hasError('required') ? 'Field Cannot be empty. ' : '';
		if (controlName == 'Email') { msg += control.hasError('Email') ? 'Not a valid email. ' : '' }
		if (controlName == "Email") { msg += control.hasError('emailexists') ? 'Email Id already Exists ' : '' }
		if (controlName == 'Name') { msg += (control.errors.minlength || control.errors.maxlength) ? 'Must be between 3 & 50 char length. ' : '' }
		if (controlName == 'Name') { msg += (control.errors.validateName) ? 'Special Characters/Numbers are not allowed. ' : '' }
		// if (controlName == 'form') { msg += control.hasError('matchingPasswords') ? 'Password, confirm password must be same' : '' }
		return msg;
	}

	createForm() {
		this.form = this.formBuilder.group({
			Email: [{value:'',disabled:this.isInvite}, Validators.compose([
				Validators.required,
				Validators.email,
			])],
			Name: ['', Validators.compose([
				Validators.required,
				Validators.minLength(3),
				Validators.maxLength(50),
				this.validateName
			])],
			Password: ['', Validators.compose([
				Validators.required,
				Validators.minLength(5),
				Validators.maxLength(20)
			])],
			// Confirm: ['', Validators.required]
		},
			// { validators: this.matchingPasswords('Password', 'Confirm') }
		);
	}

	constructor(
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private authService: AuthenticationService,
		private reusable: ReusableComponent,
		private formBuilder: FormBuilder
	) {	}

	ngOnInit() {
		this.reusable.screenChange.subscribe(res => {
			this.height = res.height - 100
			this.width = res.width;
			if (this.height <= 600) {
				this.cardPadtb = 10;
				this.cardPadrl = 10
				this.fxGap = "10px";
				this.formLayoutAlign = "center start"
			} else {
				this.formLayoutAlign = "center center"
			}
			if (this.width <= 700) {
				this.colWidth = 90;
			} else {
				this.colWidth = 80
			}
		});
		if (this.activatedRoute.snapshot.queryParamMap.has('data')) {
			let data = this.reusable.decrypt(this.activatedRoute.snapshot.queryParamMap.get('data'));
			let invite_user = JSON.parse(data);
			this.getInviteUser(invite_user.user_id);
			this.isInvite = true;
			this.checkEmail = true;
			this.createForm();
		} else {
			this.createForm();
		}
	}

	async getInviteUser(userId){
		let param = {
			invite_user_id : userId
		};
		let result = await this.authService.getInviteUser(param);
		if (result.success){
			let user_data = result.result[0];
			if(user_data.invite_accepted_on != null){
				this.reusable.openAlertMsg("You already have an account. Please login", "info");
				this.router.navigate(['/login']);
			}else{
				this.form.controls.Email.setValue(user_data.email);
				this.form.controls.Name.setValue(user_data.full_name);
			}
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
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

	// matchingPasswords(pass, conf) {
	// 	return (group: FormGroup) => {
	// 		if (group.controls[pass].value === group.controls[conf].value) {
	// 			return null;
	// 		} else {
	// 			return { 'matchingPasswords': true };
	// 		}
	// 	}
	// }

	validateMobile(controls) {
		const reqExp = new RegExp(/^[+][0-9]*$/);
		if (reqExp.test(controls.value)) {
			return null;
		} else {
			return { 'validateMobile': true };
		}
	}

	// onChange($event) {
	// 	this.checkModel = $event.target.checked;
	// }

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

	async validateEmailSignUp() {
		if (this.form.get("Email").status == "VALID") {
			let param = { email: this.form.get("Email").value };
			let result = await this.authService.checkEmail({ param: param });
			if (result.success && result.result == "Not available") {
				this.checkEmail = true;
				this.form.get("Email").setErrors(null);

				return true;
			} else if (result.success) {
				this.checkEmail = false;
				this.form.get("Email").setErrors({ emailexists: true });
				return false;
			}
			else (this.authService.invalidSession(result));
		}
	}

	async register() {
		this.form.get("Email").enable();
		if (this.form.valid && this.checkEmail) {
			this.isLoading = true;
			const param = {
				email: this.form.get('Email').value,
				full_name: this.form.get('Name').value,
				password: btoa(this.form.get('Password').value),
				isInvite: this.isInvite
			};
			let result = await this.authService.registerUser({ param: btoa(JSON.stringify(param)) });
			this.isLoading = false;
			if (result.success) {
				this.regSuccess = true;
				this.reusable.openAlertMsg("User registered successfully, redirecting in 3 seconds...", "info");
				setTimeout(() => {
					this.router.navigate(['/login']);
				}, 6000);
			} else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
			}
		} else {
			this.reusable.openAlertMsg("Form is not valid, please check for errors", "info");
		}
	}

	signIn() {
		this.router.navigate(["/nav/home"]);
	}
}
