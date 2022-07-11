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
import { PrintService } from '../_services/print.service';

export interface classSop {
	sop_id: number,
	principal_id: number,
	p_company: string,
	ff_id: number,
	ff_company: string,
	date_of_sop: Date,
	remarks: string,
	sop_status_id: number,
	status: string,
	pending_days: number,
	valid_from: Date,
	valid_to: Date,
	copy_from: boolean,
}

@Component({
	selector: 'app-sop-grid',
	templateUrl: 'sop-grid.component.html',
	styleUrls: ['sop-grid.component.css']
})

export class SopGridComponent implements OnInit {
	isLoading = false;
	returnUrl: string;
	form: FormGroup;
	height: number = window.innerHeight;
	width: number = window.innerHeight;
	// sopColl:classSop[] = [];
	sopColl = new MatTableDataSource<classSop>([]);
	contractColl = new MatTableDataSource([])
	screen;
	isNoRows = false;
	dialogWidth = '40%';
	userDetails;
	dispSop = ["p_company", "trade", "ff_company", "status", "edit", "delete", 'print'];
	dispContract = ["sh_name", "sh_type", "co_no", "valid_from", "valid_to", "extend", "view", "print", "delete"];
	@ViewChild(MatSort, { static: false }) sort: MatSort;
	@ViewChild(CdkScrollable, { static: true }) virtualScroll: CdkScrollable;
	tabTitle: string;
	isContractTab: boolean = true;
	selectedTabIndex = 0;
	pageStartTime: Date;
	pageCurrentUrl: string;

	constructor(
		private router: Router,
		private authService: AuthenticationService,
		private reusable: ReusableComponent,
		public printService: PrintService,
		public dialog: MatDialog,
	) { }

	ht: number;
	ngOnInit() {
		this.pageStartTime = new Date();
		this.pageCurrentUrl = this.router.url;
		this.userDetails = ReusableComponent.usr;
		this.reusable.curRoute.next('/nav/home');
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
		// if (this.reusable.curRoute.value == '/nav/sop') {
		// 	this.getSOPs();
		// 	this.isContractTab = false;
		// 	this.selectedTabIndex = 1;
		// 	this.reusable.curRoute.next(null);
		// } else {
		// 	// this.getContracts();
		// 	this.isContractTab = true;
		// }
		this.getSOPs();
		this.reusable.headHt.next(60);
		this.reusable.titleHeader.next("Standard Operating Procedure");
	}

	ngOnDestroy() {
		this.authService.savePageAccess(this.pageStartTime, new Date(), this.pageCurrentUrl, 'Sop Grid Component');
	}

	// async delContractFile(contract, fileName) {
	// 	let conf = confirm("Are you sure you want to delete Contract File?");
	// 	if (!conf) return;
	// 	let idx = contract.uploaded_files.indexOf(fileName);
	// 	let newFileSet = contract.uploaded_files.filter(x => x != fileName);
	// 	let param = {
	// 		contract_id: contract.contract_id,
	// 		fileName: fileName,
	// 		uploadedFileNames: newFileSet
	// 	}
	// 	let result = await this.authService.delContractFile(param);
	// 	if (result.success) {
	// 		let idx = contract.uploaded_files.indexOf(fileName);
	// 		if (idx != -1) {
	// 			contract.uploaded_files.splice(idx, 1);
	// 		}
	// 	}
	// }

