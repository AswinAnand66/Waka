import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../_services/index';
import { ReusableComponent } from '../reusable/reusable.component';
import { environment } from '../../environments/environment';

@Component({
	selector: 'app-login',
	templateUrl: 'login.component.html',
	styleUrls: ['login.component.css']
})

export class LoginComponent implements OnInit {
	isLoading = false;
	returnUrl: string;
	hide = true;
	layoutAlign:string = "end center"
	form: FormGroup;
	themeChange;
	disableLoginBtn = false;
	loginActiveError:string;
	isUserRegistered = true;
	appTitle: string = environment.browser_title.substr(0, 1).toUpperCase() + environment.browser_title.substr(1);
	cusName: string = environment.customer;
	cusLogo: string = environment.customer_logo;
	height: number = window.innerHeight;
	isInvite:boolean;
	isOpen = false;
	isActivated: boolean = false;
	isAlreadyActivated: boolean = false;

	getErrorMessage(control, controlName) {
		let msg = '';
		msg += control.hasError('required') ? 'Field Cannot be empty. ' : '';		
		return msg;
	}

	constructor(
		private router: Router,
		private authenticationService: AuthenticationService,
		private reusable: ReusableComponent,
		private formBuilder: FormBuilder,
		private activatedRoute: ActivatedRoute,

	) { }

	ngOnInit() {
		this.reusable.screenChange.subscribe(res => {
			this.height = res.height -100 
			if (res.width < 599) {
				this.layoutAlign = "center center"
			} else {
				this.layoutAlign = "end center"
			}
		})
		if (this.activatedRoute.snapshot.queryParamMap.has('data')) {
			let data = this.reusable.decrypt(this.activatedRoute.snapshot.queryParamMap.get('data'));
			let invite_user = JSON.parse(data);
			this.getInviteUser(invite_user.user_id);
			this.isInvite = true;
		} else if(this.activatedRoute.snapshot.queryParams.hasOwnProperty('user')) {
			this.userValidation(this.activatedRoute.snapshot.queryParams)
		} 
		this.createForm();
		
	}

	createForm() {
		this.form = this.formBuilder.group({
			Email: [{value:null,disabled:this.isInvite}, Validators.compose([
				Validators.required,
			])],
			Password: [null],
		});
	}

	async userValidation(param){
		let result = await this.authenticationService.userValidation(param);
		if (result.success && result.message == 'account activate'){
			this.isActivated = true;
			setTimeout(() => {
				this.isActivated = false;
			}, 7500);
		} else if (result.success && result.message == 'account already activated'){
			this.isAlreadyActivated = true;
			setTimeout(() => {
				this.isAlreadyActivated = false;
			}, 7500);
		}
		else {
			this.reusable.openAlertMsg(this.authenticationService.invalidSession(result),"error");
		}
	}

	async getInviteUser(userId){
		let param = {
			invite_user_id : userId
		};
		let result = await this.authenticationService.getInviteUser(param);
		if (result.success){
			let user_data = result.result[0];
			this.form.controls.Email.setValue(user_data.email);
		} else {
			this.reusable.openAlertMsg(this.authenticationService.invalidSession(result),"error");
		}
	}

	async login() {
		if (this.form.valid) {
			this.disableLoginBtn = true;
			this.isLoading = true;
			const user = {
				email: this.form.get('Email').value,
				password: btoa(this.form.get('Password').value),
			};
			const usr = { data: btoa(JSON.stringify(user))};
			let data = await this.authenticationService.login(usr);
			if (data.success) {
				sessionStorage.setItem('token', data.result);
				this.reusable.storeKeys(data.result);
				this.router.navigate(['nav']);
			} else {
				this.loginActiveError = data.message;
				this.disableLoginBtn = false;
				this.isOpen = true;
				this.form.controls.Email.setErrors({'incorrect': true});
				this.form.controls.Password.setErrors({'incorrect': true});
				// this.reusable.openAlertMsg(data.message, 'error');
				setTimeout(() => {
					this.isOpen = false;
					this.form.controls.Email.setErrors(null);
					this.form.controls.Password.setErrors(null);
				}, 6000);
			}
			setTimeout(() => { this.isLoading = false }, 0); //to avoid login button getting enabled by the time navigation completes
		} else {
			this.reusable.openAlertMsg('Wrong input', 'warn');
		}
	}
}
