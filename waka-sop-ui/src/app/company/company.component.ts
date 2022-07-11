import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { AuthenticationService } from '../_services/index';
import { ReusableComponent, ConfirmDialog } from '../reusable/reusable.component';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { DomSanitizer } from '@angular/platform-browser';

export interface CompSummaryClass {
	company_id: number,
	company_name: string,
	parent_company_id: number,
	user_id: number,
	email: string,
	mobile: string,
	full_name: string,
	is_active: boolean,
	is_deleted: boolean,
	created_on: Date,
	is_admin: boolean,
	company_type_id: number,
	previewurl: any,
	company_logo_path: any,
	office_category_id: number,
	website_address: any,
	company_invite_id: number,
	state_id: number,
	country_id: number,
}

export interface AddressClass {
	address_type_id: number,
	name: string,
	mobile: string,
	email: string,
	address: string,
	country_id: number,
	state_id: number,
	city_id: number,
	city: string,
	zip_code: string
}

@Component({
	selector: 'app-company',
	templateUrl: './company.component.html',
	styleUrls: ['./company.component.css'],
})

export class CompanyComponent implements OnInit {
	isLoading: boolean = false;
	ht: number;
	width: number;
	userDetails;
	companyColl = new MatTableDataSource<CompSummaryClass>([]);
	companyCollforLogo = [];
	companyLogos = [];
	oldImage1pathArr = [];
	previewUrlArr = [];
	dispcompany = ["company_logo", "company_name", "parent_company", "license_status", "no_of_stakeholders", "invt_company", "invt_contact", "edit", "delete"];
	companyInviteColl = new MatTableDataSource([]);
	dispinvitecompany = ["invitee_company_name", "company_type_name", "status", "module_shared", "invitee_contact_name", "invitee_email", "edit", "delete"];
	compnay: CompSummaryClass;
	companyTypeId: number;
	licModuleVal: any;
	isPendingReq: boolean = false;
	parentCompany: any;
	selectedModules: any;
	summaryToggle: string = 'table';
	isInviteTab: boolean = false;
	tabTitle: string = "My Companies";
	selectedTabIndex = 0;
	uploadPlaceholder: string = environment.upload_placeholder;
	noimagePlaceholder: string = environment.noimage_placeholder;
	noimagePlaceholderTable: string = environment.noimage_placeholder_table;
	imgFile: any;
	logoUploaded: boolean;
	fileName: any;
	pageStartTime: Date;
	pageCurrentUrl: string;
	isMobile: boolean = false;
	
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild('TableSort', { static: true }) tableSort: MatSort;
	@ViewChild(MatSort) set matSort(ms: MatSort) {
		this.sort = ms;
		this.setCompanySorting();
	}
	@ViewChild('TableSort') set matSort1(ms1: MatSort) {
		this.tableSort = ms1;
		this.setCompanyInviteSorting();
	}

	constructor(
		private reusable: ReusableComponent,
		private authService: AuthenticationService,
		private router: Router,
		public dialog: MatDialog,
		private sanitizer: DomSanitizer
	) { }

	ngOnInit() {
		this.pageStartTime = new Date();
		this.pageCurrentUrl = this.router.url;
		this.reusable.screenChange.subscribe(res => {
			this.ht = res['height'] - 204;
			this.width = res["width"] - 64;
		});
		if(this.width < 500) {
			this.isMobile = true;
		} else {
			this.isMobile = false;
		}
		this.userDetails = ReusableComponent.usr;
		this.reusable.titleHeader.next("Company List");
		if (!this.userDetails.is_admin) {
			this.getMyCompanies();

		}
		else {
			this.getSummaryForCompAdmin();
		}
		this.reusable.curRoute.next(null);
		// this.reusable.headHt.next(60);
		this.reusable.pageData.subscribe(pndCompany => {
			if (pndCompany != undefined) {
				this.isPendingReq = true;
				pndCompany.contact_invite_id != null || pndCompany.invitee_company_id != null ? this.getMyCompanies() : this.addCompany();
			}
			else this.isPendingReq = false;
		})
	}

	public getSantizeUrl(url : string) {
		return this.sanitizer.bypassSecurityTrustUrl(url);
	}
	
	ngOnDestroy() {
		this.authService.savePageAccess(this.pageStartTime, new Date(), this.pageCurrentUrl, 'Company Grid');
	}

	setCompanySorting() {
		this.companyColl.sort = this.sort;
	}

	setCompanyInviteSorting() {
		this.companyInviteColl.sort = this.tableSort;
	}

	goBack() {
		this.router.navigate(['home']);
	}

	addCompany() {
		this.router.navigate(['/nav/company/AddEditCompany']);
	}

	addCompanyContact(elements) {
		sessionStorage.setItem("CompanyContactParam", JSON.stringify(elements));
		this.router.navigate(['/nav/company/AddCompanyContact'], { state: { openDialog: true } });
	}

	async editCompany(elements) {
		let param = {
			company_id: elements.company_id,
		}
		this.isLoading = true;
		let result = await this.authService.getCompanyBasicDetails({ param: JSON.stringify(param) });
		this.isLoading = false;
		if (result.success) {
			result.result[0]["is_licensed"] = elements.license_cnt == 1 ? true : false;
			sessionStorage.setItem("editCompanyParam", JSON.stringify(result.result));
			this.router.navigate(['/nav/company/AddEditCompany']);
		}
	}

	tabChanged(tabChangeEvent: MatTabChangeEvent): void {
		if (tabChangeEvent.index == 0) {
			this.isInviteTab = false;
			this.tabTitle = "My Companies"
		} else {
			this.isInviteTab = true;
			this.tabTitle = "Associated Companies"
		}
	}

	toggleNavigate(nav) {
		if (nav == 'cards' && this.tabTitle == "My Companies") {
			this.router.navigate(['/nav/company/details']);
		} else if (nav == 'cards' && this.tabTitle == "Associated Companies") {
			sessionStorage.setItem("parentCompanyParam", JSON.stringify(this.parentCompany));
			this.router.navigate(['/nav/company/associatedCompanyDetails']);
		} else {
			this.router.navigate(['/nav/company']);
		}
	}

	applyCompanyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.companyColl.filter = filterValue.trim().toLowerCase();
	}

	applyAssociatedCompanyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.companyInviteColl.filter = filterValue.trim().toLowerCase();
	}

	async getMyCompanies() {
		this.isLoading = true;
		let result = await this.authService.getUsersCompany();
		this.isLoading = false;
		if (result.success) {
			let res = result.result.filter(value => value.is_own_company || value.is_view) 
			this.companyColl = new MatTableDataSource<CompSummaryClass>(res);
			if (result.rowCount != 0) {
				if (result.rowCount == 1) {
					if (result.result[0].license_cnt == undefined && result.result[0].license_cnt != null && this.userDetails.company_admin_cnt != 0 && !result.result[0].is_deleted) {
						const firstCompany = result.result[0];
						const page = JSON.parse(sessionStorage.getItem('redirect'));
						if (!page && !this.isPendingReq) {
							setTimeout(() => {
								this.dialog.open(ConfirmDialog, {
									data: {
										type: 'info-success-req-license-contact',
										content: "You can now Request License or Add Contact",
										details: firstCompany,
									},
									disableClose: true,
								});
							}, 1000);
						}
						if (page) {
							if (page.licenseReq && !this.isPendingReq) {
								this.manageLicense(firstCompany);
							}
						}
					}
					if (result.result[0].license_cnt == -1 && this.userDetails.company_admin_cnt != 0 && !result.result[0].is_deleted) {
						if (!this.isPendingReq) {
							setTimeout(() => {
								this.dialog.open(ConfirmDialog, {
									data: {
										type: 'info-pending-req-license-pending',
										content: "License Requested ! Contact Admin for Approval",
									}
								});
							}, 2000);
						}
					}
					if (result.result[0].license_cnt == 1 && result.result[0].ci_count < 1 && this.userDetails.company_admin_cnt != 0 && !result.result[0].is_deleted) {
						const firstCompany = result.result[0];

						const page = JSON.parse(sessionStorage.getItem('redirectcompany'));
						if (!page && !this.isPendingReq) {
							setTimeout(() => {
								this.dialog.open(ConfirmDialog, {
									data: {
										type: 'info-success-licensed-company-contact',
										content: "License Approved ! Now Invite Stakeholders Company or Contact",
										details: firstCompany,
									},
									disableClose: true,
								});
							}, 1000);
						}
						if (page && !this.isPendingReq) {
							if (page.inviteCompany) {
								this.inviteCompany(firstCompany);
								this.inviteNewCompany();
							}
						}
					} else if (result.result[0].license_cnt == 1 && result.result[0].ci_count == 1 && this.userDetails.company_admin_cnt && !result.result[0].is_deleted) {
						const firstCompany = result.result[0];
						let param = {
							company_id: firstCompany.company_id,
						}
						let details = await this.authService.getCompanyContactDetails({ param: JSON.stringify(param) });
						if (details.success && details.rowCount == 0) {
							if (!this.isPendingReq) {
								setTimeout(() => {
									this.dialog.open(ConfirmDialog, {
										data: {
											type: 'info-success-licensed-contact',
											content: "Now you can Invite Contact for your Company",
											details: firstCompany,
										}
									});
								}, 500);
							}
						}

					}
				}
				this.companyColl.data.map((col, index) => {
					if (col.company_logo_path == null) {
						this.companyColl.data[index].previewurl = this.noimagePlaceholderTable;
					} else {
						this.getLogo(col.company_logo_path, index);
					}

				})
				this.companyColl.sort = this.sort;
			} else {
				setTimeout(() => {
					this.dialog.open(ConfirmDialog, {
						data: {
							type: 'welcome-msg',
							content: '',
						},
						disableClose: true,
					});
				}, 200);

			}
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async getLogo(path, index) {
		let img1Path = { filePath: path };
		this.authService.getCompanyLogo(img1Path).subscribe(img => {
			//this.oldImage1path = img1Path.filePath;
			this.createImageFromBlob(img, index);
		});
	}

	createImageFromBlob(image: Blob, index) {
		let reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = (_event) => {
			this.companyColl.data[index].previewurl = reader.result;
		}
	}

	uploadLogo(event, index) {
		this.companyColl.data[index].previewurl = null;
		var imageExtension = /(\.png|\.jpg|\.jpeg)$/i;
		if (imageExtension.exec(event.target.value) && event.target.value.split('.').length == 2) {
			this.imgFile = <File>event.target.files[0];
			this.fileName = event.target.files[0]["name"];
			if (this.imgFile.size) {
				let reader = new FileReader();
				reader.readAsDataURL(this.imgFile);
				reader.onload = (event: any) => {
					this.companyColl.data[index].previewurl = reader.result;
					this.companyColl.data[index].company_logo_path = reader.result;
					this.addUpdateCustomer(index);
					this.getLogo(this.companyColl.data[index].company_logo_path, index);
					this.isLoading = true;
					setTimeout(() => {
						this.getMyCompanies();
						this.isLoading = false;
					}, 3000);

					//this.previewUrl = event.target.result;
				}
				//this.fileName == undefined ? this.existPath = false : this.existPath = true;
			}
		} else {
			this.reusable.openAlertMsg("Unsupported Format", "error");
		}
	}

	async addUpdateCustomer(index) {
		if (this.companyColl.data.length > 0) {
			this.isLoading = true;
			const customer = {
				company_id: this.companyColl.data ? this.companyColl.data[index].company_id : null,
				//exist_logo_path: this.existPath == true && this.companyColl.data ? this.companyColl.data[0].company_logo_path : null,
				company_logo: this.companyColl.data[index].previewurl,
				logo_file_name: (this.fileName == undefined) ? null : this.fileName,
				company_type_id: this.companyColl.data[index].company_type_id,
				parent_company: this.companyColl.data[index].parent_company_id,
				office_type: this.companyColl.data[index].office_category_id,
				company_name: this.companyColl.data[index].company_name,
				company_website: this.companyColl.data[index].website_address,
				company_invite_id: this.companyColl.data[index].company_invite_id,
				country_id: this.companyColl.data[index].country_id,
				state_id: this.companyColl.data[index].state_id,
			};
			let result = await this.authService.insUpdCompany(customer);
			this.isLoading = false;
			if (result.success) {
				this.logoUploaded = true;
				setTimeout(() => {
					this.dialog.open(ConfirmDialog, {
						data: {
							type: 'info-success',
							content: "Logo Updated",
						}
					});
				}, 100);
				//this.router.navigate(['/nav/company']);
			} else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
				if (result.invalidToken != undefined && result.invalidToken) {
					this.router.navigate(['/nav/company']);
				}
			}
		} else {
			this.reusable.openAlertMsg("Form is not valid, please check for errors", "info");
		}
	}

	async getSummaryForCompAdmin() {
		let result = await this.authService.getAdminCompany();
		if (result.success) {
			this.companyColl = new MatTableDataSource<CompSummaryClass>(result.result);
			this.companyTypeId = this.companyColl.data[0].company_type_id;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async getlicenseModules(company_id) {
		this.isLoading = true;
		const param = {
			company_id: company_id,
		}
		let result = await this.authService.getlicenseModules({ param: JSON.stringify(param) });
		this.isLoading = false;
		if (result.success) {
			this.licModuleVal = result.result[0];
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async manageLicense(ele) {
		const dialogRef = this.dialog.open(CompanyManageLicenseComponent, {
			height: '100%',
			width: '400px',
			position: { right: '0px' },
			data: { element: ele }
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.getMyCompanies();
			}
		});
	}

	async getLicense(ele) {
		await this.getlicenseModules(ele.company_id);
		let dialogRef;
		if (ele.license_cnt == -1) {
			dialogRef = this.dialog.open(CompanyManageLicenseComponent, {
				height: '100%',
				width: '400px',
				position: { right: '0px' },
				data: { element: ele, m_d_ids: this.licModuleVal }
			});
		} else {
			dialogRef = this.dialog.open(CompanyManageLicenseComponent, {
				height: '100%',
				width: '400px',
				position: { right: '0px' },
				data: { element: ele, m_d_ids: this.licModuleVal }
			});
		}
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.getMyCompanies();
			}
		});
	}

	async deleteCompany(ele) {
		let msg;
		if (ele.parent_company_id != null) {
			let type: String = ele.is_deleted == true ? "retrieve" : "delete";
			msg = ele.is_deleted == true ? "Successfully Retrieved" : "Successfully Deleted";
			let conf = confirm("Are you sure you want to " + type + " this Company?");
			if (!conf) return;
		} else {
			let type: String = ele.is_deleted == true ? "retrieve" : "delete";
			msg = ele.is_deleted == true ? "Successfully Retrieved" : "Successfully Deleted";
			let conf = confirm("This is a parent company for some companies so ,Are you sure you want to " + type + " this Company?");
			if (!conf) return;
		}
		let param = {
			company_id: ele.company_id,
			is_deleted: ele.is_deleted == true ? false : true
		}
		let result = await this.authService.delCompany(param);
		if (result.success) {
			this.reusable.openAlertMsg(msg, "info");
			this.getMyCompanies();
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	inviteCompany(ele) {
		this.selectedTabIndex = 1;
		this.parentCompany = ele
		this.getInvitedCompanies(ele);
	}

	inviteNewCompany() {
		setTimeout(() => {
			const dialogRef = this.dialog.open(InviteCompanyAddDialogComponent, {
				height: '100%',
				width: '820px',
				position: { right: '0px' },
				data: { parentCompany: this.parentCompany },
				panelClass: 'dialogclass',
				disableClose: true,
			});
			dialogRef.afterClosed().subscribe(result => {
				if (result) {
					this.getInvitedCompanies(this.parentCompany);
					this.router.navigate(['/nav/company']);
				}
			});
		}, 500);
	}

	async getInvitedCompanies(ele) {
		const param = {
			company_id: ele.company_id == undefined ? ele.invited_company_id : ele.company_id,
		}
		let result = await this.authService.getInviteCompany(param);
		if (result.success) {
			this.companyInviteColl = new MatTableDataSource(result.result);
			this.companyInviteColl.sort = this.tableSort;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async getModules(ele) {
		let param = {
			company_invite_id: ele.company_invite_id
		};
		let result = await this.authService.getInviteCompanySharedLicensedModulesList({ param: JSON.stringify(param) });
		if (result.success) {
			this.selectedModules = result.result;
			this.licModuleVal = result.result[0];
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async getSelectedModules(company_id) {
		this.isLoading = true;
		const param = {
			company_id: company_id,
		}
		let result = await this.authService.getSharedLicenseModules({ param: JSON.stringify(param) });
		this.isLoading = false;
		if (result.success) {
			this.licModuleVal = result.result[0];
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	//not used after 18-10-2021
	async inviteCompanyApproveRevoke(ele) {
		let msg, type;
		if (ele.is_accepted == true || (!ele.is_accepted && !ele.is_revoked && !ele.is_denied)) {
			msg = "Company : " + ele.invitee_company_name + " Revoked ";
			type = "revoke";
		} else if (ele.is_revoked == true) {
			msg = "Company : " + ele.invitee_company_name + " Approved";
			type = "approve"
		}
		let conf = confirm("Do you want to " + type + " this Company?");
		if (!conf) return;
		let param = {
			company_invite_id: ele.company_invite_id,
			type: type,
			uc_id: ele.uc_id
		};
		let result = await this.authService.inviteCompanyApproveRevoke({ param: JSON.stringify(param) });
		if (result.success) {
			this.reusable.openAlertMsg(msg, "info");
			this.getInvitedCompanies(ele);
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	//not used after 18-10-2021
	async inviteEditCompany_old(ele) {
		await this.getModules(ele);
		const dialogRef = this.dialog.open(InviteCompanyAddDialogComponent, {
			width: '55%', data: { parentCompany: this.parentCompany, element: ele, m_d_ids: this.licModuleVal }
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.getInvitedCompanies(ele);
			}
		});
	}

	async inviteEditCompany(ele) {
		await this.getModules(ele);
		// const dialogRef = this.dialog.open(InviteCompanyAddDialogComponent, {
		// 	width: '55%', data: { parentCompany: this.parentCompany, element: ele, m_d_ids: this.licModuleVal }
		// });
		// dialogRef.afterClosed().subscribe(result => {
		// 	if (result) {
		// 		this.getInvitedCompanies(ele);
		// 	}
		// });

		const dialogRef = this.dialog.open(InviteCompanyAddDialogComponent, {
			height: '100%',
			width: '820px',
			position: { right: '0px' },
			data: { parentCompany: this.parentCompany , element: ele, m_d_ids: this.licModuleVal},
			panelClass: 'dialogclass',
			disableClose: true,
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.getInvitedCompanies(this.parentCompany);
				this.router.navigate(['/nav/company']);
			}
		});
	}

	async delInviteCompany(ele) {
		let conf = confirm("Do you want to Delete this Company Invite?");
		if (!conf) return;
		let param = { 
			company_invite_id: ele.company_invite_id,
			poi_master_error_id: ele.poi_master_error_id
		};
		let result = await this.authService.delInviteCompany({ param: JSON.stringify(param) });
		if (result.success) {
			setTimeout(() => {
				this.dialog.open(ConfirmDialog, {
					data: {
						type: 'info-success',
						content: "Company Invite Deleted",
					}
				});
			}, 100);
			this.getInvitedCompanies(ele);
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async delInviteCompany_old(ele) {
		let type: String = ele.is_deleted == true ? "retrieve" : "delete";
		let msg = ele.is_deleted == true ? "Successfully Retrieved" : "Successfully Deleted";
		let conf = confirm("Do you want to " + type + " this Company?");
		if (!conf) return;
		let param = { company_invite_id: ele.company_invite_id, type: type };
		let result = await this.authService.delInviteCompany({ param: JSON.stringify(param) });
		if (result.success) {
			this.reusable.openAlertMsg(msg, "info");
			this.getInvitedCompanies(ele);
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}
}


@Component({
	selector: 'app-company-card-view',
	templateUrl: './company.component-card-view.html',
	styleUrls: ['./company.component.css'],
})

export class CompanyCardViewComponent implements OnInit {

	firstDisplayCompany: any[];
	isInviteButtonActive: boolean = true;
	isAddButtonActive: boolean = false;
	contactColl = [];
	data: any;
	companyTabDetail: any;
	isLoading: boolean = false;
	ht: number;
	SidePanelWidth: number = 420;
	userDetails: any;
	width: number;
	companyColl = [];
	summaryToggle: string = 'cards';
	isInviteTab: boolean = false;
	selectedTabIndex = 0;
	tabTitle: string = "Active";
	companyDetail: any = null;
	previewUrl; fileName;
	oldImage1path;
	license_status: string;
	accesibleModules: [];
	res: any;
	parentCompanyId: any;
	licModuleVal: any;
	companyInviteColl = new MatTableDataSource([]);
	companyDetails: any;
	uploadPlaceholder: string = environment.upload_placeholder;
	noimagePlaceholder: string = environment.noimage_placeholder;

	@ViewChild('TableSort', { static: true }) tableSort: MatSort;

	constructor(
		private reusable: ReusableComponent,
		private authService: AuthenticationService,
		private router: Router,
		public dialog: MatDialog,
	) { }

	ngOnInit() {
		this.reusable.screenChange.subscribe(res => {
			this.ht = res['height'] - 204;
			this.width = res["width"] - 64;
		});
		this.userDetails = ReusableComponent.usr;
		this.reusable.titleHeader.next("Company List");
		this.reusable.headHt.next(60);
		this.getMyCompanies();


	}
	async getMyCompanies() {
		this.isLoading = true;
		let result = await this.authService.getUsersCompany();
		this.isLoading = false;
		if (result.success) {
			this.companyColl = result.result;
			this.firstDisplayCompany = [{
				company_id: result.result[0].company_id,
				company_name: result.result[0].company_name,
			}]
			this.companyColl.map((col, index) => {
				if (col.company_logo_path == null) {
					this.companyColl[index].previewurl = this.noimagePlaceholder;
				} else {
					this.getLogo(col.company_logo_path, index);
				}
			})
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async getLogo(path, index) {
		let img1Path = { filePath: path };
		this.authService.getCompanyLogo(img1Path).subscribe(img => {
			//this.oldImage1path = img1Path.filePath;
			this.createImageFromBlob(img, index);
		});

	}

	createImageFromBlob(image: Blob, index) {
		let reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = (_event) => {
			this.companyColl[index].previewurl = reader.result;
		}
	}

	//not used after 18-10-2021
	async getMyCompanies_old() {
		let result = await this.authService.getUsersCompany();
		if (result.success) {
			this.companyColl = result.result;
			this.firstDisplayCompany = [{
				company_id: result.result[0].company_id,
				company_name: result.result[0].company_name,
			}]
			//this.getCompanyContactDetails(this.firstDisplayCompany[0]);
			result.result.forEach((x, i) => {
				if (x.company_logo_path != null) {
					this.getLogo1(x.company_logo_path, x.company_id);
				} else {
					this.companyColl.map(x1 => x1['previewurl'] = null);
				}
			});
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	addCompany() {
		this.router.navigate(['/nav/company/AddEditCompany']);
	}

	addCompanyContact(ele) {
		this.data = ele;
		const dialogRef = this.dialog.open(AddContactCompanyDialogComponent, {
			width: '68%', data: { companyId: this.data.company_id, companyName: this.data.company_name, }
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.getCompanyContactDetails(ele);
			}
		});
	}
	//edit contact
	editCompanyContact(ele) {
		this.data = ele;
		const dialogRef = this.dialog.open(AddContactCompanyDialogComponent, {
			width: '68%', data: { element: ele, companyId: this.data.company_id, companyName: this.data.company_name, }
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.getCompanyContactDetails(ele);
			}
		});
	}

	async getCompanyContactDetails(ele) {
		this.isLoading = true;
		this.data = ele;
		this.companyDetails = ele;
		this.companyTabDetail = [
			{
				"name": ele.company_name,
				"cci_accepted": ele.cci_is_accepted,
				"ci_accepted": ele.ci_is_accepted,
				"license_cnt": ele.license_cnt
			}
		]
		let param = {
			company_id: ele.company_id, company_name: ele.company_name,
		};
		let result = await this.authService.getCompanyContactDetails({ param: JSON.stringify(param) });
		if (result.success) {
			this.contactColl = result.result;
			this.isLoading = false;
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	tabChanged(tabChangeEvent: MatTabChangeEvent): void {
		if (tabChangeEvent.index == 0) {
			this.isInviteButtonActive = true;
			this.isAddButtonActive = false;
		} else if (tabChangeEvent.index == 1) {
			this.isAddButtonActive = true;
			this.isInviteButtonActive = false;
		}
	}

	applyCompanyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		//this.companyColl.filter = filterValue.trim().toLowerCase();
	}

	toggleNavigate(nav) {
		if (nav == 'cards') {
			this.router.navigate(['/nav/company/details']);
		} else {
			this.router.navigate(['/nav/company']);
		}
	}

	getCompanyDetail(ele) {
		this.getRegDetails(ele.company_id);
		ele.license_cnt != undefined ? this.getlicenseModules(ele.company_id) : '';
		this.getAddress(ele.company_id)
		//ele.company_logo_path != null ? this.getLogo(ele.company_logo_path) : null
		this.companyDetail = [ele];
		if (ele.license_cnt == 1)
			this.license_status = "Licensed";
		else if (ele.license_cnt == -1)
			this.license_status = "Pending";
		else
			this.license_status = "Request License";
	}

	async getAddress(id: number) {
		this.isLoading = true;
		const param = { company_id: id }
		let data = await this.authService.getCompanyAllAddressDetails(param);
		this.isLoading = false;
		if (data.success) {
			if (data.result.length != 0) {
				data.result.map((x) => {
					if (x.lookup_name == "communication") {
						this.companyDetail[0]['RegAddress'] = x.address;
						this.companyDetail[0]['RegCountry'] = x.country_name;
						this.companyDetail[0]['RegZipCode'] = x.zip_code;
						this.companyDetail[0]['RegMobile'] = x.mobile;
						this.companyDetail[0]['RegState'] = x.state_name;
						this.companyDetail[0]['RegCity'] = x.city_name;
					} else if (x.lookup_name == "billing") {
						this.companyDetail[0]['BillAddress'] = x.address;
						this.companyDetail[0]['BillCountry'] = x.country_name;
						this.companyDetail[0]['BillZipCode'] = x.zip_code;
						this.companyDetail[0]['BillMobile'] = x.mobile;
						this.companyDetail[0]['BillState'] = x.state_name;
						this.companyDetail[0]['BillCity'] = x.city_name;
					}
				})
			}
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(data), "error");
		}
	}

	async getRegDetails(id: number) {
		this.isLoading = true;
		const param = { company_id: id }
		let data = await this.authService.getCompanyRegDetails(param);
		this.isLoading = false;
		if (data.success) {
			this.companyDetail[0]['reg_name'] = data.result[0].lookup_name;
			this.companyDetail[0]['reg_number'] = data.result[0].reg_number;
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(data), "error");
		}
	}

	async manageLicense(ele) {
		const dialogRef = this.dialog.open(CompanyManageLicenseComponent, {
			width: '920px', data: { element: ele }
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.getMyCompanies();
			}
		});
	}

	async getlicenseModules(company_id) {
		this.isLoading = true;
		const param = {
			company_id: company_id,
		}
		let result = await this.authService.getlicenseModules({ param: JSON.stringify(param) });
		this.isLoading = false;
		if (result.success) {
			this.accesibleModules = result.result[0].module_name;
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	//not used after 18-10-2021
	async getLogo_old(path) {
		let img1Path = { filePath: path };
		this.authService.getCompanyLogo(img1Path).subscribe(img => {
			this.oldImage1path = img1Path.filePath;
			this.createImageFromBlob_old(img);
		});
	}

	//not used after 18-10-2021
	createImageFromBlob_old(image: Blob) {
		let reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = (_event) => {
			this.previewUrl = reader.result;
		}
	}

	async getLogo1(path, company_id) {
		let img1Path = { filePath: path };
		this.authService.getCompanyLogo(img1Path).subscribe(img => {
			this.oldImage1path = img1Path.filePath;
			let x = this.createImageFromBlob1(img, company_id);
			return x;
		});
	}

	createImageFromBlob1(image: Blob, company_id) {
		let reader = new FileReader();
		reader.readAsDataURL(image);
		let res;
		reader.onload = (_event) => {
			this.previewUrl = reader.result;
			this.companyColl.map(x1 => { if (x1.company_id == company_id) x1['previewUrl'] = this.previewUrl });
		}
	}

	editCompany(elements) {
		sessionStorage.setItem("editCompanyParam", JSON.stringify(elements));
		this.router.navigate(['/nav/company/AddEditCompany']);
	}

}

@Component({
	selector: 'app-invite-company-card-view',
	templateUrl: './invite-company.component-card-view.html',
	styleUrls: ['./company.component.css'],
})

export class AssociatedCompanyCardViewComponent implements OnInit {

	isLoading: boolean = false;
	ht: number;
	SidePanelWidth: number = 420;
	userDetails: any;
	width: number;
	companyColl = [];
	summaryToggle: string = 'cards';
	isInviteTab: boolean = false;
	selectedTabIndex = 0;
	tabTitle: string = "Active";
	companyDetail: any = null;
	previewUrl; fileName;
	oldImage1path;
	license_status: string;
	accesibleModules: [];
	res: any;
	licModuleVal: any;
	parentCompany: any;

	constructor(
		private reusable: ReusableComponent,
		private authService: AuthenticationService,
		private router: Router,
		public dialog: MatDialog,
	) { }

	ngOnInit(): void {
		this.reusable.screenChange.subscribe(res => {
			this.ht = res['height'] - 204;
			this.width = res["width"] - 64;
		});
		this.parentCompany = JSON.parse(sessionStorage.getItem("parentCompanyParam"))
		this.reusable.titleHeader.next("Associated Company List");
		this.reusable.headHt.next(60);
		this.getMyCompanies();
	}

	async getMyCompanies() {
		const param = {
			company_id: this.parentCompany.company_id,
		}
		let result = await this.authService.getInvitedCompaniesList(param);
		if (result.success) {
			this.companyColl = result.result;
			result.result.forEach((x, i) => {
				if (x.company_logo_path != null) {
					this.getLogo1(x.company_logo_path, x.company_id);
				} else {
					this.companyColl.map(x1 => x1['previewUrl'] = null);
				}
			});
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	toggleNavigate(nav) {
		if (nav == 'cards') {
			this.router.navigate(['/nav/company/associatedCompanyDetails']);
		} else {
			this.router.navigate(['/nav/company']);
		}
	}

	tabChanged(tabChangeEvent: MatTabChangeEvent): void {
		if (tabChangeEvent.index == 0) {
			this.isInviteTab = false;
			this.tabTitle = "My Companies"
		} else {
			this.isInviteTab = true;
			this.tabTitle = "Associated Companies"
		}
	}

	myCompanies() {
		this.router.navigate(['/nav/company']);
	}

	getCompanyDetail(ele): void {
		this.getlicenseModules(ele.invited_company_id);
		this.getAddress(ele.invitee_company_id)
		ele.company_logo_path != null ? this.getLogo(ele.company_logo_path) : null
		this.companyDetail = [ele];
		if (ele.is_accepted == true)
			this.license_status = "Registered";
		else if (ele.is_denied == true)
			this.license_status = "Denied";
		else if (ele.is_revoked == true)
			this.license_status = "Revoked";
		else
			this.license_status = "Pending";
	}

	async getAddress(id: number) {
		this.isLoading = true;
		const param = { company_id: id }
		let data = await this.authService.getCompanyAllAddressDetails(param);
		this.isLoading = false;
		if (data.success) {
			if (data.result.length != 0) {
				data.result.map((x) => {
					if (x.lookup_name == "communication") {
						this.companyDetail[0]['RegAddress'] = x.address;
						this.companyDetail[0]['RegCountry'] = x.country_name;
						this.companyDetail[0]['RegZipCode'] = x.zip_code;
						this.companyDetail[0]['RegMobile'] = x.mobile;
						this.companyDetail[0]['RegState'] = x.state_name;
						this.companyDetail[0]['RegCity'] = x.city_name;
					} else if (x.lookup_name == "billing") {
						this.companyDetail[0]['BillAddress'] = x.address;
						this.companyDetail[0]['BillCountry'] = x.country_name;
						this.companyDetail[0]['BillZipCode'] = x.zip_code;
						this.companyDetail[0]['BillMobile'] = x.mobile;
						this.companyDetail[0]['BillState'] = x.state_name;
						this.companyDetail[0]['BillCity'] = x.city_name;
					}
				})
			}
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(data), "error");
		}
	}

	async getlicenseModules(company_id) {
		this.isLoading = true;
		const param = {
			company_id: company_id,
		}
		let result = await this.authService.getlicenseModules({ param: JSON.stringify(param) });
		this.isLoading = false;
		if (result.success) {
			this.accesibleModules = result.result[0].module_name;
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async getLogo(path) {
		let img1Path = { filePath: path };
		this.authService.getCompanyLogo(img1Path).subscribe(img => {
			this.oldImage1path = img1Path.filePath;
			this.createImageFromBlob(img);
		});
	}

	createImageFromBlob(image: Blob) {
		let reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = (_event) => {
			this.previewUrl = reader.result;
		}
	}

	async getLogo1(path, company_id) {
		let img1Path = { filePath: path };
		this.authService.getCompanyLogo(img1Path).subscribe(img => {
			this.oldImage1path = img1Path.filePath;
			let x = this.createImageFromBlob1(img, company_id);
			return x;
		});
	}

	createImageFromBlob1(image: Blob, company_id) {
		let reader = new FileReader();
		reader.readAsDataURL(image);
		let res;
		reader.onload = (_event) => {
			this.previewUrl = reader.result;
			this.companyColl.map(x1 => { if (x1.company_id == company_id) x1['previewUrl'] = this.previewUrl });
		}
	}

	async getModules(ele) {
		let param = {
			company_invite_id: ele.company_invite_id
		};
		let result = await this.authService.getInviteCompanySharedLicensedModulesList({ param: JSON.stringify(param) });
		if (result.success) {
			this.licModuleVal = result.result[0];
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	inviteNewCompany() {
		const dialogRef = this.dialog.open(InviteCompanyAddDialogComponent, {
			width: '55%', data: { parentCompany: this.parentCompany }
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.getMyCompanies();
			}
		});
	}

	async inviteEditCompany(ele) {
		await this.getModules(ele);
		const dialogRef = this.dialog.open(InviteCompanyAddDialogComponent, {
			width: '55%', data: { parentCompany: this.parentCompany, element: ele, m_d_ids: this.licModuleVal }
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.getMyCompanies();
			}
		});
	}

}

/*
 * Add Edit Company 
 */
@Component({
	selector: 'company-add-edit',
	templateUrl: 'company-addedit.html',
	styleUrls: ['./company.component.css']
})

export class CompanyAddEdit implements OnInit {
	objectKeys = Object.keys;
	objectValues = Object.values;
	isLoading = false;
	screenParam: any;
	isMobile: boolean = false;
	title: string;
	form: FormGroup;
	Addressform: FormGroup;
	dispForm = false
	compColl = [];
	btnTitle: string = "SAVE";
	companyId: number = null;
	addressTypesList = [];
	addressCollTypesList = [];
	companyTypeList = [];
	officeTypesList = [];
	parentCompanyList = [];
	taxRegistrationList = [];
	stateList = []; countryList: any; cityList = [];
	regStateList: any; regCityList: any;
	stateDefaultList: any; cityDefaultList: any;
	isEditMode: boolean = false;
	data = undefined;
	newCompanytoCreate = undefined; 
	boolChkCompanyName: boolean = true;
	oldImage1path;
	previewUrl;
	fileName;
	addressColl = new MatTableDataSource<AddressClass>([]);
	dispAddress = [];
	isLinear = true;
	basicFormGroup: FormGroup;
	addressFormGroup: FormGroup;
	isPendingCompany: boolean = false;
	pendingCompDetails: any;
	isEditable = false;
	isAddress: boolean = false;
	isBasic: boolean = true;
	existPath: boolean;
	parentCompanyLookupId: any;
	imgFile: File;
	uploadPlaceholder: string = environment.upload_placeholder;
	noimagePlaceholder: string = environment.noimage_placeholder;
	uploadImgButtonTitle: string = "UPLOAD LOGO";
	isImgDeleted: boolean;
	isLogoAvailable: boolean;
	isDuplicateTaxNumber: boolean;
	isDuplicateTaxName: boolean;
	firstTaxName: string;
	LogoUploaded: boolean;
	selectedCountryName: string;
	selectedCountryId: any;
	selectedStateName: string;
	selectedStateId: any;
	ht: number;
	width: number;
	pageStartTime: Date;
	pageCurrentUrl: string;
	userDetails: any;
	
	constructor(
		private formBuilder: FormBuilder,
		private authService: AuthenticationService,
		private router: Router,
		public dialog: MatDialog,
		private reusable: ReusableComponent,
	) { }

	ngOnInit() {
		this.pageStartTime = new Date();
		this.pageCurrentUrl = this.router.url;
		this.getAllCity();
		this.userDetails = ReusableComponent.usr;
		this.reusable.screenChange.subscribe(res => {
			this.reusable.screenChange.subscribe(res => {
				this.ht = res['height'] - 60 - 105;
				this.width = res["width"] - 64;
			});
			if(this.width <= 500){
				this.isMobile = true;
			} else {
				this.isMobile = false;
			}
			this.screenParam = { width: res.width, height: res.height - 60 - 105 };
			if (this.screenParam.width < 600) {
				this.dispAddress = ["address_type", "delete"];
			} else {
				this.dispAddress = ["address_type", "contact_name", "email", "city", "state", "country", "edit", "delete"];
			}
		});
		//this.getAddressTypeList(); not used after 18-10-2021
		this.getCompanyTypeList();
		this.getOfficeTypeList();
		//this.getTaxRegistrationList();	not used after 18-10-2021
		this.getCountry();
		this.getAllState();
		setTimeout(() => {
			this.getParentCompanyList();
		}, 500);
		if (sessionStorage.getItem("editCompanyParam")) {
			this.data = JSON.parse(sessionStorage.getItem("editCompanyParam"));
			this.companyId = this.data[0].company_id;
		} else {
			this.data = null;
		}
		if (sessionStorage.getItem("NewCompanyToCreate")) {
			console.log(JSON.parse(sessionStorage.getItem("NewCompanyToCreate")))
			let obj = JSON.parse(sessionStorage.getItem("NewCompanyToCreate"))
			this.newCompanytoCreate = obj.invitee_company_name
		}
		if (this.data == undefined) {
			this.data = '';
			this.title = "Company Registration";
			this.reusable.titleHeader.next(this.title);
			this.LogoUploaded = false;
			this.createForm();
			//this.addNewTaxDetailsRow();
		} else {
			console.log('this.data', this.data[0])
			this.isEditMode = true;
			this.title = "Edit Company Details";
			this.reusable.titleHeader.next(this.title);
			this.btnTitle = "UPDATE";
			//this.getAddress(this.data.company_id);	not used after 18-10-2021
			//this.getRegDetails(this.data.company_id);	not used after 18-10-2021
			this.isLoading = true;
			this.createForm();
			this.getLogo(this.data[0].company_logo_path);
			this.basicFormGroup.get('RegCountry').setValue(this.data[0].country_id);
			this.getStateList(this.data[0].country_id);
			this.basicFormGroup.get('RegState').setValue(this.data[0].state_id);
			// this.basicFormGroup.get('ParentCompany').setValue(this.data[0].parent_company);
			this.getParentCompanyList();
			this.isLoading = false;
		}
		this.reusable.pageData.subscribe(pndCompany => {
			console.log("pg  data")
			if (pndCompany != undefined) {
				this.pendingCompDetails = pndCompany;
				this.basicFormGroup.get("CompanyName").setValue(this.pendingCompDetails.invitee_company_name);
				this.basicFormGroup.get("CompanyName").disable();
				this.basicFormGroup.get("CompanyLocalName")?.setValue(this.pendingCompDetails.invitee_company_name);
				this.basicFormGroup.get("CompanyType").setValue(this.pendingCompDetails.invitee_company_type_id);
				this.basicFormGroup.get("CompanyType").disable();
				this.addressFormGroup?.get("RegEmail").setValue(this.pendingCompDetails.invitee_email);
			}
		});
	}

	/*
	 *not used after 18-10-2021
	 */
	goBack() {
		this.router.navigate(['/nav/company']);
		sessionStorage.removeItem("editCompanyParam");
	}

	onClose() {
		console.log("WHAT IS THIS ????")
		if (this.pendingCompDetails != undefined) {
			this.router.navigate(['/nav/acceptdeny']);
		} else
			this.router.navigate(['/nav/company']);
	}

	ngOnDestroy() {
		sessionStorage.removeItem("editCompanyParam");
		this.authService.savePageAccess(this.pageStartTime, new Date(), this.pageCurrentUrl, 'Company Add Edit');
	}

	createForm() {
		this.basicFormGroup = this.formBuilder.group({
			OfficeType: [{value : this.data ? this.data[0].office_category_id : '', disabled:  this.data ? this.data[0].is_licensed : ''}, Validators.required],
			ParentCompany: [this.data ? this.data[0].parent_company_id : '', { disabled: this.isEditMode }],
			CompanyType: [this.data ? this.data[0].company_type_id : '', Validators.required],
			CompanyName: [{ value: this.data ? this.data[0].company_name : this.newCompanytoCreate ? this.newCompanytoCreate : '' , disabled: this.isEditMode }, Validators.compose([
				Validators.required,
				Validators.minLength(3),
				Validators.maxLength(50),
			])],
			Website: [this.data ? this.data[0].website_address : '', Validators.compose([
				Validators.minLength(3),
				Validators.maxLength(100)
			])],
			RegCountry: [this.data ? this.data[0].country_id : '', [Validators.required]],
			RegState: [this.data ? this.data[0].state_id : '', [Validators.required]],
		})
	}

	//not in use after 18-10-2021
	// createForm_old() {
	// 	this.basicFormGroup = this.formBuilder.group({
	// 		OfficeType: [this.data.office_category_id, Validators.required],
	// 		ParentCompany: [this.data.parent_company_id, Validators.required,
	// 		],
	// 		CompanyType: [this.data.company_type_id, Validators.required],
	// 		CompanyName: [{ value: this.data.company_name, disabled: this.isEditMode }, Validators.compose([
	// 			Validators.required,
	// 			Validators.minLength(3),
	// 			Validators.maxLength(120),
	// 		])],
	// 		CompanyLocalName: [{ value: this.data.company_local_name, disabled: this.isEditMode }, Validators.compose([
	// 			Validators.required,
	// 			Validators.minLength(3),
	// 			Validators.maxLength(120),
	// 		])],
	// 		Website: [this.data.website_address, Validators.compose([
	// 			Validators.minLength(3),
	// 			Validators.maxLength(100)
	// 		])],
	// 		TaxDetails: this.formBuilder.array([])
	// 	}),
	// 		this.addressFormGroup = this.formBuilder.group({
	// 			RegAddress: ['', Validators.compose([
	// 				Validators.required,
	// 				Validators.minLength(3),
	// 				Validators.maxLength(280)
	// 			])],
	// 			RegCountry: ['', Validators.required],
	// 			RegState: ['', Validators.required],
	// 			RegCity: ['', Validators.compose([
	// 				Validators.required,
	// 				Validators.minLength(3),
	// 				Validators.maxLength(100),
	// 			])],
	// 			RegZipCode: [''],
	// 			RegName: ['', Validators.compose([
	// 				Validators.required,
	// 				Validators.minLength(3),
	// 				Validators.maxLength(100),
	// 				this.validateName
	// 			])],
	// 			RegMobile: ['', Validators.compose([
	// 				Validators.maxLength(13),
	// 				this.validateMobile
	// 			])],
	// 			RegEmail: ['', Validators.compose([
	// 				Validators.required,
	// 				Validators.minLength(3),
	// 				Validators.email
	// 			])],
	// 			isTermsAccepted: [false, Validators.required],
	// 			AddressCollType: [''],
	// 			AddressColl: this.formBuilder.array([]),
	// 		}),
	// 		this.Addressform = this.formBuilder.group({
	// 			AddressCollType: [''],
	// 		});
	// 	}

	get formArrTaxDetails(): FormArray {
		return this.basicFormGroup.get("TaxDetails") as FormArray
	}

	get formArrAddressColl() {
		return this.addressFormGroup.get("AddressColl") as FormArray
	}

	//not used after 18-10-2021
	initTaxDetailsRows(): FormGroup {
		return this.formBuilder.group({
			reg_name: ['', Validators.required],
			reg_number: ['', Validators.required],
		})
	}

	//not used after 18-10-2021
	initAddressCollRows(): FormGroup {
		return this.formBuilder.group({
			address_type_id: [''],
			address: [''],
			country_id: [''],
			state_id: [''],
			city_idd: [''],
			zip_code: [''],
			name: [''],
			mobile: [''],
			email: ['', Validators.compose([
				Validators.minLength(3),
				Validators.email
			])],
		});
	}

	//not used after 18-10-2021
	addNewTaxDetailsRow() {
		this.formArrTaxDetails.push(this.initTaxDetailsRows());
	}

	//not used after 18-10-2021
	deleteTaxDetailsRow(index: number) {
		this.formArrTaxDetails.removeAt(index);
	}

	//not used after 18-10-2021
	addNewAddressCollRow() {
		this.formArrAddressColl.push(this.initAddressCollRows());
	}

	//not used after 18-10-2021
	deleteAddressCollRow(index: number) {
		this.formArrAddressColl.removeAt(index);
	}

	getErrorMessage(control, controlName) {
		let msg = '';
		msg += control.hasError('required') ? ' Field cannot be empty' : '';
		if (controlName == 'CompanyName') { msg += (control.errors.minlength || control.errors.maxlength) ? 'Character limit should be between 3 to 50' : '' }
		if (controlName == 'CompanyName') { msg += (control.errors.CompanyExists) ? 'Company Name already Exists' : '' }
		if (controlName == 'CompanyName') { msg += (control.errors.CompanyTypeExists) ? 'Office Category already Exists' : '' }
		if (controlName == 'CompanyName') { msg += (control.errors.CompanyNameEmpty) ? 'Company Name is invalid' : '' }
		return msg;
	}
	//not in use after 18-10-2021
	getErrorMessage_old(control, controlName) {
		let msg = '';
		msg += control.hasError('required') ? ' Field cannot be empty' : '';
		if (controlName == 'RegEmail') { msg += control.hasError('email') ? 'Not a valid email. ' : '' }
		if (controlName == 'RegEmail') { msg += control.errors.minlength ? 'Must be between 3 & 50 char length. ' : '' }
		if (controlName == 'CompanyName') { msg += (control.errors.minlength || control.errors.maxlength) ? 'Must be between 3 & 50 char length. ' : '' }
		if (controlName == 'CompanyName') { msg += (control.errors.CompanyExists) ? 'Company Name already Exists' : '' }
		if (controlName == 'CompanyLocalName') { msg += (control.errors.minlength || control.errors.maxlength) ? 'Must be between 3 & 50 char length. ' : '' }
		if (controlName == 'RegAddress') { msg += (control.errors.minlength || control.errors.maxlength) ? 'Must be between 3 & 50 char length. ' : '' }
		if (controlName == 'RegName') { msg += (control.errors.minlength || control.errors.maxlength) ? 'Must be between 3 & 50 char length. ' : '' }
		if (controlName == 'RegMobile') { msg += (control.errors.minlength || control.errors.maxlength) ? 'Must be a 13 digit number. ' : '' }
		if (controlName == 'RegMobile') { msg += control.hasError('validateMobile') ? 'Must be a valid no. ' : '' }
		if (controlName == 'form') { msg += control.hasError('matchingPasswords') ? 'Password, confirm password must be same' : '' }
		return msg;
	}
	//not used after 18-10-2021
	getErrorMessageOptionalFields(control, controlName) {
		let msg = '';
		if (controlName == 'email') { msg += control.hasError('email') ? 'Not a valid email. ' : '' }
		if (controlName == 'email') { msg += control.errors.minlength ? 'Must be between 3 & 50 char length. ' : '' }
		if (controlName == 'reg_number') { msg += (control.errors.RegNumberExists) ? 'CIN and GSTIN should not have same value' : '' }
		if (controlName == 'reg_name') { msg += (control.errors.RegNameExists) ? 'CIN & GSTIN should be Unique' : '' }
		return msg;
	}

	//not used after 18-10-2021
	validateMobile(controls) {
		if (controls.value == undefined) return null;
		const reqExp = new RegExp("^[+0-9\- ]+$");
		if (reqExp.test(controls.value)) {
			if (controls.value.trim().length == 0) return { 'validateMobile': true };
			return null;
		}
		else {
			return { 'validateMobile': true };
		}
	}

	//not used after 18-10-2021
	validateName(controls) {
		if (controls.value == undefined) return null;
		const reqExp = new RegExp("^[a-zA-Z ]+$");
		if (reqExp.test(controls.value)) {
			if (controls.value.trim().length == 0) return { 'validateName': true };
			return null;
		}
		else {
			return { 'validateName': true };
		}
	}

	//not used after 18-10-2021
	nextStage() {
		this.isAddress = true;
		this.isBasic = false;
		document.getElementById('nextStage').click();
	}

	//not used after 18-10-2021
	prevStage() {
		this.isAddress = false;
		this.isBasic = true;
		document.getElementById('prevStage').click();
	}

	async checkParentCompany(company_id) {
		let param = { parent_company_id: company_id };
		let result = await this.authService.checkParentCompany({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.rowCount > 0) {
			this.basicFormGroup.get('OfficeType').disable();
		}
	}

	//Logo get,update,delete
	async getLogo(path) {
		this.existPath = true;
		let img1Path = { filePath: path };
		this.authService.getCompanyLogo(img1Path).subscribe(img => {
			if (img.size > 64) {
				this.isLogoAvailable = true;
				this.oldImage1path = img1Path.filePath;
				this.createImageFromBlob(img);
			}
			else {
				this.isLogoAvailable = false;
			}
		});
	}

	//image creation from blob for upload
	createImageFromBlob(image: Blob) {
		let reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = (_event) => {
			this.previewUrl = reader.result;
		}
	}

	uploadLogo(element) {
		var imageExtension = /(\.png|\.jpg|\.jpeg)$/i;
		if (imageExtension.exec(element.target.value) && element.target.value.split('.').length == 2) {
			this.imgFile = <File>element.target.files[0];
			this.fileName = element.target.files[0]["name"];
			if (this.imgFile.size) {
				let reader = new FileReader();
				reader.readAsDataURL(this.imgFile);
				reader.onload = (event: any) => {
					this.previewUrl = event.target.result;
					this.LogoUploaded = true;
				}
				this.fileName == undefined ? this.existPath = false : this.existPath = true;
			}
		} else {
			this.reusable.openAlertMsg("Unsupported Format", "error");
		}
	}
	//remove logo local before updating
	removeLogo() {
		if (!this.isEditMode) {
			this.fileName = null;
			this.previewUrl = null;
			this.isLogoAvailable = false;
			this.LogoUploaded = false;
		}
	}

	//remove after created in database
	async fileRemove() {
		let conf = confirm("Are you sure you want to remove the file?");
		if (!conf) return;
		let param = { removeImage: this.data[0].company_logo_path };
		let data = await this.authService.removeCompanyLogo(param);
		if (this.isLogoAvailable) {
			if (data.success) {
				setTimeout(() => {
					this.dialog.open(ConfirmDialog, {
						data: {
							type: 'info-success',
							content: data.message,
						}
					});
				}, 100);
				this.previewUrl = null;
				this.fileName = undefined;
				this.isImgDeleted = true;
				this.isLogoAvailable = false;
				this.LogoUploaded = false;
				this.oldImage1path = null;
				this.data[0].company_logo_path = null;
			} else {
				this.reusable.openAlertMsg(this.authService.invalidSession(data), "error");
			}
		}
		else {
			this.previewUrl = null;
			this.fileName = undefined;
			this.isImgDeleted = true;
			this.isLogoAvailable = false;
			this.oldImage1path = null;
		}
	}

	async getCompanyTypeList() {
		let result = await this.authService.getCompanyTypeList();
		if (result.success) {
			this.companyTypeList = result.result;
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}
	//not used after 18-10-2021
	async getAddressTypeList() {
		let result = await this.authService.getAddressTypeList();
		if (result.success) {
			this.addressCollTypesList = result.result;
			this.addressTypesList = this.addressCollTypesList.filter(x => x.lookup_name != 'registered')
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async getOfficeTypeList() {
		this.isLoading = true;
		let result = await this.authService.getOfficeTypeList();
		if (result.success) {
			this.officeTypesList = result.result;
			this.parentCompanyLookupId = this.officeTypesList.filter(x => x.lookup_name.toLowerCase() == 'head quarters'
			).map(x => x.lookup_name_id);
			if (this.isEditMode) {
				if (this.data[0].office_category_id == this.parentCompanyLookupId) {
					this.checkParentCompany(this.data[0].company_id);
					this.basicFormGroup.get("ParentCompany").disable();
					this.basicFormGroup.get('ParentCompany').clearValidators();
					this.basicFormGroup.get('ParentCompany').updateValueAndValidity();
				}
			}
			if (this.data.office_category_id == undefined && !this.isEditMode) {
				this.basicFormGroup.get("OfficeType").setValue(this.officeTypesList[0].lookup_name_id);
			}
			this.isLoading = false;
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async getParentCompanyList() {
		this.isLoading = true;
		let param;
		let users = this.data[0] != null ? [this.data[0].owned_by] : [];
		if(this.newCompanytoCreate){
			param = {
				userIds: [this.userDetails.user_id],
			}
		} else {
			param = {
				userIds: users,
			}
		}
		let result = await this.authService.getParentCompanyList(param);
		if (result.success) {
			this.parentCompanyList = result.result.filter(x => x.company_id != this.companyId)
			if (this.parentCompanyLookupId == this.basicFormGroup.get('OfficeType').value) {
				this.basicFormGroup.get("ParentCompany").disable();
				this.basicFormGroup.get('ParentCompany').clearValidators();
				this.basicFormGroup.get('ParentCompany').updateValueAndValidity();
				this.isLoading = false;
			} else {
				if (this.data[0].parent_company_id == undefined && result.rowCount > 0) {
					this.basicFormGroup.get("ParentCompany").setValue(this.parentCompanyList[0].lookup_name_id);
				}
				this.isLoading = false;
			}
			if(this.newCompanytoCreate){
				this.basicFormGroup.get('ParentCompany').disable();
			} else {
				if(this.isEditMode){
					this.data[0].owned_by != this.userDetails.user_id ? this.basicFormGroup.get('ParentCompany').disable() : this.basicFormGroup.get('ParentCompany').enable();
				}
			}
			
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	//not used after 18-10-2021
	async getTaxRegistrationList() {
		let result = await this.authService.getTaxRegistrationList();
		if (result.success) {
			this.taxRegistrationList = result.result;
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async getCountry() {
		let result = await this.authService.getCountryListForCompany();
		if (result.success) {
			this.countryList = result.result;
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async getStateList(id: number) {
		this.selectedCountryId = id;
		let param = { country_id: id };
		let result = await this.authService.getStateListForCompany(param);
		if (result.success) {
			this.regStateList = result.result;
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async getRegState(id: number) {
		this.basicFormGroup.get('RegState').setValue(null);
		this.selectedCountryId = id;
		let param = { country_id: id };
		let result = await this.authService.getStateListForCompany(param);
		if (result.success) {
			this.regStateList = result.result;
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}


	async getState(id: number, index: number) {
		let param = { country_id: id };
		let result = await this.authService.getStateListForCompany(param);
		if (result.success) {
			this.stateList[index] = result.result;
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async getAllState() {
		let result = await this.authService.getStateLookup();
		if (result.success) {
			this.stateDefaultList = result.result;
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	//not used after 18-10-2021
	async getAllCity() {
		let result = await this.authService.getCityLookup();
		if (result.success) {
			this.cityDefaultList = result.result;
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async getRegCity(id: number) {
		this.selectedStateId = id;
		let param = { state_id: id };
		let result = await this.authService.getCityListForCompany(param);
		if (result.success) {
			this.regCityList = result.result;
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	//not used after 18-10-2021
	async getCity(id: number, index: number) {
		let param = { state_id: id };
		let result = await this.authService.getCityListForCompany(param);
		if (result.success) {
			this.cityList[index] = result.result;
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async checkCompanyName() {
		if (this.basicFormGroup.get('CompanyName').value.trim() == '' || this.basicFormGroup.get('CompanyName').value.length < 3) {
			this.basicFormGroup.get('CompanyName').setErrors({ CompanyNameEmpty: true })
		}
		// const comp = this.basicFormGroup.get('CompanyName').value.trim();
		// this.basicFormGroup.get('CompanyName').setValue(comp);
		let cusData = {
			company_name: this.basicFormGroup.get("CompanyName").value.toLowerCase().replace(/ /gi, ''),
			office_type: this.basicFormGroup.get("OfficeType").value,
			company_id: this.data.company_id
		};
		let result = await this.authService.validateCompanyOwner(cusData);
		if (result.success && result.own_company && result.rowCount > 0) {
			// console.log('own company can create branches')
			let cusDataname = {
				company_name: this.basicFormGroup.get("CompanyName").value.toLowerCase().replace(/ /gi, ''),
				office_type: this.basicFormGroup.get("OfficeType").value,
				company_id: this.data.company_id
			};
			let data = await this.authService.validateCompanyName(cusDataname);
			if (data.success && data.result == "Available") {
				this.boolChkCompanyName = true;
				this.basicFormGroup.get("CompanyName").setErrors({ CompanyTypeExists: null });
				this.basicFormGroup.get("CompanyName").updateValueAndValidity();
				return true;
			} else if (data.success) {
				this.boolChkCompanyName = false;
				this.basicFormGroup.get("CompanyName").setErrors({ CompanyTypeExists: true });
				return false;
			} else {
				this.reusable.openAlertMsg(this.authService.invalidSession(data), "error");
			};
		} else if (result.success && !result.own_company && result.rowCount > 0) {
			this.basicFormGroup.get("CompanyName").setErrors({ CompanyExists: true });
		} else if (result.success && result.company_name_avl) {
			// console.log('your have this name')
		}
		// if (this.basicFormGroup.get("CompanyName").status == "VALID") {
		// 	let cusData = {
		// 		company_name: this.basicFormGroup.get("CompanyName").value.toLowerCase().replace(/ /gi, ''),
		// 		office_type: this.basicFormGroup.get("OfficeType").value,
		// 		company_id: this.data.company_id
		// 	};
		// 	let result = await this.authService.validateCompanyName(cusData);
		// 	if (result.success && result.result == "Available") {
		// 		this.boolChkCompanyName = true;
		// 		return true;
		// 	} else if (result.success) {
		// 		this.boolChkCompanyName = false;
		// 		this.basicFormGroup.get("CompanyName").setErrors({ CompanyExists: true });
		// 		return false;
		// 	} else {
		// 		this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		// 	};
		// } else {
		// 	let cusData = {
		// 		company_name: this.basicFormGroup.get("CompanyName").value.toLowerCase().replace(/ /gi, ''),
		// 		office_type: this.basicFormGroup.get("OfficeType").value,
		// 		company_id: this.data.company_id
		// 	};
		// 	let result = await this.authService.validateCompanyName(cusData);
		// 	if (result.success && result.result == "Available") {
		// 		this.boolChkCompanyName = true;
		// 		this.basicFormGroup.get("CompanyName").setErrors({ CompanyExists: null });
		// 		this.basicFormGroup.get("CompanyName").updateValueAndValidity();
		// 		return true;
		// 	} else if (result.success) {
		// 		this.boolChkCompanyName = false;
		// 		this.basicFormGroup.get("CompanyName").setErrors({ CompanyExists: true });
		// 		return false;
		// 	} else {
		// 		this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		// 	};
		// }

	}

	async checkParent() {
		this.checkCompanyName();
		if (this.basicFormGroup.get('OfficeType').value == this.parentCompanyLookupId) {
			this.basicFormGroup.get('ParentCompany').setValue(null);
			this.basicFormGroup.get('ParentCompany').disable();
			this.basicFormGroup.get('ParentCompany').clearValidators();
			this.basicFormGroup.get('ParentCompany').updateValueAndValidity();
		} else {
			this.basicFormGroup.get('ParentCompany').setValidators(Validators.required);
			this.basicFormGroup.get('ParentCompany').updateValueAndValidity();
			this.basicFormGroup.get('ParentCompany').setValue(null);
			this.basicFormGroup.get('ParentCompany').enable();
		}
	}

	//not used after 18-10-2021
	async getRegDetails(id: number) {
		this.isLoading = true;
		const param = { company_id: id }
		let data = await this.authService.getCompanyRegDetails(param);
		this.isLoading = false;
		if (data.success) {
			if (data.result.length != 0) {
				for (let i = 0; i < data.result.length; i++) {
					this.formArrTaxDetails.push(this.initTaxDetailsRows());
				}
				this.basicFormGroup.get('TaxDetails').setValue(data.result);
			} else {
				this.formArrTaxDetails.removeAt(0);
			}
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(data), "error");
		}
	}

	//not used after 18-10-2021
	async checkDuplicateRegName() {
		let data = this.basicFormGroup.get('TaxDetails').value;
		if (data[0].reg_name == 72) {
			this.firstTaxName = "CIN";
		}
		else {
			this.firstTaxName = " GSTIN";
		}
		if (data.length > 1) {
			if (data[0].reg_name == data[1].reg_name) {
				this.isDuplicateTaxName = true;
				this.basicFormGroup.get('TaxDetails').setErrors({ RegNameExists: true });
			}
			else {
				this.isDuplicateTaxName = false;
			}
		}
		let firstRegName = data[0].reg_name;
	}

	//not used after 18-10-2021
	async checkDuplicateRegNumber() {
		let data = this.basicFormGroup.get('TaxDetails').value;
		if (data.length > 1) {
			if (data[0].reg_number == data[1].reg_number) {
				this.basicFormGroup.get('TaxDetails').setErrors({ RegNumberExists: true });
				this.isDuplicateTaxNumber = true;
			}
			else {
				this.isDuplicateTaxNumber = false;
			}
		}
	}

	//not used after 18-10-2021
	addAddressArray() {
		let selectedVal = this.addressFormGroup.get('AddressCollType').value;
		this.addNewAddressCollRow();
		let indexVal = this.formArrAddressColl.controls.length - 1;
		this.stateList[indexVal] = [];
		this.cityList[indexVal] = [];
		this.formArrAddressColl.at(indexVal).patchValue({ address_type_id: selectedVal });

	}

	//not used after 18-10-2021
	async getAddress(id: number) {
		this.isLoading = true;
		const param = { company_id: id }
		let data = await this.authService.getCompanyAddressDetails(param);
		this.isLoading = false;
		if (data.success) {
			let registeredTypeId = this.addressCollTypesList.find((x) => {
				return x.lookup_name == 'registered'
			});

			if (data.result.length != 0) {
				data.result.map((x, i) => {
					if (x.address_type_id == registeredTypeId.lookup_name_id) {
						this.getRegState(x.country_id);
						this.addressFormGroup.get('RegAddress').setValue(x.address);
						this.addressFormGroup.get('RegCountry').setValue(x.country_id);
						this.addressFormGroup.get('RegZipCode').setValue(x.zip_code);
						this.addressFormGroup.get('RegName').setValue(x.name);
						this.addressFormGroup.get('RegMobile').setValue(x.mobile);
						this.addressFormGroup.get('RegEmail').setValue(x.email);
						this.addressFormGroup.get('RegState').setValue(x.state_id);
						if (x.city_id == null) {
							this.addressFormGroup.get('RegCity').setValue({ name: x.city });
						} else {
							let cityName = this.cityDefaultList.filter((value) => {
								return value.city_id == x.city_id
							});
							this.addressFormGroup.get('RegCity').setValue(cityName[0]);
						}
					} else {
						this.formArrAddressColl.push(this.initAddressCollRows());
						this.getState(x.country_id, i);
						this.formArrAddressColl.at(i).patchValue(x);
						if (x.city_id == null) {
							this.formArrAddressColl.at(i).patchValue({ city_idd: { name: x.city } });
						} else {
							let cityName = this.cityDefaultList.filter((value) => {
								return value.city_id == x.city_id
							});
							this.formArrAddressColl.at(i).patchValue({ city_idd: cityName[0] });
						}
					}
				});
			} else {
				this.formArrAddressColl.removeAt(0);
			}
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(data), "error");
		}
	}

	//not used after 18-10-2021
	dispAddressType(id: number) {
		let addressType = this.addressTypesList.filter((value) => {
			return value.lookup_name_id == id
		});
		let renamed = addressType[0].lookup_name.toLowerCase();
		return renamed.replace(/address/gi, '');
	}

	displayFn(city): any {
		if (city != null) {
			return city.name;
		}
	}

	async addUpdateCustomer() {
		if (this.basicFormGroup.valid) {
			//this.isLoading = true;
			const customer = {
				company_id: this.data ? this.data[0].company_id : null,
				exist_logo_path: this.existPath == true && this.data ? this.data[0].company_logo_path : null,
				company_logo: (this.fileName == undefined) ? null : this.previewUrl,
				logo_file_name: (this.fileName == undefined) ? null : this.fileName,
				company_type_id: this.basicFormGroup.get('CompanyType').value,
				parent_company: this.basicFormGroup.get('ParentCompany').value == '' ? null : this.basicFormGroup.get('ParentCompany').value,
				office_type: this.basicFormGroup.get('OfficeType').value,
				company_name: this.basicFormGroup.get('CompanyName').value.trim(),
				company_website: this.basicFormGroup.get('Website').value == null ? this.basicFormGroup.get('Website').value : this.basicFormGroup.get('Website').value.trim(),
				company_invite_id: this.pendingCompDetails != undefined ? this.pendingCompDetails.company_invite_id : null,
				country_id: this.selectedCountryId,
				state_id: this.basicFormGroup.get('RegState').value
			};
			let result = await this.authService.insUpdCompany(customer);
			this.isLoading = false;
			if (result.success) {
				if (this.pendingCompDetails != undefined) {
					this.updateCompanyInvite(result.result[0].company_id);
				}
				setTimeout(() => {
					this.dialog.open(ConfirmDialog, {
						data: {
							type: 'info-success-company-add',
							content: result.message,
						},
						disableClose: true,
					});
				}, 500);
				//this.router.navigate(['/nav/company']);
			} else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
				if (result.invalidToken != undefined && result.invalidToken) {
					this.router.navigate(['/nav/company']);
				}
			}

		} else {
			this.reusable.openAlertMsg("Form is not valid, please check for errors", "info");
		}



	}
	//not used after 18-10-2021
	async addUpdateCustomer_old() {
		if (this.basicFormGroup.valid && this.addressFormGroup.valid) {
			this.isLoading = true;
			this.addressFormGroup.get('AddressColl').value.map((x) => {
				x.city_id = x.city_idd.city_id == undefined ? null : x.city_idd.city_id;
				x.city = x.city_idd.city_id == undefined ? x.city_idd.name == undefined ? x.city_idd : x.city_idd.name : null;
			});
			let registeredTypeId = this.addressCollTypesList.find((x) => {
				return x.lookup_name == 'registered'
			});
			var commAdress = this.formBuilder.group({
				address_type_id: [registeredTypeId.lookup_name_id],
				address: [this.addressFormGroup.get('RegAddress').value],
				country_id: [this.addressFormGroup.get('RegCountry').value],
				state_id: [this.addressFormGroup.get('RegState').value],
				city_id: [this.addressFormGroup.get('RegCity').value.city_id == undefined ? null : this.addressFormGroup.get('RegCity').value.city_id],
				city: [this.addressFormGroup.get('RegCity').value.city_id == undefined ? this.addressFormGroup.get('RegCity').value.name == undefined ? this.addressFormGroup.get('RegCity').value : this.addressFormGroup.get('RegCity').value.name : null],
				zip_code: [this.addressFormGroup.get('RegZipCode').value],
				name: [this.addressFormGroup.get('RegName').value],
				mobile: [this.addressFormGroup.get('RegMobile').value],
				email: [this.addressFormGroup.get('RegEmail').value],
			});
			this.addressFormGroup.get('AddressColl').value.push(commAdress.value);
			const customer = {
				company_id: this.data.company_id,
				exist_logo_path: this.existPath == true ? this.data.company_logo_path : null,
				company_logo: (this.fileName == undefined) ? null : this.previewUrl,
				logo_file_name: (this.fileName == undefined) ? null : this.fileName,
				company_type_id: this.basicFormGroup.get('CompanyType').value,
				parent_company: this.basicFormGroup.get('ParentCompany').value == '' ? null : this.basicFormGroup.get('ParentCompany').value,
				office_type: this.basicFormGroup.get('OfficeType').value,
				company_name: this.basicFormGroup.get('CompanyName').value.trim(),
				company_local_name: this.basicFormGroup.get('CompanyLocalName').value.trim(),
				company_website: this.basicFormGroup.get('Website').value == null ? this.basicFormGroup.get('Website').value : this.basicFormGroup.get('Website').value.trim(),
				tax_details: this.basicFormGroup.get('TaxDetails').value,
				address_coll: this.addressFormGroup.get('AddressColl').value,
				company_invite_id: this.pendingCompDetails != undefined ? this.pendingCompDetails.company_invite_id : null,
			};
			let result = await this.authService.insUpdCompany(customer);
			this.isLoading = false;
			if (result.success) {
				this.reusable.openAlertMsg(result.message, "info");
				if (this.pendingCompDetails != undefined) {
					this.updateCompanyInvite(result.result[0].company_id);
				}
				this.router.navigate(['/nav/company']);
			} else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
				if (result.invalidToken != undefined && result.invalidToken) {
					this.router.navigate(['/nav/company']);
				}
			}
		} else {
			this.reusable.openAlertMsg("Form is not valid, please check for errors", "info");
		}
	}

	async updateCompanyInvite(invitee_company_id) {
		let param = {
			company_invite_id: this.pendingCompDetails.company_invite_id,
			invitee_company_id: invitee_company_id,
			invited_company_id: this.pendingCompDetails.invited_company_id,
			type: 'accept',
			poi_master_error_id: this.pendingCompDetails.poi_master_error_id,
			master_error_type: this.pendingCompDetails.master_error_type,
			ref_code:this.pendingCompDetails.ref_code ? this.pendingCompDetails.ref_code : null,
			invitee_company_name: this.pendingCompDetails.invitee_company_name ? this.pendingCompDetails.invitee_company_name : null
		}
		let result = await this.authService.updCompanyInviteAccept({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			this.reusable.pageData.next(undefined);
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
		this.router.navigate(['/nav/company']);
	}
}

/* Manage License */
@Component({
	selector: 'company-manage-license',
	templateUrl: 'company-manage-license.html',
	styleUrls: ['./company.component.css']
})

export class CompanyManageLicenseComponent implements OnInit {

	isLoading: boolean;
	form: FormGroup;
	moduleVal: any;
	licensedModules: any;
	moduleValNames: [];
	moduleIcons: [];
	btnTitle: string;
	isLicenceActive: boolean = false;
	isSaving = false;
	selectedModules = [];
	modulesList = [];
	confirmModulesList = [];
	pageStartTime: Date;
	pageCurrentUrl: string;


	constructor(
		public dialogRef: MatDialogRef<CompanyManageLicenseComponent>,
		@Inject(MAT_DIALOG_DATA) public data: CompanyManageLicenseComponent,
		private reusable: ReusableComponent,
		private authService: AuthenticationService,
		private formBuilder: FormBuilder,
		public dialog: MatDialog,
	) { }

	ngOnInit() {
		this.pageStartTime = new Date();
		this.pageCurrentUrl = 'nav/company-manageLicense';
		this.getModulesList();
		if (this.data['element'].license_cnt == null || this.data['element'].license_cnt == -1) {
			this.btnTitle = "SUBMIT REQUEST";
			this.moduleVal = this.data['m_d_ids'] == undefined ? [] : this.data['m_d_ids'].m_d_ids;
		} else {
			this.isLicenceActive = true;
			this.moduleVal = this.data['m_d_ids'].m_d_ids;
			this.btnTitle = "Update";
			this.moduleValNames = this.data['m_d_ids'].module_name;
			this.moduleIcons = this.data['m_d_ids'].module_icon;
			//this.licensedModules.push(this.data['m_d_ids'].module_name, this.data['m_d_ids'].module_icon)
		}

	}

	createForm() {
		this.form = this.formBuilder.group({
			Module: [this.moduleVal, Validators.required],
		})
	}

	async getModulesList() {
		this.isLoading = true;
		let param = {
			is_licensed: true
		}
		let data = await this.authService.getModules({ param: this.reusable.encrypt(JSON.stringify(param)) });
		this.isLoading = false;
		if (data.success) {
			data.result.forEach(element => {
				//if (this.moduleVal.indexOf(element.module_id) == -1) element.is_selected = true
				// if(element.module_id == this.data['m_d_ids'].m_d_ids){
				// 	element.is_selected = true;
				// }
				if (this.data['m_d_ids'] != undefined) {
					this.data['m_d_ids'].m_d_ids.map((x) => {
						//changes for time sake
						// if (x == element.module_id) {
						// 	element.is_selected = true;
						// }
						element.is_selected = true;
					});
				} else {
					if (this.moduleVal.indexOf(element.module_id) == -1) element.is_selected = true
				}

				// else element.is_selected = true;
			});

			this.selectedModules = data.result;
			this.confirmModulesList = this.selectedModules.filter((x) => x.is_selected)
			//this.selectedModules = this.modulesList.filter(i => i.is_selected == true);
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(data), "error");
		}
	}

	onChange(ele, i) {
		if (this.selectedModules[i].is_selected == true) {
			this.selectedModules[i].is_selected = false;
		} else {
			this.selectedModules[i].is_selected = true;
		}
		this.confirmModulesList = this.selectedModules.filter((x) => x.is_selected)

		// if (ele.is_selected){
		// 	this.selectedModules.push(ele);
		// } else {
		// 	this.selectedModules = this.selectedModules.filter(i => i.is_selected == true);
		// }
	}


	async saveLicense() {
		let metrics = [];
		if (this.confirmModulesList.length != 0) {
			this.isLoading = true;
			this.confirmModulesList.map(ele => {
				if(ele.module_id == 1){
					metrics.push(Number(ele.module_id));
				}
			});
			let data, msg;
			const param = {
				m_ids: 2,
				company_id: this.data['element'].company_id,
				cl_id: this.data['m_d_ids'] != undefined ? this.data['m_d_ids'].cl_id : null
			};
			if (this.data['element'].license_cnt == null && metrics.length>0) {
				data = await this.authService.insCompanyLicense({ param: JSON.stringify(param) });
				setTimeout(() => {
					this.dialog.open(ConfirmDialog, {
						data: {
							type: 'info-pending',
							content: "License Request Submitted Successfully. We will notify you shortly!",
						}
					});
				}, 500);
			} else if (this.data['element'].license_cnt == -1 && metrics.length>0) {
				data = await this.authService.updCompanyLicense({ param: JSON.stringify(param) });
				setTimeout(() => {
					this.dialog.open(ConfirmDialog, {
						data: {
							type: 'info-pending',
							content: "License Request Submitted Successfully. We will notify you shortly!",
						}
					});
				}, 1000);

			}
			else {
				this.reusable.openAlertMsg("License Selection is not valid, Please select admin module", "error");
			}
			this.isLoading = false;
			if(metrics.length>0){
				if (data.success) {
					this.onClose(data.success);
				} else {
					this.reusable.openAlertMsg(this.authService.invalidSession(data), "error");
					if (data.invalidToken != undefined && data.invalidToken) {
						this.onClose(data.success);
					}
				}
			}
		} else {
			this.reusable.openAlertMsg("License Selection is not valid, please check for errors", "info");
		}

	}

	close() {
		this.dialogRef.close(true);
		sessionStorage.removeItem('redirect');
	}

	onClose(status: boolean) {
		this.dialogRef.close(status);
	}

	ngOnDestroy() {
		this.authService.savePageAccess(this.pageStartTime, new Date(), this.pageCurrentUrl, 'Company Manage License.');
	}

}

@Component({
	selector: 'invite-company',
	templateUrl: './invite-company.component.html',
	styleUrls: ['./company.component.css'],
})

export class InviteCompanyComponent implements OnInit {
	isLoading: boolean = false;
	ht: number;
	width: number;
	screenParam: any;
	companyInviteColl = new MatTableDataSource([]);
	dispcompany = ["invitee_company_name", "invitee_contact_name", "invitee_email", "status", "created_on", "status_date", "module_shared", "edit", "delete"];
	@ViewChild('TableSort', { static: true }) tableSort: MatSort;
	compnay: CompSummaryClass;
	companyTypeId: number;
	parentCompanyId: any;
	licModuleVal: any;
	title: string;
	selectedModules: any;
	pageStartTime: Date;
	pageCurrentUrl: string;


	constructor(
		private reusable: ReusableComponent,
		private authService: AuthenticationService,
		private router: Router,
		public dialog: MatDialog,
	) { }

	ngOnInit() {
		this.pageStartTime = new Date();
		this.pageCurrentUrl = this.router.url;
		this.reusable.screenChange.subscribe(res => {
			this.screenParam = { width: res.width, height: res.height - 60 };
			this.ht = res['height'] - 64;
			this.width = res["width"] - 64;
		});
		this.parentCompanyId = JSON.parse(sessionStorage.getItem("inviteCompanyParam"));
		this.title = this.parentCompanyId.company_name + "'s Invited Companies";
		this.reusable.titleHeader.next(this.title);
		this.getInvitedCompanies();
		this.reusable.headHt.next(60);
	}

	applyCompanyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.companyInviteColl.filter = filterValue.trim().toLowerCase();
	}

	goBack() {
		this.router.navigate(['/nav/company']);
		sessionStorage.removeItem("inviteCompanyParam");
	}

	ngOnDestroy() {
		sessionStorage.removeItem("inviteCompanyParam");
		this.authService.savePageAccess(this.pageStartTime, new Date(), this.pageCurrentUrl, 'Invite Company');
	}

	inviteCompany() {
		const dialogRef = this.dialog.open(InviteCompanyAddDialogComponent, {
			width: '55%', data: { parentCompanyId: this.parentCompanyId }
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.getInvitedCompanies();
			}
		});
	}

	async getInvitedCompanies() {
		const param = {
			company_id: this.parentCompanyId.company_id,
		}
		let result = await this.authService.getInviteCompany(param);
		if (result.success) {
			this.companyInviteColl = new MatTableDataSource(result.result);
			this.companyInviteColl.sort = this.tableSort;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async getModules(ele) {
		let param = {
			company_id: ele.company_id
		};
		let result = await this.authService.getInviteCompanySharedLicensedModulesList({ param: JSON.stringify(param) });
		if (result.success) {
			this.selectedModules = result.result;
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async getSelectedModules(company_id) {
		this.isLoading = true;
		const param = {
			company_id: company_id,
		}
		let result = await this.authService.getSharedLicenseModules({ param: JSON.stringify(param) });
		this.isLoading = false;
		if (result.success) {
			this.licModuleVal = result.result[0];
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async inviteEditCompany(ele) {
		await this.getSelectedModules(ele.invitee_company_id);
		const dialogRef = this.dialog.open(InviteCompanyAddDialogComponent, {
			width: '55%', data: { parentCompanyId: this.parentCompanyId, element: ele, m_d_ids: this.licModuleVal }
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.getInvitedCompanies();
			}
		});
	}

	async delInviteCompany(ele) {
		let type: String = ele.cdeleted == true ? "retrieve" : "delete";
		let msg = ele.cdeleted == true ? "Successfully Retrieved" : "Successfully Deleted";
		let conf = confirm("Do you want to " + type + " this Company?");
		if (!conf) return;
		let param = { company_id: ele.company_id, type: type };
		let result = await this.authService.delInviteCompany({ param: JSON.stringify(param) });
		if (result.success) {
			setTimeout(() => {
				this.dialog.open(ConfirmDialog, {
					data: {
						type: 'info-success',
						content: msg,
					}
				});
			}, 1000);
			this.getInvitedCompanies();
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}
}

@Component({
	selector: 'add-contact-company',
	templateUrl: './add-contacts.component.html',
	styleUrls: ['./company.component.css'],
})

export class AddContactCompanyComponent implements OnInit {
	isLoading: boolean = false;
	ht: number;
	width: number;
	screenParam: any;
	contactColl = new MatTableDataSource([]);
	dispcompany = ["contact_name", "email", "mobile", "role_name", "status", "edit", "delete"];
	@ViewChild('TableSort', { static: true }) tableSort: MatSort;
	companyTypeId: number;
	data: any;
	header: string;
	pageStartTime: Date;
	pageCurrentUrl: string;
	userDetails: any;
	ownerEmail: any;
	
	constructor(
		private reusable: ReusableComponent,
		private authService: AuthenticationService,
		private router: Router,
		public dialog: MatDialog,
	) { }

	ngOnInit() {
		this.pageStartTime = new Date();
		this.pageCurrentUrl = this.router.url;
		this.reusable.screenChange.subscribe(res => {
			this.screenParam = { width: res.width, height: res.height - 60 };
			this.ht = res['height'] - 204;
			this.width = res["width"] - 64;
		});
		this.data = JSON.parse(sessionStorage.getItem("CompanyContactParam"));
		this.header = this.data.company_name.toUpperCase() + "'s CONTACTS";
		this.reusable.titleHeader.next(this.header);
		this.reusable.headHt.next(60);
		this.userDetails = ReusableComponent.usr;
		this.getCompanyContactDetails();
		if(history.state.openAddContactDialog){
			setTimeout(() => {
				this.addCompanyContact()
			}, 1500);
		}
	}

	applyCompanyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.contactColl.filter = filterValue.trim().toLowerCase();
	}

	goBack() {
		this.router.navigate(['/nav/company']);
		sessionStorage.removeItem("CompanyContactParam");
	}

	ngOnDestroy() {
		sessionStorage.removeItem("CompanyContactParam");
		this.authService.savePageAccess(this.pageStartTime, new Date(), this.pageCurrentUrl, 'Company Contact Add');
	}

	async getCompanyContactDetails() {
		this.isLoading = true;
		let param = {
			company_id: this.data.company_id,
		};
		let result = await this.authService.getCompanyContactDetails({ param: JSON.stringify(param) });
		if (result.success) {
			this.contactColl = new MatTableDataSource(result.result);
			this.isLoading = false;
			this.ownerEmail = result.data[0].email;
			this.contactColl.data.push(result.data[0]);
			this.contactColl.sort = this.tableSort;
			this.reusable.refreshModules.next(true);
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}

	}

	addCompanyContact() {
		const dialogRef = this.dialog.open(AddContactCompanyDialogComponent, {
			width: '430px',
			height: '100%',
			position: { right: '0px' },
			panelClass: 'dialogclass',
			data: { companyId: this.data.company_id, companyName: this.data.company_name, parentCompanyId: this.data.parent_company_id , ownerEmail: this.ownerEmail}
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.getCompanyContactDetails();
			}
		});
	}

	editCompanyContact(ele) {
		const dialogRef = this.dialog.open(AddContactCompanyDialogComponent, {
			width: '430px',
			height: '100%',
			position: { right: '0px' },
			panelClass: 'dialogclass',
			data: { element: ele, companyId: this.data.company_id, companyName: this.data.company_name, parentCompanyId: this.data.parent_company_id}
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.getCompanyContactDetails();
			}
		});
	}

	editCompanyContact_old(ele) {
		const dialogRef = this.dialog.open(AddContactCompanyDialogComponent, {
			width: '68%', data: { element: ele, companyId: this.data.company_id, companyName: this.data.company_name, parentCompanyId: this.data.parent_company_id }
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.getCompanyContactDetails();
			}
		});
	}

	async delCompanyContact(ele) {
		let type: String = ele.is_deleted == true ? "retrieve" : "delete";
		let msg = ele.is_deleted == true ? "Successfully Retrieved " : "Successfully Deleted";
		let conf = confirm("Do you want to " + type + " this Contact?");
		if (!conf) return;
		let param = { 
			contact_invite_id: ele.contact_invite_id,
			rum_id: ele.rum_id,
			type: type 
		};
		let result = await this.authService.delCompanyContact({ param: JSON.stringify(param) });
		if (result.success) {
			setTimeout(() => {
				this.dialog.open(ConfirmDialog, {
					data: {
						type: 'info-success',
						content: msg,
					}
				});
			}, 1000);
			this.getCompanyContactDetails();
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async inviteContactApproveRevoke(ele) {
		let msg, type;
		if (ele.is_accepted == true || (!ele.is_accepted && !ele.is_revoked && !ele.is_denied)) {
			msg = "Contact : " + ele.contact_name + " Revoked ";
			type = "revoke";
		} else if (ele.is_revoked == true) {
			msg = "Contact : " + ele.contact_name + " Approved";
			type = "approve";
		}
		let conf = confirm("Do you want to " + type + " this Contact?");
		if (!conf) return;
		let param = {
			contact_invite_id: ele.contact_invite_id,
			type: type,
			uc_id: ele.uc_id
		};
		let result = await this.authService.inviteContactApproveRevoke({ param: JSON.stringify(param) });
		if (result.success) {
			setTimeout(() => {
				this.dialog.open(ConfirmDialog, {
					data: {
						type: 'info-success',
						content: msg,
					}
				});
			}, 1000);
			this.getCompanyContactDetails();
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}

	}

}

@Component({
	selector: 'add-contact-company',
	templateUrl: './add-compnay-contact-dialog.component.html',
	styleUrls: ['./company.component.css'],
})

export class AddContactCompanyDialogComponent implements OnInit {
	isLoading: boolean = false;
	ht: number;
	width: number;
	form: FormGroup;
	roleList: any;
	parentCompanyAddress: any;
	btnTitle: string;
	title: string;
	emailExists: boolean; invitee_user_id: any;
	isEditMode: boolean;
	userDetails: any;
	isValid: boolean = true;

	constructor(
		private reusable: ReusableComponent,
		private formBuilder: FormBuilder,
		private authService: AuthenticationService,
		public dialogRef: MatDialogRef<AddContactCompanyDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: AddContactCompanyDialogComponent,
		public dialog: MatDialog,

	) { }

	ngOnInit() {
		this.reusable.screenChange.subscribe(res => {
			this.ht = res['height'] - 64;
			this.width = res["width"] - 64;
		});
		if (this.data['element'] == undefined) {
			this.isEditMode = false;
			this.btnTitle = 'Invite';
			this.title = "INVITE CONTACT";
			this.createForm();
		} else {
			this.isEditMode = true;
			this.createForm();
			this.btnTitle = 'Update';
			this.title = "UPDATE " + this.data['companyName'] + " COMPANY's CONTACT";
			this.form.controls.Name.setValue(this.data['element'].contact_name);
			this.form.controls.Mobile.setValue(this.data['element'].mobile);
			this.form.controls.Email.setValue(this.data['element'].email);
			if(this.data['element'].status == 'admin') {
				this.form.get('Name').disable();
				this.form.get('Mobile').disable();
				this.form.get('Email').disable();
			}
			this.setRolesData(this.data['element'].status);
		}
		this.userDetails = ReusableComponent.usr;
		this.getRoles();
	}

	getErrorMessage(control, controlName) {
		let msg = '';
		msg += control.hasError('required') ? 'Field Cannot be empty. ' : '';
		if (controlName == 'Email') { msg += control.hasError('email') ? 'Not a valid email. ' : '' }
		if (controlName == 'Email') { msg += (control.errors.inviteEmailExists) ? 'You cannot self invite to your own email' : '' }
		if (controlName == 'Email') { msg += (control.errors.ownerEmailInvite) ? 'Company owner cannot be invited as contact' : '' }
		if (controlName == 'Name') { msg += (control.errors.minlength || control.errors.maxlength) ? 'Must be between 3 & 50 length. ' : '' }
		if (controlName == 'Name') { msg += (control.errors.validateName) ? 'Must be a valid name. ' : '' }
		// if (controlName == 'Designation') { msg += (control.errors.minlength || control.errors.maxlength) ? 'Must be between 3 & 50 length. ' : '' }
		// if (controlName == 'Designation') { msg += (control.errors.validateName) ? 'Must be a valid name. ' : '' }
		// if (controlName == 'Department') { msg += (control.errors.minlength || control.errors.maxlength) ? 'Must be between 3 & 50 length. ' : '' }
		// if (controlName == 'Department') { msg += (control.errors.validateName) ? 'Special Characters/Numbers are not allowed. ' : '' }
		if (controlName == 'Mobile') { msg += (control.errors.maxlength) ? 'Must be a 13 length with ISD code. ' : '' }
		if (controlName == 'Mobile') { msg += control.hasError('validateMobile') ? 'Must contain only numbers. ' : '' }

		return msg;
	}

	createForm() {
		this.form = this.formBuilder.group({
			Name: ['', Validators.compose([
				Validators.minLength(3),
				Validators.maxLength(50),
				this.validateName
			])],
			Email: [{ value: '', disabled: this.isEditMode }, Validators.compose([
				Validators.required,
				Validators.email
			])],
			Mobile: ['', Validators.compose([
				Validators.maxLength(13),
				Validators.required,
				this.validateMobile
			])],
			Role: [[], Validators.compose([
			])],
		})
	}

	createForm_old() {
		this.form = this.formBuilder.group({
			Name: ['', Validators.compose([
				Validators.minLength(3),
				Validators.maxLength(100),
				this.validateName
			])],
			Mobile: ['', Validators.compose([
				Validators.maxLength(13),
				Validators.required,
				this.validateMobile
			])],
			Email: [{ value: '', disabled: this.isEditMode }, Validators.compose([
				Validators.required,
				Validators.email
			])],
			Department: ['', Validators.compose([
				Validators.minLength(3),
				Validators.maxLength(100),
				this.validateName
			])],
			Designation: ['', Validators.compose([
				Validators.minLength(3),
				Validators.maxLength(100),
				this.validateName
			])],
			Role: [{ value: []}, Validators.compose([
			])],
		})
	}

	onClose(status: boolean) {
		this.dialogRef.close(status);
	}

	async validateEmail() {
		const email = this.form.get('Email').value.trim();
		this.form.get('Email').setValue(email);
		let param = {
			email: this.form.get('Email').value,
		};
		let result = await this.authService.checkEmail({ param: param });
		if (result.success && result.result == "available") {
			if (this.form.get("Email").value != this.userDetails.email && this.form.get('Email').value != this.data['ownerEmail']) {
				this.invitee_user_id = result.rows[0].user_id;
			} else if(this.form.get('Email').value.trim() == this.data['ownerEmail'].trim()) {
				this.form.get("Email").setErrors({ ownerEmailInvite: true });
			}
			else {
				this.form.get("Email").setErrors({ inviteEmailExists: true });
			}
		} else if (result.success && result.result == "Not available") {
			this.invitee_user_id = undefined;
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async validateEmailError() {
		if(this.form.get("Email").value != this.userDetails.email){
			this.isValid = true;
		}
		else{
			this.isValid = false;
		}
	}

	async getRoles() {
		let param = {
			company_id: this.data['companyId'],
			parent_company_id: this.data['parentCompanyId'],
			invitee_company_id: this.data['parentCompanyId'] == null ? this.data['companyId'] : this.data['parentCompanyId']
		}
		let result = await this.authService.getRoles({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			this.roleList = result.result;
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	validateMobile(controls) {
		if (controls.value == undefined) return null;
		const reqExp = new RegExp("^[+0-9\- ]+$");
		if (reqExp.test(controls.value)) {
			if (controls.value.trim().length == 0) return { 'validateMobile': true };
			return null;
		}
		else {
			return { 'validateMobile': true };
		}
	}

	validateName(controls) {
		if (controls.value == undefined) return null;
		const reqExp = new RegExp("^[a-zA-Z ]+$");
		if (reqExp.test(controls.value)) {
			if (controls.value.trim().length == 0) return { 'validateName': true };
			return null;
		}
		else {
			return { 'validateName': true };
		}
	}

	onChangeRoles(event){
		console.log('event',event)
	}

	setRolesData(status){
		if(this.data['element'].roles != null){
			let rolesIds = [];
			this.data['element'].roles.map((role)=>{
				rolesIds.push(role.role_id);
			});
			this.form.get('Role').setValue(rolesIds);
		} else {
			this.getRoles();
		}
	}

	async addCompanyContact() {
		if (this.form.valid) {
			this.isLoading = true;
			let data, msg, is_update = false;
			if(this.isEditMode){
				if(this.form.get('Name').value != this.data['element'].contact_name || this.form.get('Mobile').value != this.data['element'].mobile){
					is_update =  true;
				}
			}
			const param = {
				name: this.form.get('Name').value,
				mobile: this.form.get('Mobile').value,
				email: this.form.get('Email').value.trim().toLowerCase(),
				role_ids: this.form.get('Role').value,
				company_id: this.data['companyId'],
				contact_invite_id: this.data['element'] == undefined ? null : this.data['element'].contact_invite_id,
				invitee_user_id: this.data['element'] == undefined ? this.invitee_user_id : this.data['element'].invitee_user_id,
				rum_id: this.data['element'] == undefined ? '' : this.data['element'].rum_id,
				is_update: is_update,
				is_admin: this.isEditMode && this.data['element'].status == 'admin' ? true : false
			};
			if(this.btnTitle == 'Invite'){
				let res = await this.authService.checkForSelfInvite({email:param.email});
				res.rows.map(e => {
					if(e.company_id == this.data['companyId']){
			      this.reusable.openAlertMsg("CAN'T SELF INVITE", "error");;
						return;
					}
				})
			}
			let result = await this.authService.insUpsCompanyContact({ param : this.reusable.encrypt(JSON.stringify(param))});
			if(result.success){
				setTimeout(() => {
					this.dialog.open(ConfirmDialog, {
						data: {
							type: 'info-success',
							content: result.message,
						}
					});
				}, 1000);
				this.onClose(result.success)
			} else {
				this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
			}
		} else {
			this.reusable.openAlertMsg("Form is not valid, please check for errors", "info");
		}
	}

	async addCompanyContact_old() {
		if (this.form.valid) {
			this.isLoading = true;
			let data, msg;
			const param = {
				name: this.form.get('Name').value,
				mobile: this.form.get('Mobile').value,
				email: this.form.get('Email').value,
				department: this.form.get('Department').value,
				designation: this.form.get('Designation').value,
				role_id: this.form.get('Role').value,
				company_id: this.data['companyId'],
				contact_invite_id: this.data['element'] == undefined ? null : this.data['element'].contact_invite_id,
				invitee_user_id: this.invitee_user_id
			};
			if (this.data['element'] == undefined) {
				data = await this.authService.addCompanyContact({ param: this.reusable.encrypt(JSON.stringify(param)) });
				msg = "Contact Added."
			} else {
				data = await this.authService.updCompanyContact({ param: this.reusable.encrypt(JSON.stringify(param)) });
				msg = "Contact Updated."
			}
			this.isLoading = false;
			if (data.success) {
				setTimeout(() => {
					this.dialog.open(ConfirmDialog, {
						data: {
							type: 'info-success',
							content: msg,
						}
					});
				}, 1000);
				this.onClose(data.success)
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
}

@Component({
	selector: 'invite-company-dialog',
	templateUrl: './add-invite-compnay-dialog.component.html',
	styleUrls: ['./company.component.css'],
})

export class InviteCompanyAddDialogComponent implements OnInit {
	isLoading: boolean;
	ht: number;
	width: number;
	form: FormGroup;
	userDetails;
	inviteCompanyVal: any;
	parentCompanyVal: any;
	companyTypeList: any;
	modulesVal: any;
	modulesList: any;
	title: String;
	btnTitle: String;
	emailExists: boolean; 
	invitee_user_id: any;
	invitee_company_id: any;
	userCompanyList: any;
	inviteCompanyTypeList: any;
	isEditMode: boolean = false;

	constructor(
		private reusable: ReusableComponent,
		private formBuilder: FormBuilder,
		private authService: AuthenticationService,
		public dialogRef: MatDialogRef<InviteCompanyAddDialogComponent>,
		private router: Router,
		@Inject(MAT_DIALOG_DATA) public data: InviteCompanyAddDialogComponent,
		public dialog: MatDialog,
	) { }

	ngOnInit() {
		this.reusable.screenChange.subscribe(res => {
			this.ht = res['height'] - 64;
			this.width = res["width"] - 64;
		});
		this.isLoading = true;
		if (this.data['element'] == undefined) {
			this.isEditMode = false;
			this.isLoading = false;
			this.btnTitle = 'INVITE';
			this.title = "INVITE STAKEHOLDERS COMPANY";
			this.parentCompanyVal = this.data['parentCompany'].company_type_id;
			console.log('companyTypeList',this.companyTypeList)
			this.createForm();
		} else {
			this.isEditMode = true;
			this.userCompanyList = [];
			this.createForm();
			this.btnTitle = 'Update';
			this.title = "UPDATE INVITE STAKEHOLDERS COMPANY";
			this.parentCompanyVal = this.data['element'].invited_company_type_id;
			this.form.controls.Name.setValue(this.data['element'].invitee_contact_name);
			this.form.controls.CompanyName.setValue(this.data['element'].invitee_company_name);
			this.form.controls.Email.setValue(this.data['element'].invitee_email);
			this.form.controls.InviteCompanyType.setValue(this.data['element'].invitee_company_type_id);
			if(this.data['m_d_ids']!= null) this.form.controls.LicenseModules.setValue(this.data['m_d_ids'].module_id);
			
		}
		this.userDetails = ReusableComponent.usr;
		this.getLicensedModulesList();
		this.getCompanyTypeList();
		this.isLoading = false;
	}

	createForm() {

		this.form = this.formBuilder.group({
			Name: [{ value: '', disabled: this.isEditMode }, Validators.compose([
				Validators.minLength(3),
				Validators.maxLength(50),
				this.validateName
			])],
			Email: [{ value: '', disabled: this.isEditMode }, Validators.compose([
				Validators.email,
				Validators.required,
			])],
			CompanyName: [{ value: '', disabled: this.isEditMode }, Validators.compose([
				Validators.minLength(3),
				Validators.maxLength(50),
			])],
			ParentCompanyType: [this.parentCompanyVal, Validators.compose([
				Validators.required,
			])],
			InviteCompanyType: [this.inviteCompanyVal ? this.inviteCompanyVal : '', Validators.compose([
				Validators.required,
			])],
			LicenseModules: [this.modulesVal ? this.modulesVal : '', Validators.compose([
				Validators.required,
			])],
		})
	}
	//not used after 18-10-2021
	// createForm_old() {
	// 	this.form = this.formBuilder.group({
	// 		Name: ['', Validators.compose([
	// 			Validators.minLength(3),
	// 			Validators.maxLength(100),
	// 			this.validateName
	// 		])],
	// 		CompanyName: ['', Validators.compose([
	// 			Validators.minLength(3),
	// 			Validators.maxLength(100),
	// 		])],
	// 		Email: [{ value: '', disabled: this.isEditMode }, Validators.compose([
	// 			Validators.email,
	// 			Validators.minLength(10),
	// 			Validators.required,
	// 		])],
	// ParentCompanyType: [this.parentCompanyVal, Validators.compose([
	// 	Validators.required,
	// ])],
	// 		InviteCompanyType: [this.inviteCompanyVal ? this.inviteCompanyVal : '' , Validators.compose([
	// 			Validators.required,
	// 		])],
	// 		LicenseModules: [this.modulesVal ? this.modulesVal : '' , Validators.compose([
	// 			Validators.required,
	// 		])],
	// 	})
	// }

	getErrorMessage(control, controlName) {
		let msg = '';
		msg += control.hasError('required') ? 'Field Cannot be empty. ' : '';
		if (controlName == 'Email') { msg += control.hasError('email') ? 'Enter a valid email ' : '' }
		if (controlName == 'Email') { msg += (control.errors.inviteEmailExists) ? 'You cannot self invite to your own email' : '' }
		if (controlName == 'Name') { msg += (control.errors.minlength || control.errors.maxlength) ? 'Must be between 3 & 50 length. ' : '' }
		//if (controlName == 'Name') { msg += (control.errors.validateName) ? 'Must be a valid name ' : '' }
		if (controlName == 'CompanyName') { msg += (control.errors.minlength || control.errors.maxlength) ? 'Must be between 3 & 50 length. ' : '' }
		if (controlName == 'CompanyName') { msg += (control.errors.validateDuplicateInvite) ? 'Invite already Exists' : '' }
		if (controlName == 'CompanyName') { msg += (control.errors.validateSelfInviteCompany) ? 'Cannot self invite your own company' : '' }
		if (controlName == 'CompanyName') { msg += (control.errors.CompanyNameEmpty) ? 'Company Name is Invalid' : '' }
		if (controlName == 'CompanyName') { msg += (control.errors.InvalidInviteForOC) ? 'Can Invite only Head Quarters' : '' }
		return msg;
	}

	async getCompanyTypeList() {
		let result = await this.authService.getCompanyTypeList();
		if (result.success) {
			this.companyTypeList = result.result;
			if(this.isEditMode) {
				this.form.get('ParentCompanyType').setValue(this.data['element'].invited_company_type_id);
				this.form.get('ParentCompanyType').disable();
			}
			this.inviteCompanyTypeList = result.result.filter(x => x.lookup_id != this.data['parentCompany'].company_type_id);
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async getLicensedModulesList() {
		let param = {
			company_id: this.data['parentCompany'].company_id
		};
		let result = await this.authService.getInviteCompanyLicensedModulesList({ param: JSON.stringify(param) });
		if (result.success) {
			this.modulesList = result.result;
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	checkEmptyCompanyName() {
		if (this.form.get('CompanyName').value.trim() == '') {
			this.form.get('CompanyName').setErrors({ CompanyNameEmpty: true })
		}
	}

	async validateCompany() {
		if (this.form.get('CompanyName').value.trim() == '') {
			this.form.get('CompanyName').setErrors({ CompanyNameEmpty: true })
		} else {
			this.form.get('Email').reset();
			this.form.get('Name').reset();
			this.form.get('InviteCompanyType').reset();
			let param = {
				company_name: this.form.get('CompanyName').value.toLowerCase().trim(),
				cmp_name_without_specal_char: this.form.get('CompanyName').value.trim().toLowerCase().replace(/\W/g, '')
			};
			let result = await this.authService.getCompanyData(param);
			if (result.success && result.rowCount > 0) {
				if (result.rows[0].email == this.userDetails.email) {
					this.form.get("CompanyName").setErrors({ validateSelfInviteCompany: true });
				} else {
					if (result.rowCount > 0) {
						result.rows.map((company)=>{
							if(company.office_category == 'head quarters'){
								this.form.get('CompanyName').setErrors(null);
								this.invitee_company_id = company.company_id;
								this.form.get('Email').setValue(company.email);
								this.form.get('Name').setValue(company.full_name);
								this.form.get('Email').disable();
								this.form.get('Name').disable();
								this.form.get('InviteCompanyType').setValue(company.company_type_id);
							} else {
								this.form.get('CompanyName').setErrors({InvalidInviteForOC :  true});
								this.form.get('Email').disable();
								this.form.get('Name').disable();
							}
						})
						// if (result.rows[0].company_type_id != this.parentCompanyVal) {
						// 	this.inviteCompanyVal = result.rows[0].company_type_id;
						// 	this.form.get('InviteCompanyType').setValue(this.inviteCompanyVal);
						// }

					} else {
						this.form.get('Email').enable();
						this.form.get('Name').enable();
					}
				}
			} else {
				this.form.get('Email').enable();
				this.form.get('Name').enable();
			}
		}
	}

	// async validateCompany_old() {
	// 	this.form.get('Email').setValue('');
	// 	this.form.get("Email").enable();
	// 	this.form.get('Name').setValue('');
	// 	this.form.get("Name").enable();
	// 	let param = {
	// 		company_name: this.form.get('CompanyName').value.toLowerCase().trim(),
	// 		cmp_name_without_specal_char: this.form.get('CompanyName').value.trim().toLowerCase().replace(/\W/g,'')	
	// 	};
	// 	let result = await this.authService.getCompanyData(param);
	// 	if(result.success){
	// 		if(result.rows[0].email == this.userDetails.email){
	// 			this.form.get("CompanyName").setErrors({ validateSelfInviteCompany: true });
	// 		} else {
	// 			if(result.rowCount > 0){
	// 				this.invitee_company_id = result.rows[0].company_id;
	// 				this.form.get('Email').setValue(result.rows[0].email);
	// 				this.form.get("Email").disable();
	// 				this.form.get('Name').setValue(result.rows[0].full_name);
	// 				this.form.get("Name").disable();
	// 			}
	// 		}
	// 	} else {
	// 		this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
	// 	}
	// }

	async validateEmail() {
		const email = this.form.get('Email').value;
		this.form.get('Email').setValue(email);
		this.form.get('Name').setValue('');
		this.form.get("Name").enable();
		let param = {
			email: this.form.get('Email').value,
		};
		let result = await this.authService.checkEmail({ param: param });
		if (result.success && result.result == "available") {
			this.emailExists = true;
			this.invitee_user_id = result.rows[0].user_id;
			if (this.form.get("Email").value != this.userDetails.email) {
				this.form.get('Name').setValue(result.rows[0].full_name);
				this.form.get("Name").disable();
				this.invitee_user_id = result.rows[0].user_id;
			} else {
				this.form.get("Email").setErrors({ inviteEmailExists: true });
			}
			//this.checkInviteeCompanyName();
		} else if (result.success && result.result == "Not available") {
			this.emailExists = false;
			this.invitee_user_id = undefined;
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}



	// async checkInviteeCompanyName() {
	// 		this.isLoading = true;
	// 	    let param = {
	// 			created_by: this.invitee_user_id,
	// 		};
	// 		let result = await this.authService.validateInviteeCompanyName({ param: JSON.stringify(param) });
	// 		if (result.success && result.rowCount > 0) {
	// 			const userComp = result.rows;
	// 			userComp.map((x)=>{
	// 				const comp_name = this.form.get('CompanyName').value.toLowerCase().trim();
	// 				if(x.office_category_id == 26 && x.company_name.trim().toLowerCase() == comp_name){
	// 					this.userCompanyList=x;
	// 				}
	// 			})
	// 			this.invitee_company_id = this.userCompanyList.company_id;
	// 			this.isLoading = false;
	// 			console.log('id',this.invitee_company_id)
	// 		} else if(result.success && result.rowCount == 0){
	// 			this.userCompanyList = [];
	// 		}
	// 		else {
	// 			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
	// 		};
	// }

	// 	async getInviteeCompanyName(user_id) {
	// 		let param = {
	// 			created_by: user_id,
	// 		};
	// 		let result = await this.authService.validateInviteeCompanyName({ param: JSON.stringify(param) });
	// 		if (result.success && result.rowCount > 0) {
	// 			this.userCompanyList = result.rows;
	// 			let inviteeCompany = this.userCompanyList.find(x=> x.company_name = this.data['element'].invitee_company_name);
	// 			this.form.controls.CompanyName.setValue({ company_name: inviteeCompany.company_name});

	// 		} 
	// 		else {
	// 			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
	// 		};
	// }

	displayFn(ele): any {
		if (ele != null) {
			return ele.company_name;
		}
	}

	onInviteCompanyTypeChange(type) {
		this.inviteCompanyVal = type;
	}

	onParentCompanyTypeChange(type) {
		this.parentCompanyVal = type;
		this.inviteCompanyTypeList = this.companyTypeList.filter(x => x.lookup_id != type);
	}

	onLicenseModuleChange(type) {
		this.modulesVal = type;
	}

	validateName(controls) {
		if (controls.value == undefined) return null;
		const reqExp = new RegExp("^[a-zA-Z0-9 ]+$");
		if (reqExp.test(controls.value)) {
			if (controls.value.trim().length == 0) return { 'validateName': true };
			return null;
		}
		else {
			return { 'validateName': true };
		}
	}

	onClose(status: boolean) {
		this.dialogRef.close(status);
		const ispage = sessionStorage.getItem('redirectcompany');
		if (ispage) {
			this.router.navigate(['/nav/company']);
			sessionStorage.removeItem('redirectcompany');
		}

	}

	async checkPrevCompInvit() {
		let param = {
			invited_company_id: this.data['parentCompany'].company_id,
			invitee_company_name: this.form.get('CompanyName').value
		}
		let result = await this.authService.checkPrevCompInvit(param);
		if (result.success) {
			if (result.rowCount > 0) {
				this.form.get("CompanyName").setErrors({ validateDuplicateInvite: true });
			}
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}
	
	async inviteCompnay() {
		this.isLoading = true;
		this.isLoading = false;
		let canRun = true;
		if (this.form.valid) {
			this.isLoading = true;
			let data, msg;
			const param = {
				invitee_contact_name: this.form.get('Name').value,
				invitee_company_name: this.form.get('CompanyName').value.trim(),
				invitee_email: this.form.get('Email').value.trim().toLowerCase(),
				invited_company_id: this.data['parentCompany'].company_id,
				invited_company_type_id: this.form.get('ParentCompanyType').value,
				invitee_company_type_id: this.form.get('InviteCompanyType').value,
				shared_modules: this.form.get('LicenseModules').value,
				invitee_user_id: this.invitee_user_id,
				company_invite_id: this.data['element'] == undefined ? null : this.data['element'].company_invite_id,
				invitee_company_id: this.invitee_company_id != null || this.invitee_company_id != undefined ? this.invitee_company_id : null,
			};
			if (this.data['element'] == undefined) {
				let res = await this.authService.checkForSelfInvite({email:param.invitee_email});
				res.rows.map(e => {
					if(e.company_id == param.invited_company_id){
			      	this.reusable.openAlertMsg("CAN'T SELF INVITE", "error");;
						canRun=false;
					}
				})
				if(!canRun) {
					this.onClose(true)
					return;
				}
				data = await this.authService.inviteCompnay(param);
				if (data.success) {
					setTimeout(() => {
						this.dialog.open(ConfirmDialog, {
							data: {
								type: 'info-success',
								content: "Invite Sent Successfully!",
							}
						});
					}, 1000);
				}
			} else {
				data = await this.authService.updinviteCompany(param);
				if (data.success) {
					setTimeout(() => {
						this.dialog.open(ConfirmDialog, {
							data: {
								type: 'info-success',
								content: "Invite Updated Successfully!",
							}
						});
					}, 1000);

				}
			}
			this.isLoading = false;
			if (data.success) {
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
}

@Component({
	selector: 'company-addedit-upload-logo',
	templateUrl: './company-addedit-upload-logo.html',
	styleUrls: ['./company.component.css'],
})

export class CompanyAddEditUploadLogoComponent implements OnInit {
	isLoading: boolean = false;
	ht: number;
	width: number;
	form: FormGroup;
	previewUrl; fileName; fileData; sizeError = false; isImg1 = false; isImgDeleted = false;
	uploadPlaceholder: string = environment.upload_placeholder;
	noimagePlaceholder: string = environment.noimage_placeholder;
	oldImage1path;

	constructor(
		private reusable: ReusableComponent,
		private authService: AuthenticationService,
		public dialogRef: MatDialogRef<CompanyAddEditUploadLogoComponent>,
		@Inject(MAT_DIALOG_DATA) public data: CompanyAddEditUploadLogoComponent,
	) { }

	ngOnInit() {
		this.reusable.screenChange.subscribe(res => {
			this.ht = res['height'] - 64;
			this.width = res["width"] - 64;
		});
	}

	onNoClick(): void {
		this.dialogRef.close();
	}

}