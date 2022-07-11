import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../_services/index';
import { ReusableComponent, ConfirmDialog } from '../reusable/reusable.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit {

  userDetails: any;
  height: number;
  width: number;
  isMobile: boolean = false;
  isLoading: boolean = false;
  serviceTypeList = [];
  selTypeId: number;
  serviceTypeColl = new MatTableDataSource([]);
  dispLookup = ["service_name"];
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor(
    private reusable: ReusableComponent,
    private authService: AuthenticationService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.reusable.headHt.next(60);
    this.reusable.titleHeader.next("Services");
    this.reusable.curRoute.next('admin');
    this.reusable.screenChange.subscribe(screen => {
      if (screen.height < 600) {
        this.height = screen.height
      } else {
        this.height = screen.height;
      }
      this.width = screen.width - 140;
    });
    this.userDetails = ReusableComponent.usr;
    this.getServiceTypeList();
  }

  async getServiceTypeList() {
    let result = await this.authService.getServiceTypeList();
    if (result.success) {
      this.serviceTypeList = result.result;
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  onServiceTypeChange(type:any) {
    this.selTypeId = type.lookup_name_id;
    this.getserviceTypeColl(type.lookup_name_id);
  }

  async getserviceTypeColl(typeid?: number) {
    const param = {
      lookup_name_id: typeid
    };
    let result = await this.authService.getserviceTypeColl(param);
    if (result.success) {
      this.serviceTypeColl = new MatTableDataSource(result.result);
      this.serviceTypeColl.sort = this.sort;
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  addlookup() {
    const dialogRef = this.dialog.open(AddEditServicesComponent, {
      width: '920px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if(this.selTypeId == result.lookupNameId){
          this.getserviceTypeColl(this.selTypeId);
        }
      }
    });
  }

  editlookup(ele) {
    const dialogRef = this.dialog.open(AddEditServicesComponent, {
      width: '920px', data: ele
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getserviceTypeColl(ele.service_type_id);
      }
    });
  }

  async deleteLookup(ele) {
    let conf = confirm("Are you sure you like to delete this Service?");
    if (!conf) return;
    let param = {
      service_id: ele.service_id
    }
    let result = await this.authService.delServiceEntry(param);
    if (result.success) {
      this.reusable.openAlertMsg("Successfully Deleted", "info");
      this.getserviceTypeColl(ele.service_type_id);
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }
}

export interface ClassRole {
  service_id: number,
  lookup_type_id: number,
  service_name: string,
  display_name: string,
  description: string,
  lookup_type: string,
  company_name: string,
  company_id: number,
  service_type_id: number
}

@Component({
  selector: 'app-add-edit-services',
  templateUrl: './add-edit-service.component.html',
  styleUrls: ['./services.component.css']
})
export class AddEditServicesComponent implements OnInit {

  isLoading: boolean;
  form: FormGroup;
  serviceTypeList = []; 
  serviceId: number = null;
  companyList = [];
  lookUpTypeSelValId: number;
  btnTitle: string;
  isSaving = false;

  constructor(
    public dialogRef: MatDialogRef<AddEditServicesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClassRole,
    private reusable: ReusableComponent,
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router,
  ) { }

  ngOnInit() {
    this.serviceId = this.data == undefined ? null : this.data.service_id;
    this.getServiceTypeList();
    this.getCompanyList();
    if (this.serviceId == null) {
      this.btnTitle = 'Save';
      this.createForm();
    } else {
      this.createForm();
      this.btnTitle = 'Update';
      this.form.controls.SeriviceType.disable();
      this.form.controls.SeriviceType.setValue(this.data.service_type_id);
      this.form.controls.ServiceName.setValue(this.data.service_name);
    }
  }

  createForm() {
    this.form = this.formBuilder.group({
      SeriviceType: [{ value: '', disabled: false }, Validators.compose([])],
      ServiceName: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)])]
    })
  }

  getErrorMessage(control, controlName) {
    let msg = '';
    msg += control.hasError('required') ? controlName + ' must have value. ' : '';
    if (controlName == 'Service Name') { msg += (control.errors.minlength || control.errors.maxlength) ? 'Must be between 3 & 50 char length. ' : '' }
    if (controlName == 'Service Name') { msg += (control.errors.validateName) ? 'Special Characters/Numbers are not allowed. ' : '' }
    if (controlName == 'form') { msg += control.hasError('matchingPasswords') ? 'Password, confirm password must be same' : '' }
    return msg;
  }

  async getServiceTypeList() {
    let result = await this.authService.getServiceTypeList();
    if (result.success) {
      this.serviceTypeList = result.result;
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  async getCompanyList() {
    let result = await this.authService.getCompanyList();
    if (result.success) {
      this.companyList = result.result;
      if(result.rowCount == 1){
        this.form.controls.Company.setValue(result.result[0].company_id);
      }
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  onLookUpTypeChange(val) {
    this.lookUpTypeSelValId = val;
  }

  async saveLookup() {
    if (this.form.valid) {
      this.isLoading = true;
      let data: any, msg: string;
      const param = {
        service_id: this.serviceId,
        service_type_id: this.lookUpTypeSelValId,
        service_name: this.form.get('ServiceName').value
      };
      if (this.serviceId == null) {
        data = await this.authService.addServiceEntry(param);
        msg = "Service Saved"
      } else {
        data = await this.authService.updateServiceEntry(param);
        msg = "Service Updated"
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

  onClose(status) {
    this.dialogRef.close({status, lookupNameId : this.lookUpTypeSelValId});
  }
}