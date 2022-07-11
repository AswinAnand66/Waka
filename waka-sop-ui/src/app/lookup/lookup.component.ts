import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../_services/index';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ReusableComponent } from '../reusable/reusable.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ClassRole {
  lookup_name_id: number,
  lookup_type_id: number,
  lookup_name: string,
  display_name: string,
  description: string,
  lookup_type: string,
  company_name: string,
  company_id: number
}

@Component({
  selector: 'app-lookup',
  templateUrl: './lookup.component.html',
  styleUrls: ['./lookup.component.css']
})
export class LookupComponent implements OnInit {

  isLoading: boolean = false;
  isDataLoading: boolean = false;
  screenParam: any;
  isMobile: boolean = false;
  ht: number;
  width: number;
  lookupForm: FormGroup;
  selTypeId: number;
  lookupTypeColl = [];
  lookupColl = new MatTableDataSource([]);
  companyList = [];
  dispLookup = ["display_name", "company_name", "edit", "delete"];
  pageStartTime: Date;
	pageCurrentUrl: string;
  isAddLookup:boolean = false;
  userDetails: any;
  
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor(
    private reusable: ReusableComponent,
    private formBuilder: FormBuilder, 
    private authService: AuthenticationService,
    private router: Router,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.pageStartTime = new Date();
		this.pageCurrentUrl = this.router.url;
    this.reusable.screenChange.subscribe(res => {
      this.screenParam = { width: res.width, height: res.height - 60 };
      this.ht = res['height'] - 64;
      this.width = res["width"] - 64;
      if (this.screenParam.width < 600) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });
    this.createForm();
    this.getLookupTypeList();
    this.reusable.headHt.next(60);
    this.reusable.titleHeader.next("Lookup");
		this.userDetails = ReusableComponent.usr;
    console.log('userDetails.is_admin', this.userDetails.is_admin)
  }


