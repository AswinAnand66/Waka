import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, Validators, FormControl, FormBuilder } from '@angular/forms';
import { AuthenticationService } from '../_services/index';
import { ReusableComponent } from '../reusable/reusable.component';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { saveAs } from 'file-saver';
import { DateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-contract',
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.css']
})
export class ContractComponent implements OnInit {
	isLoading = false;
	returnUrl: string;
	form: FormGroup;
	height: number = window.innerHeight;
	width: number = window.innerHeight;
	contractColl = new MatTableDataSource([])
	screen; ht: number;
	isNoRows = false;
	dialogWidth = '40%';
	userDetails;
	dispContract = ["sh_name", "sh_type", "co_no", "valid_from", "valid_to", "extend", "view", "print", "delete"];
	pageStartTime: Date;
	pageCurrentUrl: string;
	accessDetails: any;
	
	@ViewChild(MatSort, { static: false }) sort: MatSort;

	constructor(
		private router: Router,
			private authService: AuthenticationService,
			private reusable: ReusableComponent,
			public dialog: MatDialog
	) { }

  ngOnInit(): void {
	this.userDetails = ReusableComponent.usr;
	if (sessionStorage.getItem("provided_users")) {
		this.accessDetails = JSON.parse(this.reusable.decrypt(sessionStorage.getItem("provided_users")));
		console.log('users', this.accessDetails)
	}
	this.reusable.screenChange.subscribe(screen => {
		this.ht = screen['height'] - 140;
		this.width = screen["width"] - 64;
		this.screen = { width: screen.width, height: screen.height };
		if (this.screen.width > 600 && this.screen.width <= 900) {
			this.dialogWidth = '90%';
		}
		else if (screen.width > 900) {
			this.dialogWidth = '80%';
		}
		else {
			this.dialogWidth = '90%';
		}
	});
	this.reusable.headHt.next(60);
	this.reusable.titleHeader.next("Contracts");
    this.getContracts();
  }
  
  ngOnDestroy() {
	sessionStorage.removeItem('provided_users');
  }

  async getContracts() {
	  this.isLoading = true;
	  let param = {
		access_provided_users: this.accessDetails.provided_users,
		accessible_companies: this.accessDetails.accessible_companies
	  }
	  console.log('getContracts param ', param)
	  let result = await this.authService.getContracts({ param: this.reusable.encrypt(JSON.stringify(param)) });
	  if (result.success && result.rowCount > 0) {
		  this.contractColl = new MatTableDataSource(result.result);
		  console.log('contractColl',this.contractColl.data)
		  this.contractColl.sort = this.sort;
		  this.isLoading = false;
	  }
	  else if (result.success && result.rowCount == 0) {
		this.isLoading = false;
		// this.addContract(); //removed as per zeplin
	  }
	  else {
		  this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
	  }
	}


	applyContractFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
		if (filterValue == '') {
			this.getContracts();
		}
		//const sopsearch = this.sopColl.filter = filterValue.trim().toLowerCase();
		const filtered = this.contractColl.data.filter((e: any) => {
			return (e.sh_name.toLowerCase().includes(filterValue)) || (e.sh_type.toLowerCase().includes(filterValue) || e.contract_no.toLowerCase().includes(filterValue));
		});
		if (filtered.length != 0) {
			this.contractColl.data = filtered;
		} else {
			this.getContracts();
		}
	}

	addContract() {
		const dialogRef = this.dialog.open(ContractAddDialog, {
			height: '100%',
			width: '60vw',
			position: { right: '0px' },
			panelClass: "dialogclass",
			data: { type: 'add' },
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.getContracts();
			}
		});
	}

	extendContract(ele) {
		const dialogRef = this.dialog.open(ContractAddDialog, {
			height: '100%',
			width: '60vw',
			position: { right: '0px' },
			panelClass: "dialogclass",
			data: { element: ele, type: 'extend' }
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.getContracts()
			}
		});
	}

	viewContract(ele) {
		const dialogRef = this.dialog.open(ContractAddDialog, {
			width: '52%', panelClass: "custom", data: { element: ele, type: 'view' }
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.getContracts()
			}
		});
	}

	async downloadFiles(ele) {
		let param = {
			contract_id: ele.contract_id
		}
		this.authService.downloadContractFiles(param).then(blob => {
			if (blob.type === "application/json") {
				this.reusable.openAlertMsg('Failed to download the attachment file.', "info");
			} else {
				saveAs(blob, ele.contract_no + ".zip");
			}
		});
	}

	async delContract(ele) {
		let conf = confirm("Are you sure you like to delete this Contract?");
		if (!conf) return;
		let param = {
			contract_id: ele.contract_id
		}
		//let result = await this.authService.delContract({ param: this.reusable.encrypt(JSON.stringify(param)) });
		let result = await this.authService.delContract(param);
		if (result.success) {
			this.getContracts();
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

  async delContractFile(contract, fileName) {
		let conf = confirm("Are you sure you want to delete Contract File?");
		if (!conf) return;
		let idx = contract.uploaded_files.indexOf(fileName);
		let newFileSet = contract.uploaded_files.filter(x => x != fileName);
		let param = {
			contract_id: contract.contract_id,
			fileName: fileName,
			uploadedFileNames: newFileSet
		}
		let result = await this.authService.delContractFile(param);
		if (result.success) {
			let idx = contract.uploaded_files.indexOf(fileName);
			if (idx != -1) {
				contract.uploaded_files.splice(idx, 1);
			}
		}
	}
}

@Component({
	selector: 'add-contract',
	templateUrl: 'contract-add-extend-dialog.html',
  styleUrls: ['./contract.component.css']
})

export class ContractAddDialog implements OnInit {
	userDetails: any;
	buyerColl = [];
	ffColl = [];
	form: FormGroup;
	isLoading: boolean = false;
	isExtendMode: boolean;
	btnTitle: string;
	title: string;
	stakeHolderNameList: any;
	principalNameList: any;
	stakeHolderTypeList: any;
	previewUrl; fileName; fileData;
	fileDetails = [];
	stakeholder: any;
	ValidFrom: any; ValidTo: Date;
	isView: boolean = false;
	isChecked: boolean = false;
	isEditMode: boolean = false;
	pageStartTime: Date;
	pageCurrentUrl: string;
	constructor(
		private router: Router,
		public dialogRef: MatDialogRef<ContractAddDialog>,
		@Inject(MAT_DIALOG_DATA) public data: ContractAddDialog,
		private authService: AuthenticationService,
		private reusable: ReusableComponent,
		private formBuilder: FormBuilder,
		private dateAdapter: DateAdapter<Date>,
	) {
		this.dateAdapter.setLocale('en-GB');
	}

	ngOnInit() {
		this.pageStartTime = new Date();
		this.pageCurrentUrl = this.router.url;
		if (this.data['element'] == undefined) {
			this.isExtendMode = false;
			this.btnTitle = 'ADD CONTRACT';
			this.title = "ADD CONTRACT";
			this.createForm();
		} else if (this.data['type'] == 'extend') {
			this.isExtendMode = true;
			this.createForm();
			this.btnTitle = 'SAVE';
			this.title = "EXTEND CONTRACT VALIDITY";
			this.form.controls.PrincipalName.setValue(this.data['element'].principal_id);
			this.form.controls.StakeholderName.setValue(this.data['element'].stakeholder_id);
			this.form.controls.ContractNo.setValue(this.data['element'].contract_no);
			this.form.controls.ValidFrom.setValue(new Date(this.data['element'].valid_from).toISOString());
			this.form.controls.ValidTo.setValue(new Date(this.data['element'].valid_to).toISOString());
			this.fileName = this.data['element'].fileName;
			this.getStakeHolderNameList(this.data['element'].principal_id);
			// this.data['element'].uploaded_files.map(file => {
			// 	this.fileDetails.push({name:file,data:null});
			// })
		} else if (this.data['type'] == 'view') {
			this.isView = true;
			this.isEditMode = true;
			this.createForm();
			this.title = "CONTRACT DETAILS";
			this.form.controls.PrincipalName.setValue(this.data['element'].principal_id);
			this.form.controls.StakeholderName.setValue(this.data['element'].stakeholder_id);
			this.form.controls.ContractNo.setValue(this.data['element'].contract_no);
			this.form.controls.ValidFrom.setValue(new Date(this.data['element'].valid_from).toISOString().slice(0, 10));
			this.form.controls.ValidTo.setValue(new Date(this.data['element'].valid_to).toISOString().slice(0, 10));
			this.form.get("PrincipalName").disable();
			this.form.get("StakeholderName").disable();
			this.form.get("ContractNo").disable();
			this.form.get("ValidFrom").disable();
			this.form.get("ValidTo").disable();
			this.form.get("File").disable();
			this.fileName = this.data['element'].fileName;
			this.getStakeHolderNameList(this.data['element'].principal_id);
		}
		this.getPrincipalNameList();
	}

	ngOnDestroy() {
		this.authService.savePageAccess(this.pageStartTime, new Date(), this.pageCurrentUrl, 'Contract Add Dialog');
	}


	createForm() {
		this.form = this.formBuilder.group({
			PrincipalName: [{ value: '', disabled: this.isExtendMode }, Validators.compose([
				Validators.required,
				Validators.nullValidator,
			])],
			StakeholderName: [{ value: '', disabled: this.isExtendMode }, Validators.compose([
				Validators.required,
			])],
			ContractNo: [{ value: '', disabled: this.isExtendMode }, Validators.compose([
				Validators.required,
				Validators.maxLength(10)
			])],
			ValidFrom: ['', Validators.compose([
				Validators.required,
			])],
			ValidTo: ['', Validators.compose([
				Validators.required,
			])],
			File: ['']
		},
		);
	}

	validateForContractBlankSpace() {
		let contract_no = this.form.get('ContractNo').value.trim();
		if (contract_no == '') {
			this.form.get("ContractNo").setErrors({ ContractBlank: true });
		}
	}
	async getPrincipalNameList() {
		let company = [];
		let result = await this.authService.getPrincipalListForContract();
		if (result.success) {
			company = result.result;
			this.principalNameList = company.filter(company => company.is_add_contract == true);
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async getStakeHolderNameList(company_id: number) {
		let param = { principal_id: company_id };
		let result = await this.authService.getStakeholderList(param);

		if (result.success) {
			this.stakeHolderNameList = result.result.filter(x => x.is_accepted);
			if (this.isExtendMode) {
				this.getStakeHolder(this.data['element'].stakeholder_id);
				// this.stakeHolderNameList.some(ele => {
				// 	if(ele.company_id === this.data['element'].stakeholder_id){
				// 		this.stakeholder = ele;
				// 	}
				// });
			}
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async getStakeHolderTypeList() {
		let result = await this.authService.getCompanyTypeList();
		if (result.success) {
			this.stakeHolderTypeList = result.result;
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	onClose(msg) {
		this.dialogRef.close(msg);
	}

	onChange() {
		if (this.isChecked) {
			this.isView = false;
			this.btnTitle = 'UPDATE';
			this.title = "UPDATE CONTRACT";
			this.form.get("PrincipalName").enable();
			this.form.get("StakeholderName").enable();
			this.form.get("ContractNo").enable();
			this.form.get("ValidFrom").enable();
			this.form.get("ValidTo").enable();
			this.form.get("File").enable();
		} else {
			this.isView = true;
			this.title = "CONTRACT DETAILS";
			this.form.get("PrincipalName").disable();
			this.form.get("StakeholderName").disable();
			this.form.get("ContractNo").disable();
			this.form.get("ValidFrom").disable();
			this.form.get("ValidTo").disable();
			this.form.get("File").disable();
		}
	}

	async validateContract() {
		this.validateForContractBlankSpace();
		if (this.form.get("ContractNo").status == "VALID") {
			let param = {
				contract_no: this.form.get("ContractNo").value.toLowerCase().replace(/ /gi, ''),
			};
			let result = await this.authService.validateContract(param);
			if (result.success && result.result == "Available") {
				return true;
			} else if (result.success) {
				this.form.get("ContractNo").setErrors({ ContractExists: true });
				return false;
			} else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
			};
		}
	}

	fileProgress_old(fileInput: any) {
		this.fileData = <File>fileInput.target.files[0];
		this.fileName = this.fileData["name"];
		if (this.fileData.size <= (1024 * 1024 * 20)) {
			var reader = new FileReader();
			reader.readAsDataURL(this.fileData);
			reader.onload = (_event) => {
				this.previewUrl = reader.result;
			}
		}
		else {
			this.reusable.openAlertMsg("Max file size is 1 MB", "error");
			this.previewUrl = undefined;
		}
	}

	fileProgress(fileInput: any) {
		if(fileInput.target.files[0].type == 'application/pdf'){
			for (var i = 0; i < fileInput.target.files.length; i++) {
				this.fileData = <File>fileInput.target.files[i];
				this.fileName = this.fileData["name"];
				if (this.fileData.size <= (1024 * 1024 * 20)) {
					this.pushFileData(<File>fileInput.target.files[i]);
					//this.fileDetails.push({name: this.fileName, data: this.fileData});
				}
				else {
					this.reusable.openAlertMsg("Max file size is 20 MB", "error");
					this.previewUrl = undefined;
				}
			}
		} else {
			this.reusable.openAlertMsg("Only PDF format supported", "error");
		}
	}

	pushFileData(file) {
		var reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = (_event) => {
			this.fileDetails.push({ name: file["name"], data: reader.result });
			//this.previewUrl = reader.result;
		}
	}

	async removeFile(file) {
		let conf = confirm("Are you sure you want to delete this File?");
		if (!conf) return;
		let index = this.fileDetails.indexOf(file);
		if (this.fileDetails[index].data == undefined) {
			await this.authService.delContractFile({ contract_id: this.data['element'].contract_id, fileName: file });
		}
		this.fileDetails.splice(index, 1);
	}

	getStakeHolder(stakeholder_id: number) {
		this.stakeHolderNameList.some(ele => {
			if (ele.company_id === stakeholder_id) {
				this.stakeholder = ele;
			}
		});
	}

	async addExtendContract() {
		if (this.form.valid) {
			this.isLoading = true;
			let data, msg;
			const param = {
				principal_id: this.form.get('PrincipalName').value,
				stakeholder_id: this.stakeholder == undefined ? this.data['element'].stakeholder_id : this.stakeholder.company_id,
				stakeholder_type_id: this.stakeholder == undefined ? this.data['element'].stakeholder_type_id : this.stakeholder.company_type_id,
				contract_no: this.form.get('ContractNo').value.replace(/[^\+\w\.]+/,''),
				valid_from: this.form.get('ValidFrom').value,
				valid_to: this.form.get('ValidTo').value,
				fileData: this.previewUrl != null ? this.previewUrl : null,
				fileName: this.previewUrl != null ? this.fileName : null,
				fileDetails: this.fileDetails,
				contract_id: this.data['element'] == undefined ? null : this.data['element'].contract_id,
			};
			if (this.data['type'] != 'extend' && this.data['type'] != 'view') {
				data = await this.authService.addContract(param);
				msg = "Contract added successfully"
			} else if (this.data['type'] == 'extend') {
				data = await this.authService.extendContractValidity(param);
				msg = "Contract validity has been extended"
			} else if (this.data['type'] == 'view' && this.isChecked == true) {
				data = await this.authService.updateContract(param);
				msg = "Contract Updated successfully"
			}
			this.isLoading = false;
			if (data.success) {
				this.reusable.openAlertMsg(msg, "info");
				this.onClose(data.success);
			} else {
				this.reusable.openAlertMsg(this.authService.invalidSession(data), "error");
				if (data.invalidToken != undefined && data.invalidToken) {
					this.onClose(data.success);
				}
			}
		} else {
			this.reusable.openAlertMsg("Form is not valid, please check for errors", "info");
		}
	}

	getErrorMessage(control, controlName) {
		let msg = '';
		msg += control.hasError('required') ? 'Field Cannot be empty. ' : '';
		if (controlName == 'ContractNo') { msg += (control.errors.ContractExists) ? 'Contract Number already exists' : '' }
		if (controlName == 'ContractNo') { msg += (control.errors.ContractBlank) ? 'Enter a valid Contract Number' : '' }
		if (controlName == 'ContractNo') { msg += (control.errors.maxlength) ? 'Allowed only 10 charcters' : '' }
		return msg;
	}
}