	async delSop(sop) {
		let conf = confirm("Are you sure you like to delete this SOP?");
		if (!conf) return;
		let param = {
			sop_id: sop.sop_id
		}
		let result = await this.authService.delSOP({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			this.getSOPs();
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async getSOPs() {
		this.isLoading = true;
		let result = await this.authService.getSOPs();
		if (result.success) {
			this.isLoading = false;
			if (result.rowCount > 0) {
				this.isNoRows = false;
				result.result.map(row => {
					if (result.rowCount > 1) row["copy_from"] = true;
					else row["copy_from"] = false;
					this.getSopPortCount(row);
				})
				result.result[0]["copy_from"] = false;
				let resp = result.result.filter(val => val.is_view);
				this.sopColl = new MatTableDataSource<classSop>(resp);
			}
			else {
				this.sopColl.data = [];
				// this.openDialog();
				// this.isNoRows = true;
			}
		}
		else {
			this.sopColl.data = [];
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async getSopPortCount(sop) {
		let param = {
			sop_id: sop.sop_id
		}
		let result = await this.authService.getSopPortCount(param);
		if (result.success) {
			sop["port_count"] = result.result[0].count
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	//OLD CODE - 16/12/2021
	// printSop(sop) {
	// 	sessionStorage.setItem("sop", this.reusable.encrypt(JSON.stringify(sop)));
	// 	this.router.navigate(['/print/soptemplate']);
	// }

	printSop(sop) {
		sessionStorage.setItem("sop", this.reusable.encrypt(JSON.stringify(sop)));
		this.reusable.curRoute.next('/nav/sop');
		this.printService.printDocument('/print/soptemplate');
		
	}

	editSop(sop) {
		sessionStorage.setItem("sop", this.reusable.encrypt(JSON.stringify(sop)));
		this.router.navigate(['/nav/soplanding/sopstakeholder']);
	}

	openDialog() {
		const dialogRef = this.dialog.open(ValidateSopDialog, {
			width: '446px',
			height: 'auto'
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result == "redirect") {
				this.reusable.curRoute.next("/nav/company");
				this.router.navigate(['/nav/company']);
			}
			else if (result == "true") {
				this.router.navigate(['/nav/soplanding/sopstakeholder']);
			}
		});
	}

	applySopFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
		if (filterValue == '') {
			this.getSOPs();
		}
		//const sopsearch = this.sopColl.filter = filterValue.trim().toLowerCase();
		const filtered = this.sopColl.data.filter((e: any) => {
			return (e.p_company.toLowerCase().includes(filterValue)) || (e.ff_company.toLowerCase().includes(filterValue));
		});
		if (filtered.length != 0) {
			this.sopColl.data = filtered;
		} else {
			this.getSOPs();
		}
		// this.sopColl._updateChangeSubscription();
	}

	tabChanged(tabChangeEvent: MatTabChangeEvent): void {
		if (tabChangeEvent.index == 1) {
			this.reusable.curRoute.next('/nav/sop');
			this.isContractTab = false;
			this.tabTitle = "SOP List"
			this.getSOPs();
		} else {
			this.isContractTab = true;
			this.tabTitle = "Contracts"
			// this.getContracts();
		}
	}

	// async getContracts() {
	// 	let result = await this.authService.getContracts();
	// 	if (result.success && result.rowCount > 0) {
	// 		this.contractColl = new MatTableDataSource(result.result);
	// 		this.contractColl.sort = this.sort;
	// 	}
	// 	else if (result.success && result.rowCount == 0) {
	// 		// this.addContract(); //removed as per zeplin
	// 	}
	// 	else {
	// 		this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
	// 	}
	// }


	// applyContractFilter(event: Event) {
	// 	const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
	// 	if (filterValue == '') {
	// 		this.getContracts();
	// 	}
	// 	//const sopsearch = this.sopColl.filter = filterValue.trim().toLowerCase();
	// 	const filtered = this.contractColl.data.filter((e: any) => {
	// 		return (e.sh_name.toLowerCase().includes(filterValue)) || (e.sh_type.toLowerCase().includes(filterValue) || e.contract_no.toLowerCase().includes(filterValue));
	// 	});
	// 	if (filtered.length != 0) {
	// 		this.contractColl.data = filtered;
	// 	} else {
	// 		this.getContracts();
	// 	}
	// }

	// addContract() {
	// 	const dialogRef = this.dialog.open(ContractAddDialog, {
	// 		height: '100%',
	// 		width: '60vw',
	// 		position: { right: '0px' },
	// 		panelClass: "dialogclass",
	// 		data: { type: 'add' },
	// 	});
	// 	dialogRef.afterClosed().subscribe(result => {
	// 		if (result) {
	// 			this.getContracts();
	// 		}
	// 	});
	// }

	// extendContract(ele) {
	// 	const dialogRef = this.dialog.open(ContractAddDialog, {
	// 		height: '100%',
	// 		width: '60vw',
	// 		position: { right: '0px' },
	// 		panelClass: "dialogclass",
	// 		data: { element: ele, type: 'extend' }
	// 	});
	// 	dialogRef.afterClosed().subscribe(result => {
	// 		if (result) {
	// 			this.getContracts()
	// 		}
	// 	});
	// }

	// viewContract(ele) {
	// 	const dialogRef = this.dialog.open(ContractAddDialog, {
	// 		width: '52%', panelClass: "custom", data: { element: ele, type: 'view' }
	// 	});
	// 	dialogRef.afterClosed().subscribe(result => {
	// 		if (result) {
	// 			this.getContracts()
	// 		}
	// 	});
	// }

	// async downloadFiles(ele) {
	// 	let param = {
	// 		contract_id: ele.contract_id
	// 	}
	// 	this.authService.downloadContractFiles(param).then(blob => {
	// 		if (blob.type === "application/json") {
	// 			this.reusable.openAlertMsg('Failed to download the attachment file.', "info");
	// 		} else {
	// 			saveAs(blob, ele.contract_no + ".zip");
	// 		}
	// 	});
	// }

	// async delContract(ele) {
	// 	let conf = confirm("Are you sure you like to delete this Contract?");
	// 	if (!conf) return;
	// 	let param = {
	// 		contract_id: ele.contract_id
	// 	}
	// 	//let result = await this.authService.delContract({ param: this.reusable.encrypt(JSON.stringify(param)) });
	// 	let result = await this.authService.delContract(param);
	// 	if (result.success) {
	// 		this.getContracts();
	// 	}
	// 	else {
	// 		this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
	// 	}
	// }

}

/* Validate SOP Before Add Dialog */
@Component({
	selector: 'validate-sop',
	templateUrl: 'validate-sop-dialog.html',
	styleUrls: ['./sop-grid.component.css']
})

export class ValidateSopDialog implements OnInit {
	userDetails: any;
	buyerColl = [];
	ffColl = [];
	form: FormGroup;
	isLoading: boolean = false;
	isOpen = false;
	errtimer = 10;
	isTimerStarted = false;
	timerInterval
	ReferenceMD = ['Cargo Ready Date','Contract Shipment Date'];
	pageStartTime: Date;
	pageCurrentUrl: string;
	events: any;

	constructor(
		private router: Router,
		public dialogRef: MatDialogRef<ValidateSopDialog>,
		private authService: AuthenticationService,
		private reusable: ReusableComponent,
		private formBuilder: FormBuilder,
	) {
		this.createForm()
	}

	ngOnInit() {
		this.pageStartTime = new Date();
		this.pageCurrentUrl = this.router.url;
		this.getBuyer();
		//this.getFF();
		this.events = JSON.parse(this.reusable.decrypt(sessionStorage.getItem('events')));
	}

	ngOnDestroy() {
		this.authService.savePageAccess(this.pageStartTime, new Date(), this.pageCurrentUrl, 'Validate Sop Dialog');
	}

	async getBuyer() {
		let company = [];
		//let result = await this.authService.getBuyer();
		let result = await this.authService.getPrincipalListForSop();
		if (result.success) {
			company = result.result;
			this.buyerColl = company.filter(company => company.is_add_sop == true);
			if (result.rowCount == 1) {
				this.form.get("Buyer").setValue(this.buyerColl[0]);
				this.getStakeHolderList(this.form.get("Buyer").value)
			}
			if (result.rowCount == 0) {
				this.isOpen = true;
				if (!this.isTimerStarted) {
					this.isTimerStarted = true;
					this.startSecCounter()
				}
			}
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async getStakeHolderList(principal:any) {
		let param = { principal_id: principal.company_id };
		//let result = await this.authService.getStakeholderList(param);
		let result = await this.authService.getFFListForAddSOP(param);
		if (result.success) {
			this.ffColl = result.result.filter(x => x.is_accepted);
			result.rowCount == 1 ? this.form.get("FF").setValue(this.ffColl[0]) : '';
			if (result.rowCount == 0) {
				this.isOpen = true;
				if (!this.isTimerStarted) {
					this.isTimerStarted = true;
					this.startSecCounter()
				}
			}
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	startSecCounter() {
		this.timerInterval = setInterval(() => {
			this.errtimer--;
			if (this.errtimer == 0) {
				clearInterval(this.timerInterval);
				this.dialogRef.close("redirect");
			}
		}, 1000)
	}

	createForm() {
		this.form = this.formBuilder.group({
			Buyer: [null, Validators.compose([
				Validators.required,
			])],
			FF: [null, Validators.compose([
				Validators.required,
			])],
			RMD: [null, Validators.compose([
				Validators.required,
			])]
		},
		);
	}

	onClose(msg) {
		this.dialogRef.close(msg);
	}

	async addSOP() {
		if (this.form.get("Buyer").value == undefined || this.form.get("FF").value == undefined || this.form.get('RMD').value == undefined) {
			return;
		}
		let param = {
			principal_id: this.form.get("Buyer").value.company_id,
			pp_type_id: this.form.get("Buyer").value.company_type_id,
			ff_id: this.form.get("FF").value.company_id,
			ff_type_id: this.form.get("FF").value.company_type_id,
			rmd: this.form.get("RMD").value,
			date_of_sop: new Date().toISOString(),
			valid_from: null, //new Date(this.form.get('ValidFrom').value._d).toISOString(),
			valid_to: null, //new Date(this.form.get('ValidTo').value._d).toISOString()
			company_id: this.form.get("Buyer").value.company_id,
			event_id : this.events.ADD_SOP
		}
		let result = await this.authService.insSOP({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success && result.message != undefined) {
			this.reusable.openAlertMsg(result.message, "info");
			this.onClose("false");
		}
		else if (result.success) {
			let sop = {
				sop_id: result.result[0].sop_id,
				p_company: this.form.get("Buyer").value.company_name,
				principal_id: param.principal_id,
				ff_id: param.ff_id,
				ff_company: this.form.get("FF").value.company_name,
				date_of_sop: param.date_of_sop,
				sop_status_id: result.result[0].sop_status_id,
				status: "Draft",
				pending_days: 0,
				valid_from: param.valid_from,
				valid_to: param.valid_to,
				copy_from: true
			}
			sessionStorage.setItem("sop", this.reusable.encrypt(JSON.stringify(sop)));
			this.onClose("true");
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}
}