  createForm() {
    this.lookupForm = this.formBuilder.group({
      LookupType: ['', Validators.compose([
        Validators.required,
      ])],
      Company: [ {value : '', disabled: false }, Validators.compose([
        Validators.required,
      ])],
      AddLookupType: ['', Validators.compose([
        Validators.required,
      ])],
      LookupName: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(50), Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)
      ])],
      DisplayName: ['', Validators.compose([
        Validators.required,
        Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)
      ])],
  })
  }

  ngOnDestroy() {
		this.authService.savePageAccess(this.pageStartTime, new Date(), this.pageCurrentUrl, 'LookUp');
	}

  goBack() {
    this.router.navigate(['/nav/home']);
  }

  addlookup() {
    const dialogRef = this.dialog.open(AddEditLookupComponent, {
      width: '920px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getLookupTypeList();
      }
    });
  }

  editlookup(ele) {
    const dialogRef = this.dialog.open(AddEditLookupComponent, {
      width: '920px', data: ele
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        //this.getLookup(ele.lookup_type_id);
      }
    });
  }

  async getAdminLookup() {
    let result = await this.authService.getAdminLookups();
    if (result.success) {
      this.lookupColl = new MatTableDataSource(result.result);
      this.lookupColl.sort = this.sort;
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  async getLookupTypeList() {
    this.isLoading = true;
    let result = await this.authService.getLookupTypeList();
    if (result.success) {
      this.lookupTypeColl = result.result;
      this.isLoading = false;
      this.lookupForm.get('LookupType').setValue(this.lookupTypeColl[0]);
      this.getLookupNames(this.lookupForm.get('LookupType').value);
      this.getCompanyList();
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  async getLookupNames(ele) {
    this.isDataLoading = true;
    const param = {
      lookup_type_id: ele.lookup_type_id,
      is_admin: this.userDetails.is_admin
    };
    let result = await this.authService.getLookup({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if (result.success) {
      console.log('res ->', result.result)
      this.lookupColl = new MatTableDataSource(result.result);
      this.isDataLoading = false;
      this.lookupColl.sort = this.sort;
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  async getCompanyList() {
    let result = await this.authService.getCompanyList();
    if (result.success) {
      this.companyList = result.result;
      console.log('companyList',this.companyList)
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  validComp(ele){
    if(ele.is_approved == true &&  new Date(ele.valid_to) >= new Date() ){//&& ele.valid_to <=
      return false;
    } else {
      return true;
    }
  }

  async openLookupName(lookup, idx) {
    if(!lookup.is_admin_lookup) {
      this.lookupColl.data.map((look, id) =>{
        idx != id ? look["is_edit"] = false : '';
        idx != id ? look["is_selected"] = false : '';
      });
      lookup.is_edit ? lookup.is_edit = false : lookup.is_edit = true;
      lookup.is_edit ? lookup.is_selected = true : lookup.is_selected = false;
      let doc = document.getElementById('lookupCard');
      lookup["prev_card_height"] = doc.clientHeight;
      lookup.is_edit ? lookup["card_height"] = doc.clientHeight + 150 + 'px' : lookup["prev_card_height"];
      this.lookupForm.get('Company').setValue(lookup.company_id);
      this.lookupForm.get('Company').disable();
      this.lookupForm.get('AddLookupType').setValue(lookup.lookup_type_id);
      this.lookupForm.get('AddLookupType').disable();
      this.lookupForm.get('LookupName').setValue(lookup.lookup_name);
      this.lookupForm.get('DisplayName').setValue(lookup.display_name);
    }
  }

  closeLookupName(lookup, idx){
    lookup.is_edit = false;
    lookup.is_selected = false;
    lookup["card_height"] = "auto";
    lookup["prev_card_height"] = undefined;
  }

  async saveLookupName(lookup) {
    let param = {
      lookup_name_id : lookup.lookup_name_id,
      lookup_name: this.lookupForm.get('LookupName').value,
      lookup_disp_name: this.lookupForm.get('DisplayName').value,
      lookup_desc: '',
    }
    let updLookup = await this.authService.updateLookupEntry(param);
    if(updLookup.success && updLookup.rowCount > 0) {
      lookup.is_edit = false;
      this.reusable.openAlertMsg(`${this.lookupForm.get('LookupType').value.display_name} Updated`, "info");
      //this.getLookupNames(this.lookupForm.get('LookupType').value)
      lookup.lookup_name = param.lookup_name
      lookup.display_name = param.lookup_disp_name
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(updLookup) , "info");
    }
  }

  async addLookupName() {
    let checkExists = this.lookupColl.data.filter(look => look.lookup_name.toLowerCase() == this.lookupForm.get('LookupName').value.toLowerCase() && look.company_id ==  this.lookupForm.get('Company').value);
    console.log('checkExists',checkExists)
    if(checkExists.length > 0) {
      this.reusable.openAlertMsg('Already Exists', "error");
      return
    }
    let param = {
      lookup_type_id: this.lookupForm.get('LookupType').value.lookup_type_id,
      company_id: this.lookupForm.get('Company').value,
      lookup_name: this.lookupForm.get('LookupName').value,
      lookup_disp_name: this.lookupForm.get('DisplayName').value,
      lookup_desc: '',
    }
    let addLookup = await this.authService.addLookupEntry(param);
    if(addLookup.success && addLookup.rowCount > 0) {
      this.reusable.openAlertMsg(`${this.lookupForm.get('LookupType').value.display_name} created`, "info");
      this.closeAddLookup();      
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(addLookup) , "info");
    }
  }
  
  openAddLookup() {
    this.getCompanyList();
    this.isAddLookup = true;
    this.lookupForm.get('Company').reset();
    this.lookupForm.get('Company').enable();
    this.lookupForm.get('AddLookupType').reset();
    this.lookupForm.get('AddLookupType').enable();
    this.lookupForm.get('DisplayName').reset();
    this.lookupForm.get('DisplayName').enable();
    this.lookupForm.get('LookupName').reset();
    this.lookupForm.get('LookupName').enable();
    this.lookupForm.get('Company').setValue(this.companyList[0].company_id);
    this.lookupForm.get('AddLookupType').setValue(this.lookupForm.get('LookupType').value);
  }

  closeAddLookup() {
    this.isAddLookup = false;
    this.getLookupNames(this.lookupForm.get('LookupType').value);
  }

  getErrorMessage(control, controlName) {
		let msg = '';
		if (controlName == 'LookupName') { msg += control.hasError('required') ? 'Lookup name is Mandatory' : '' }
    if (controlName == 'DisplayName') { msg += control.hasError('required') ? 'Display name is Mandatory' : '' }
		return msg;
	}
  
  // onLookupTypeChange(typeId) {
  //   this.selTypeId = typeId;
  //   this.getLookup(typeId);
  // }

  // async getLookup(typeid?: number) {
  //   const param = {
  //     lookup_type_id: typeid,
  //   };
  //   let result = await this.authService.getLookup(param);
  //   if (result.success) {
  //     this.lookupColl = new MatTableDataSource(result.result);
  //     this.lookupColl.sort = this.sort;
  //     console.log('lookupColl',this.lookupColl)
  //   } else {
  //     this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
  //   }
  // }

  applyLookupFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.lookupColl.filter = filterValue.trim().toLowerCase();
  }

  async delLookupName(ele) {
    let conf = confirm("Are you sure you like to delete this Lookup?");
    if (!conf) return;
    let param = {
      lookup_id: ele.lookup_name_id
    }
    let result = await this.authService.delLookup(param);
    if (result.success) {
      this.reusable.openAlertMsg("Successfully Deleted", "info");
      this.getLookupNames(this.lookupForm.get('LookupType').value);
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }
}

@Component({
  selector: 'app-add-edit-lookup',
  templateUrl: './add-edit-lookup.component.html',
  styleUrls: ['./lookup.component.css'],
})
export class AddEditLookupComponent implements OnInit {

  isLoading: boolean;
  form: FormGroup;
  lookupTypesList = []; lookUpId: number = null;
  companyList = [];
  lookUpTypeSelValId: number;
  btnTitle: string;
  isSaving = false;

  constructor(
    public dialogRef: MatDialogRef<AddEditLookupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClassRole,
    private reusable: ReusableComponent,
    private authSerice: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router,
  ) { }

  ngOnInit() {
    this.lookUpId = this.data == undefined ? null : this.data.lookup_name_id;
    this.getLookupTypeList();
    this.getCompanyList();
    if (this.lookUpId == null) {
      this.btnTitle = 'Save';
      this.createForm();
    } else {
      this.createForm();
      this.btnTitle = 'Update';
      this.form.controls.Company.setValue(this.data.company_id);
      this.form.controls.LookUpType.disable();
      this.form.controls.LookUpType.setValue(this.data.lookup_type_id);
      this.form.controls.LookUpName.setValue(this.data.lookup_name);
      this.form.controls.LookUpDispName.setValue(this.data.display_name);
      this.form.controls.LookUpDesc.setValue(this.data.description);
    }
  }

  createForm() {
    this.form = this.formBuilder.group({
      Company: [{ value: '', disabled: false }, Validators.compose([])],
      LookUpType: [{ value: '', disabled: false }, Validators.compose([])],
      LookUpName: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)])],
      LookUpDispName: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)])],
      LookUpDesc: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)])],
    })
  }

  getErrorMessage(control, controlName) {
    let msg = '';
    msg += control.hasError('required') ? controlName + ' must have value. ' : '';
    if (controlName == 'Lookup Name') { msg += (control.errors.minlength || control.errors.maxlength) ? 'Must be between 3 & 50 char length. ' : '' }
    if (controlName == 'Lookup Name') { msg += (control.errors.validateName) ? 'Special Characters/Numbers are not allowed. ' : '' }
    if (controlName == 'Display Name') { msg += (control.errors.minlength || control.errors.maxlength) ? 'Must be between 3 & 50 char length. ' : '' }
    if (controlName == 'Display Name') { msg += (control.errors.validateName) ? 'Special Characters/Numbers are not allowed. ' : '' }
    if (controlName == 'LookUpDesc') { msg += (control.errors.minlength || control.errors.maxlength) ? 'Must be between 3 & 50 char length. ' : '' }
    if (controlName == 'LookUpDesc') { msg += (control.errors.validateName) ? 'Special Characters/Numbers are not allowed. ' : '' }
    if (controlName == 'form') { msg += control.hasError('matchingPasswords') ? 'Password, confirm password must be same' : '' }
    return msg;
  }

  async getLookupTypeList() {
    let result = await this.authSerice.getLookupTypeList();
    if (result.success) {
      this.lookupTypesList = result.result;
    } else {
      this.reusable.openAlertMsg(this.authSerice.invalidSession(result), "error");
    }
  }

  async getCompanyList() {
    let result = await this.authSerice.getCompanyList();
    if (result.success) {
      this.companyList = result.result;
      if(result.rowCount == 1){
        this.form.controls.Company.setValue(result.result[0].company_id);
      }
    } else {
      this.reusable.openAlertMsg(this.authSerice.invalidSession(result), "error");
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
        company_id: this.form.get('Company').value,
        lookup_id: this.lookUpId,
        lookup_type_id: this.lookUpTypeSelValId,
        lookup_name: this.form.get('LookUpName').value,
        lookup_disp_name: this.form.get('LookUpDispName').value,
        lookup_desc: this.form.get('LookUpDesc').value,
      };
      if (this.lookUpId == null) {
        data = await this.authSerice.addLookupEntry(param);
        msg = "Lookup Saved"
      } else {
        data = await this.authSerice.updateLookupEntry(param);
        msg = "Lookup Updated"
      }
      this.isLoading = false;
      if (data.success) {
        this.reusable.openAlertMsg(msg, "info");
        this.onClose(data.success);
      } else {
        this.reusable.openAlertMsg(this.authSerice.invalidSession(data), "error");
        if (data.invalidToken != undefined && data.invalidToken) {
          this.onClose(data.success);
        }
      }
    } else {
      this.reusable.openAlertMsg("Form is not valid, please check for errors", "info");
    }
  }

  onClose(status) {
    this.dialogRef.close(status);
  }
}