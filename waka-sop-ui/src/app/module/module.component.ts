import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../_services/index';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ReusableComponent } from '../reusable/reusable.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog , MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface ModuleData {
  module_name:string,
  module_id:number,
  sub_module_id:number,
  sub_module_name:string
}

@Component({
  selector: 'app-module',
  templateUrl: './module.component.html',
  styleUrls: ['./module.component.css']
})
export class ModuleComponent implements OnInit {

  isLoading = false;
  screenParam: any;
  isMobile:boolean = false;
  ht:number; 
  width:number;
  moduleColl = new MatTableDataSource([]);
  subModuleColl : any;
  dispModule= ["module_name","subModule", "edit"];

  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor(
    private reusable: ReusableComponent,
    private authService: AuthenticationService,
    private router: Router,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
     this.reusable.screenChange.subscribe(res => {
      this.screenParam = {width : res.width, height:res.height-60};
      this.ht = res['height'] - 64;
      this.width = res["width"] - 64;
      if (this.screenParam.width < 600) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
  });
      this.getAdminModule();
  }

  goBack(){
    this.router.navigate(['/nav/home']);
  }

  addModule() {
		const dialogRef = this.dialog.open(AddEditModuleComponent, {
			width: '920px',
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result){
        this.getAdminModule();
      }
		});
	}

  editModule(ele) {
		const dialogRef = this.dialog.open(AddEditModuleComponent, {
			width: '920px', data: ele
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result){
        this.getAdminModule();
      }
		});
	}
  
  openDetailedModuleSubModule(ele): void {
    sessionStorage.setItem("ModuleDetails", JSON.stringify(ele));
    this.router.navigate(['module/Details']);
  }

  async getAdminModule(){
    let param = {
      is_licensed: true
    }
    let result = await this.authService.getModules({param:this.reusable.encrypt(JSON.stringify(param))});
    if (result.success){
      this.moduleColl = new MatTableDataSource(result.result);
      this.moduleColl.sort = this.sort;
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
    }
  }

  applyModuleFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.moduleColl.filter = filterValue.trim().toLowerCase();
	}
}

@Component({
  selector: 'app-add-edit-module',
  templateUrl: './add-edit-module.component.html',
  styleUrls: ['./module.component.css'],
})
export class AddEditModuleComponent implements OnInit {

  isLoading:boolean;
  form: FormGroup;
  moduleId:number = null;
  btnTitle:string;
  isSaving = false;

  constructor(
		public dialogRef: MatDialogRef<AddEditModuleComponent>,
		@Inject(MAT_DIALOG_DATA) public data:ModuleData,
    private reusable: ReusableComponent,
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router,
  ) { }

  ngOnInit(){
    this.moduleId = this.data == undefined ? null : this.data.module_id;
    if(this.moduleId == null) {
      this.btnTitle = 'Save';
      this.createForm();
    } else {
      this.createForm();
      this.btnTitle = 'Update';
      this.form.controls.ModuleName.setValue(this.data.module_name);
    }
  }
  
  createForm() {
		this.form = this.formBuilder.group({
      ModuleName: ['', Validators.compose([ Validators.required, Validators.minLength(3), Validators.maxLength(50) ])],
		})
  }

  getErrorMessage(control, controlName) {
		let msg ='';
		msg += control.hasError('required') ? controlName+' must have value. ' :'';
		if (controlName =='ModuleName') {msg += (control.errors.minlength || control.errors.maxlength) ? 'Must be between 3 & 50 char length. ': ''}
		if (controlName =='ModuleName') {msg += (control.errors.validateName) ? 'Special Characters/Numbers are not allowed. ': ''}
		return msg;
	}

  async saveModule() {
    if (this.form.valid) {
      this.isLoading = true;
      let data:any, msg:string;
      const param = {
        module_id: this.moduleId,
        module_name: this.form.get('ModuleName').value,
      };
      if(this.moduleId == null){
        data = await this.authService.addModule({param: JSON.stringify(param)});
        msg = "Module Saved"
      } else {
        data = await this.authService.updateModule({param:JSON.stringify(param)});
        msg = "Module Updated"
      }
      this.isLoading = false;
      if (data.success) {
        this.reusable.openAlertMsg(msg,"info");
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

  onClose(status){
    this.dialogRef.close(status);
  }
}

@Component({
  selector: 'app-module-detailed',
  templateUrl: './module-detailed.html',
  styleUrls: ['./module.component.css']
})
export class ModuleDetails implements OnInit {

  isLoading = false;
  screenParam: any;
  isMobile:boolean = false;
  ht:number; data:any;
  width:number;
  userDetails: any;
  moduleColl = new MatTableDataSource([]);
  dispModule= ["module_name","sub_module_name"];

  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor(
    private reusable: ReusableComponent,
    private authService: AuthenticationService,
    private router: Router,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.reusable.screenChange.subscribe(res => {
      this.screenParam = {width : res.width, height:res.height-60};
      this.ht = res['height'] - 64;
      this.width = res["width"] - 64;
      if (this.screenParam.width < 600) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });
     this.getAdminModule();
  }

  goBack(){
    this.router.navigate(['/nav/module']);
    sessionStorage.removeItem("ModuleDetails");
  }

  ngOnDestroy(){
    sessionStorage.removeItem("editSubModule");
  }

  async getAdminModule(){
    this.data = JSON.parse(sessionStorage.getItem("ModuleDetails"));
    let param = {
      module_id : this.data.module_id,
    };
    let result = await this.authService.getSubModules({param:JSON.stringify(param)});
    if (result.success){
      this.moduleColl = new MatTableDataSource(result.result);
      this.moduleColl.sort = this.sort;
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
    }
  }

  applyModuleFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.moduleColl.filter = filterValue.trim().toLowerCase();
	}
  
}