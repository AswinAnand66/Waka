import { startWith, map, filter } from 'rxjs/operators';
import { Component, OnInit, Inject, ViewChild, ElementRef, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../_services/index';
import { ReusableComponent , ConfirmDialog } from '../reusable/reusable.component';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog , MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { partitionArray } from '@angular/compiler/src/util';

export interface ClassRole {
  role_id: number, 
  company_id: number,
  company_name:string,
  role_name: string, 
  module_id: number, 
  module_name: string,
  sub_module_id: number, 
  sub_module_name: string,
  create_role:boolean,
  view_role: boolean,
  update_role:boolean,
  delete_role: boolean,
  //map: boolean,
  //approve: boolean,
  //activate: boolean
}

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css'],
})
export class RoleComponent implements OnInit {
  isLoading = false;
  ht:number; 
  width:number;
  userDetails;
  roleCnt:number = 0;
  companyCnt:number = 0;
  screenParam: any;
  roleColl = new MatTableDataSource<ClassRole>([]);
  roleNewColl = new MatTableDataSource<ClassRole>([]);
  dispRole = ["company_name","role_name","module_name","sub_module_name","view_role","create_role","update_role","delete_role","edit","delete"];
  perm = {"1":true, "0":false};
  ExistingRolePermission=[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
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
    this.reusable.curRoute.next(null);
    this.userDetails = ReusableComponent.usr;
    if (!this.userDetails.is_admin && this.userDetails.company_admin==0){
      this.router.navigate(['/nav/home']);
      this.reusable.titleHeader.next("Manage Roles");
      this.reusable.headHt.next(60);    } 
    else {
      this.reusable.titleHeader.next("Manage Roles");
      this.reusable.headHt.next(60);
      if (!this.userDetails.is_admin){
        this.getRolesForGrid();
      }
      else {
        this.getAdminRoles();
      }
    }
  }

  ngOnDestroy() {
    this.authService.savePageAccess(this.pageStartTime, new Date(), this.pageCurrentUrl, 'Role');
  }

  delIconNo(role){
    if(role.is_admin_role){
      return '1';
    } else if(role.is_own_company == true || (role.is_own_company==false && role.is_delete ==true) || (role.is_admin_role == false && role.is_delete ==true)){
      return '2'
    } else if(role.is_own_admin_role){
      return '3'
    } else {
      return '1'
    }
  }

  iconNo(role){
    if(role.is_own_role) {
      return "2";
    } else if (!role.is_own_role && role.is_edit) {
      return "2";
    } else {
      return "1";
    }
  }

  async getAdminRoles(){
    this.isLoading = true;
    let param = {}
    let result = await this.authService.getAdminRoles({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if (result.success){
      result.result.map( res => res['is_own_admin_role'] = true)
      this.roleNewColl = new MatTableDataSource<ClassRole>(result.result);
      this.roleNewColl.sort = this.sort;
      this.isLoading = false;
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
    }
  }

  /*NOT IN USE FROM FEB 14*/
  // async getRoles(){
  //   let param = {}
  //   let result = await this.authService.getRoles({ param: this.reusable.encrypt(JSON.stringify(param)) });
  //   if (result.success){
  //     this.roleColl = new MatTableDataSource(result.result);
  //     this.roleColl.sort = this.sort;
  //   }
  //   else {
  //     this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
  //   }
  // }

  addRole(){
    this.router.navigate(['/nav/roles/AddEditRole']);
  }

  editRole(ele) {
    sessionStorage.setItem("editRoleParam", JSON.stringify(ele));
    this.router.navigate(['/nav/roles/AddEditRole']);
  }

  /*NOT IN USE FROM FEB 14*/
  // async delRole(ele){
  //   await this.getRolePermissioForExist(ele);
  //   if(this.ExistingRolePermission != null){
  //     if(this.ExistingRolePermission.length > 1){
  //       this.deleRole(ele);
  //     }else{
  //       this.deleRolePerm(ele);
  //     }
  //   }
  // }

  async getRolePermissioForExist(selvalue){
    const param={
      module_id:selvalue.module_id,
      role_id:selvalue.role_id,
    }
    let result = await this.authService.getRolePermissionForExist({param: JSON.stringify(param)});
    this.ExistingRolePermission = result.result;
  }

  /*NOT IN USE FROM FEB 14*/
  // async deleRole(ele){
  //   let conf = confirm("Do you want to delete this Role?");
  //   if (!conf) return;
  //   let param = {
  //     role_id:ele.role_id,
  //     rmm_id: ele.rmm_id
  //   }
  //   let result = await this.authService.deleteRole({param: JSON.stringify(param)});
  //   if (result.success){
  //     this.reusable.openAlertMsg("Role "+ele.role_name+" for sub module "+ele.sub_module_name +" deleted","info");
  //     if (!this.userDetails.is_admin){
  //       this.getRoles();
  //     } else {
  //        this.getAdminRoles();
  //     }		
  //   }
  //   else {
  //     this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
  //   }
  // }
  // async deleRolePerm(ele){
  //   let conf = confirm("Do you want to delete this Role Permanently?");
  //   if (!conf) return;
  //   let param = {
  //     isDeleteRole:true,
  //     role_id:ele.role_id,
  //     rmm_id: ele.rmm_id
  //   }
  //   let result = await this.authService.deleteRole({param: JSON.stringify(param)});
  //   if (result.success){
  //     this.reusable.openAlertMsg("Role "+ele.role_name+" for sub module "+ele.sub_module_name +" deleted","info");
  //     if (!this.userDetails.is_admin){
  //       this.getRoles();
  //     } else {
  //        this.getAdminRoles();
  //     }		
  //   }
  //   else {
  //     this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
  //   }
  // }

  async getRolesForGrid(){
    this.isLoading = true;
    let param = {};
    let result = await this.authService.getRolesForGrid({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if (result.success){
      console.log('res',result.result)
      this.roleNewColl = new MatTableDataSource(result.result);
      this.roleNewColl.sort = this.sort;
      this.isLoading = false;
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
    }
  }

  async getEventsForRoleDetails(role){
    const dialogRef = this.dialog.open(ViewEventDialog, {
      height: '70%',
      width: '60vw',
      panelClass: "dialogclass",
      data: [role],
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getRolesForGrid();
      }
    });
  }

  applyRoleFilterNew(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    if (filterValue == '') {
      this.getRolesForGrid();
    }
    const filtered = this.roleNewColl.data.filter((e: any) => {
      return (e.company_name.toLowerCase().includes(filterValue)) || (e.role_name.toLowerCase().includes(filterValue));
    });
    if (filtered.length != 0) {
      this.roleNewColl.data = filtered;
    } else {
      this.getRolesForGrid();
    }
  }

  async deleteRoleUser(role){
    let conf = confirm("Do you want to delete this Role?");
    if (!conf) return;
    let param = {
      role_id: role.role_id,
    }
    let result = await this.authService.deleteRoleUser({ param: this.reusable.encrypt(JSON.stringify(param))});
    if(result.success){
      setTimeout(() => {
        this.dialog.open(ConfirmDialog, {
          data: {
            type: 'info-success-role-add',
            content: `Role ${role.role_name} Deleted Successfully`,
          }
        });
      }, 1000);
      if (!this.userDetails.is_admin){
        this.getRolesForGrid();
      } else {
        this.getAdminRoles();
      }		
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
    }
  }

  applyRoleFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.roleColl.filter = filterValue.trim().toLowerCase();
  }

  goBack(){
    this.router.navigate(['/nav/home']);
  }

}

@Component({
selector: 'app-add-role',
templateUrl: './add-role.component.html',
styleUrls: ['./role.component.css'],
})
export class AddEditRoleComponent implements OnInit {
  ht:number; 
  width:number;
  isLoading = false;
  compColl=[];
  userDetails:any;
  form: FormGroup;
  moduleColl = [];
  modulesIds = [];
  subModuleColl = new MatTableDataSource([]);
  title: string; 
  buttonTitle:string;
  isEditMode: boolean; 
  role_id:number;
  pageStartTime: Date;
	pageCurrentUrl: string;
  isShowEventHint: boolean = false;
  isSectionLoading: boolean = false;
  eventHint: string = '';
  selSectionTabIndex = 0;
  CompanyRoles: Observable<string[]>;
  companyRolesColl = [];
  CompanyRolesName = [];
  selectedModules = [];
  selectedModuleIds = [];
  selectedSubModuleIds = [];
  selectedSubModules = [];
  EventsModules = [];
  EventsColl = [];
  currentModule: number;
  selectedEventIds = [];
  newSelModuleIds = [];
  remSelModuleIds = [];
  newSelSubModuleIds = [];
  remSelSubModuleIds = [];
  prevSelSubModuleIds = [];
  addedSubModules = [];
  editUsr;
  washedoutSubmodId=[];

  constructor(
  private reusable: ReusableComponent,
  private authService: AuthenticationService,
  private formBuilder: FormBuilder,
  private router: Router,
  public dialog: MatDialog,
  ) {   document.body.className = "dialog-page-body"; }
  
  ngOnInit() {
    this.pageStartTime = new Date();
		this.pageCurrentUrl = this.router.url;
    this.reusable.screenChange.subscribe(res => {
      this.ht = res['height'] - 204;
      this.width = res["width"] - 64;
    });
    this.createForm();
    this.reusable.headHt.next(60);
    this.userDetails = ReusableComponent.usr;
    this.reusable.curRoute.next('roles');
    this.role_id = null;
    this.title = "Add Role";
    this.buttonTitle = "Add";
    this.CompanyRoles = this.form.get('RoleName').valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' || value == undefined ? value : value["Company"]),
      map(value => this._filter(value))
    )
    this.editUsr = JSON.parse(sessionStorage.getItem("editRoleParam"));
    if(this.editUsr != null) this.title = 'Edit Role';
    this.reusable.titleHeader.next(this.title);
    if (!this.userDetails.is_admin){
      this.getUserCompany();
    }
    else {
      this.getAdminCompany();
    }
  }
  
  private _filter(value): string[] {
    const filterValue = value;
    return this.CompanyRolesName.filter(option => option.toLowerCase().includes(filterValue.toLowerCase()));
  }

  createForm() {
    this.form = this.formBuilder.group({
      Company: ['', Validators.compose([
      Validators.required,
    ])],
    RoleName: [{ value: '', disabled: true }, Validators.compose([
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50),
      this.noWhitespaceValidator
    ])],
    Module: [{ value: '', disabled: true}, Validators.compose([
      Validators.required,
    ])],
    SubModule: [{ value: [] , disabled: true}, Validators.compose([
      Validators.required,
    ])],
  })
  }

  noWhitespaceValidator(control: FormControl){
		const isWhitespace = (control.value || '').toString().trim().length === 0;
		const isValid = !isWhitespace;
		return isValid ? null : { 'whitespace': true };
	}

  getErrorMessage(control, controlName) {
    let msg = '';
    msg += control.hasError('required') ? ' Field cannot be empty' : '';
    // if (controlName == 'RoleName') { msg += (control.errors.RoleNameExists) ? 'Role Name already exists for this company' : '' }
    if (controlName == 'RoleName') { msg += (control.errors.RoleNameEmpty) ? 'Role Name is Invalid' : '' }
    if (controlName == 'RoleName') { msg += (control.errors.RoleExists) ? 'Role name already exists' : '' }
    if (controlName == 'RoleName') { msg += (control.errors.minlength || control.errors.maxlength) ? 'Must be between 3 & 50 char length. ' : '' }
    return msg;
  }

  dispRole(val:any): string {
    return val && val.role_name ? val.role_name : '';
  }

  ngOnDestroy() {
    this.authService.savePageAccess(this.pageStartTime, new Date(), this.pageCurrentUrl, 'Add Edit Role');
    sessionStorage.removeItem("editRoleParam");
    document.body.className = "";
  }

  async getUserCompany(){
    this.isLoading =  true;
    let result = await this.authService.getLicenseCompanyForRoles();
    if (result.success){
      let companies;
      !this.userDetails.is_admin ? companies = result.result.filter( company => company.office_category == 'head quarters' && (company.is_add_role == true || company.is_own_company)) : companies = result.result;
      this.compColl = companies;
      this.isLoading = false;
      if (result.success && this.compColl.length>0){
        this.getSubModulesForRoles();
        this.editUSrSettings(companies)
        this.getRolesOfCompany();
        await this.getModulesForRoles();
      }
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
    }
  }
  editUSrSettings(companies){
    if(this.editUsr != null){
      let comp = companies.filter( ele => ele.company_name == this.editUsr.company_name);
      this.form.get("Company").setValue(comp[0].company_id);
    } else {
      this.form.get("Company").setValue(companies[0].company_id);
    }
  }

  async getAdminCompany(){
    this.isLoading =  true;
    let result = await this.authService.getAdminCompanyForRoles();
    if (result.success){
      let companies = result.result;
      this.compColl = companies;
      this.isLoading = this.editUsr == null ? false : true;
      this.getSubModulesForRoles();
      this.editUSrSettings(companies);
      this.getRolesOfCompany();
      await this.getModulesForRoles();
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
    }
  }

  onClose(){
    this.router.navigate(['/nav/roles']);
  }

  async validateRoleName() {
    if(!this.CompanyRolesName.includes(this.form.get("RoleName").value)){
      this.form.get("RoleName").setErrors(null);
      this.role_id = undefined;
      this.EventsColl = [];
      this.isEditMode = false;
    }
    this.CompanyRolesName.filter(name => name.trim().toLowerCase() == this.form.get("RoleName").value.trim().toLowerCase()).length > 0 ? this.form.get("RoleName").setErrors({ RoleExists : true }) :  this.form.get("RoleName").setErrors(null);
    this.form.get('Module').reset();
    this.form.get('SubModule').reset();
    this.form.get("RoleName").valid ? this.form.get('Module').enable() : this.form.get('Module').disable();
  }

  async getModulesForRoles(){
    let result = await this.authService.getModulesForRoles();
    if (result.success){
      this.moduleColl  = result.rows;
      this.modulesIds = [];
      result.rows.map((mod)=>{
        this.modulesIds.push(mod.module_id);
      });
      if(this.editUsr != null) {
        this.form.get('Module').setValue(this.editUsr['modules']);
        console.log('edit',this.editUsr)
      }
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
    }
  }

  acceptedChars(event) {
    return new RegExp('^[a-zA-Z_ -]*$').test(event.key);
  }

  async onChangeModules(moduleIds){
    if(this.isEditMode){
      this.addedSubModules = [];
      // this.prevSelSubModuleIds = JSON.parse(JSON.stringify(this.selectedSubModuleIds));
      this.selectedModules = [];
      this.selectedSubModules = [];
      this.selectedSubModuleIds = [];
      this.newSelModuleIds = [...this.selectedModuleIds,...moduleIds.filter(val => !this.selectedModuleIds.includes(val))];
      this.remSelModuleIds = [...this.remSelModuleIds,...this.selectedModuleIds.filter(val => !moduleIds.includes(val))];
      if(this.newSelModuleIds.includes(this.selectedModuleIds.filter(val => !moduleIds.includes(val))[0])){
        let remIdx = this.newSelModuleIds.indexOf(this.selectedModuleIds.filter(val => !moduleIds.includes(val))[0]);
        this.newSelModuleIds.splice(remIdx,1);
      }
      this.selectedModuleIds = this.newSelModuleIds;
      this.selectedModules = this.moduleColl.filter(val => this.newSelModuleIds.includes(val.module_id));
      this.subModuleColl.filteredData = this.subModuleColl.data.filter(val => this.selectedModuleIds.includes(val.module_id));
      let filteredsub = this.subModuleColl.filteredData.filter(val => this.newSelModuleIds.includes(val.module_id));
      this.subModuleColl.data.map((sub)=>{
        if(this.remSelModuleIds.includes(sub.module_id)){
          for(let id of sub.sub_modules) {
            this.remSelSubModuleIds.push(id.sub_module_id)
          }
        }
      });
      filteredsub.map((sub)=> {
        this.selectedSubModules = [...this.selectedSubModules,...sub.sub_modules.filter(e => e.disabled == false)];
      });
      this.selectedSubModules.filter(val => {if (this.selectedSubModuleIds.indexOf(val.sub_module_id)==-1) { if(!val.disabled) this.selectedSubModuleIds.push(val.sub_module_id)}});
    } else {
      this.selectedModules = [];
      this.selectedSubModuleIds = [];
      this.selectedSubModules = [];
      this.EventsColl = [];
      this.selectedModuleIds = moduleIds;
      moduleIds.map((mod)=>{
          this.selectedModules.push(this.moduleColl.filter(val => val.module_id == mod)[0]);
      });
    }
  }

  async setSubModules(){
    if(this.isEditMode){
      let newSubmodules = [];
      if(this.prevSelSubModuleIds.length == 0) {
        this.prevSelSubModuleIds = JSON.parse(JSON.stringify(this.selectedSubModuleIds));
      }
      this.selectedSubModuleIds.filter(val => {
        if (!this.prevSelSubModuleIds.includes(val)) {
          newSubmodules.push(val)
        }
      });
      this.form.get('SubModule').setValue(this.selectedSubModuleIds);
      this.selectedEventIds = [];
      if(newSubmodules.length > 0 && this.addedSubModules.length == 0) {
        let param = {
          role_id: this.role_id,
          sub_module_ids: newSubmodules,
        }
        let result = await this.authService.getEventsForSelSubModules({ param: this.reusable.encrypt(JSON.stringify(param)) });
        if(result.success){
          this.addedSubModules = newSubmodules;
          this.EventsColl = [...this.EventsColl,...result.result];
        } else {
          this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
        }
      }
      this.EventsColl.map((evecoll)=>{
        if(!this.remSelSubModuleIds.includes(evecoll.sub_module_id)) {
          for(let eve of evecoll['events']){
            if(eve.is_selected == true)
              this.selectedEventIds.push(eve.event_id);
          }
        }
      });
      this.moduleSelected(this.selectedModules[0]);
    } else {
      this.form.get('SubModule').enable();
      let submods = [];
      for(let i of this.selectedModuleIds){
        this.subModuleColl.data.filter(val => val.module_id == i);
        submods.push(this.subModuleColl.data.filter(val => val.module_id == i)[0])
      }
      this.subModuleColl.filteredData = submods;
      this.subModuleColl.data.map((submod)=>{
        if(this.selectedModuleIds.includes(submod.module_id)){
          for(let sub of submod['sub_modules']){
            if(!sub.disabled){
              this.selectedSubModuleIds.includes(sub.sub_module_id) ? '' : this.selectedSubModuleIds.push(sub.sub_module_id);
            }
          }
        }
      });
      this.selectedSubModules = [];
      this.subModuleColl.data.map((submod)=>{
        for (let sub of submod['sub_modules']){
          this.selectedSubModuleIds.includes(sub.sub_module_id) ? this.selectedSubModules.push(sub) : '';
        }
      });
      this.selectedEventIds=[]
      this.EventsColl.map((evecoll, index)=>{
        if(this.selectedSubModuleIds.includes(evecoll.sub_module_id)){
          this.EventsColl[index].events.map(eve => {
            if(eve.is_selected == true){
              this.selectedEventIds.push(eve.event_id)
            }
          })
        }
      });
      this.form.get('SubModule').setValue(this.selectedSubModuleIds);
      this.moduleSelected(this.selectedModules[0]);
      this.getEventsPermissionForSel();
    }
  }

  async getSubModulesForRoles(){
    this.selectedModules.length > 0 ? this.moduleSelected(this.selectedModules[0]) : '';
    let param = {};
    let result = await this.authService.getSubModulesForRoles({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if (result.success){
      this.subModuleColl = new MatTableDataSource(result.rows);
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
    }
  }

  async onChangeSubModules(submodules){
    this.selectedEventIds = [];
    if(this.prevSelSubModuleIds.length == 0) {
      this.prevSelSubModuleIds = JSON.parse(JSON.stringify(this.selectedSubModuleIds));
    }
    this.newSelSubModuleIds = [...this.prevSelSubModuleIds,...submodules.filter(val => !this.selectedSubModuleIds.includes(val))];
    this.remSelSubModuleIds = [...this.remSelSubModuleIds,...this.selectedSubModuleIds.filter(val => !submodules.includes(val))]
    this.EventsColl.map((evecoll)=>{
      if(!this.remSelSubModuleIds.includes(evecoll.sub_module_id)) {
        for (let eve of evecoll['events']) {
          this.selectedEventIds.push(eve.event_id);
        }
      }
    });
    this.selectedSubModuleIds = submodules;
    this.selectedSubModules = [];
    this.subModuleColl.data.map((submod)=>{
      for (let sub of submod['sub_modules']){
        this.selectedSubModuleIds.includes(sub.sub_module_id) ? this.selectedSubModules.push(sub) : '';
      }
    });
  }

  async setEventRoles(){
    if(this.prevSelSubModuleIds.length == 0) {
      this.prevSelSubModuleIds = JSON.parse(JSON.stringify(this.selectedSubModuleIds));
    }
    this.EventsColl.map((evecoll)=>{
      if(this.remSelSubModuleIds.includes(evecoll.sub_module_id)) {
        let idx = this.EventsColl.indexOf(evecoll);
        this.EventsColl.splice(idx,1);
      }
    });
    this.subModuleColl.filteredData.map((submod)=>{
      let submodenbaled = submod['sub_modules'].filter(val => !val.disabled);
      let count = 0;
      for(let sub of submod['sub_modules']) {
        let submodcount = submodenbaled.length;
        if(this.remSelSubModuleIds.includes(sub.sub_module_id)){
          count += 1;
        }
        if(count == submodcount) {
          this.selectedModuleIds.splice(this.selectedModuleIds.indexOf(submod.module_id),1);
          count = 0;
        }
      }
      this.selectedModules = [];
      this.moduleColl.map((mod)=>{
        this.selectedModuleIds.includes(mod.module_id) ? this.selectedModules.push(mod) : '';
      });
      this.moduleSelected(this.selectedModules[0]);
    });
    let newSubmodules = [];
    this.selectedSubModuleIds.filter(val => {if (this.prevSelSubModuleIds.indexOf(val)==-1)newSubmodules.push(val)});
    if(newSubmodules.length > 0) {
      let param = {
        role_id: this.role_id,
        sub_module_ids: newSubmodules,
      }
      let result = await this.authService.getEventsForSelSubModules({ param: this.reusable.encrypt(JSON.stringify(param)) });
      if(result.success){
        this.addedSubModules = newSubmodules;
        this.EventsColl = [...this.EventsColl,...result.result];
      } else {
        this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
      }
    }
    this.form.get('Module').setValue(this.selectedModuleIds);
  }

  async getEventsPermissionForSel(){
    let param = {
      sub_module_ids: this.selectedSubModuleIds,
    }
    let result = await this.authService.getEventsForSelSubModules({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if(result.success){
      result.result.map((evecoll)=>{
        for(let eve of evecoll['events']){
          if(!this.selectedEventIds.includes(eve.event_id)){
            eve.is_selected ? this.selectedEventIds.push(eve.event_id) : '';
          }
        }
      })
      this.EventsColl = [...this.EventsColl,...result.result];
    }
    this.removeEventsCollDuplicate()
  }
  removeEventsCollDuplicate(){
    this.EventsColl = this.EventsColl.filter((value, index, self) =>
    index === self.findIndex((t) => (
      t.sub_module_id === value.sub_module_id && t.section_name === value.section_name
    ))
  ) 
  }
  async getEventsPermissionForRole(){
    this.EventsColl = [];
    let param = {
      role_id: this.role_id
    }
    let result = await this.authService.getEventsPermissionForRole({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if (result.success){
      this.selectedEventIds = [];
      this.EventsColl =  result.rows;
      result.rows.map((evecoll)=>{
        let is_add_sub =  false;
        let count = 0;
        for(let eve of evecoll['events']){
          if(!this.selectedEventIds.includes(eve.event_id)){
            eve.is_selected ? this.selectedEventIds.push(eve.event_id) : '';
          }
          eve.is_selected ? count+= 1 : '';
          count == 0 ? is_add_sub = false : is_add_sub = true; 
        }
        !this.selectedSubModuleIds.includes(evecoll.sub_module_id) && is_add_sub  ? this.selectedSubModuleIds.push(evecoll.sub_module_id) :'';
      });
      if(this.isEditMode){
        this.selectedSubModules = [];
      }
      this.subModuleColl.data.map((submod)=>{
        for (let sub of submod['sub_modules']){
          if(this.selectedSubModuleIds.includes(sub.sub_module_id)){
            if(!this.selectedModuleIds.includes(sub.module_id)){
              this.selectedModuleIds.push(submod.module_id);
              this.selectedModules.push(this.moduleColl.filter(val => val.module_id == submod.module_id)[0]);
            }
            this.selectedSubModuleIds.includes(sub.sub_module_id) ? this.selectedSubModules.push(sub) : '';
          }
        }
      });
      this.form.get('Module').setValue(this.selectedModuleIds);
      this.form.get('Module').enable();
      this.form.get('SubModule').setValue(this.selectedSubModuleIds);
      this.form.get('SubModule').enable();
      this.subModuleColl.filteredData = this.subModuleColl.data.filter(val => this.selectedModuleIds.includes(val.module_id));
      this.moduleSelected(this.selectedModules[0]);
      this.prevSelSubModuleIds = JSON.parse(JSON.stringify(this.selectedSubModuleIds));
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
    }
    if(this.isLoading == true) this.isLoading = false
  }

  async moduleSelected(mod){
    this.selSectionTabIndex = 0;
    this.selectedModules.map((module)=> module.is_selected = false)
    mod['is_selected'] = true;
    this.currentModule = mod.module_id;
  }
  
  showEventHint(show,eventhint){
    this.isShowEventHint = show;
    this.eventHint = show ? eventhint : '';
  }

  onChangePermission(ele, i){
    let idx = this.selectedEventIds.indexOf(ele.event_id);
    ele.is_selected ? this.selectedEventIds.push(ele.event_id) : this.selectedEventIds.splice(idx,1);
    
    let submodIdToRem = this.isAllSibEventDeleted(i);
    if(submodIdToRem != null){
      this.washedoutSubmodId.push(submodIdToRem)
    }
  }
  isAllSibEventDeleted(idx){
    let cnt=0;
    this.EventsColl.filter( eve => eve.sub_module_id == this.EventsColl[idx].sub_module_id).map( e => {
      e.events.map( event => {
      if(this.selectedEventIds.includes(event.event_id)){
        cnt++;
      }
      })
    })
   if(cnt == 0){
     return this.EventsColl[idx].sub_module_id;
   } else {
     return null;
   }
  }


  setSelModules() {
    this.selectedModules = [];
    this.moduleColl.map((mod)=>{
      this.selectedModuleIds.includes(mod.module_id) ? this.selectedModules.push(mod) : '';
    })
  }
  
  async createUpdateRole(){
    this.isLoading = true;
    let param = {};
    if(this.washedoutSubmodId.length > 0){
      this.selectedSubModuleIds.forEach((id, index) => {
        if(this.washedoutSubmodId.includes(id)){
          this.selectedSubModuleIds.splice(index, 1)
        }
      })
      this.EventsColl.map((eve, i) => {
        if(this.washedoutSubmodId.includes(eve.sub_module_id)){
          this.EventsColl[i].events.map(e => this.selectedEventIds.splice(this.selectedEventIds.indexOf(e.event_id), 1))
        }
      })
    }
    param = {
      role_name: this.form.get('RoleName').value.trim(),
      company_id:this.form.get('Company').value,
      module_id: this.selectedModuleIds,
      sub_module_ids: this.selectedSubModuleIds,
      role_id: this.role_id ? this.role_id : undefined,
      event_ids: this.selectedEventIds,
    };
    let result = await this.authService.createUpdateRole({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if(result.success){
      this.isLoading = false;
      setTimeout(() => {
        this.dialog.open(ConfirmDialog, {
          data: {
            type: 'info-success-role-add',
            content: result.message,
          }
        });
      }, 1000);
      this.router.navigate(['/nav/roles']);
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result),"error")
      this.isLoading = false;
    }
  };

  async getRolesOfCompany(){
    this.companyRolesColl = [];
    this.CompanyRolesName = [];
    this.form.get('RoleName').reset();
    this.form.get('Module').reset();
    this.form.get('SubModule').reset();
    let param ={
      company_id : this.form.get('Company').value
    }
    let result = await this.authService.getRolesOfCompany({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if(result.success){
      this.companyRolesColl = result.result;
      this.form.get('RoleName').enable();
      if(this.editUsr != null){
        this.form.get('RoleName').setValue(this.editUsr.role_name);
        this.setRoles();
      }
      result.result.map((comp)=>{
        this.CompanyRolesName.push(comp.role_name.toLowerCase());
      })
    }
  }

  setRoles(){
    if(this.role_id == undefined){
      let role_name = this.form.get("RoleName").value.toLowerCase();
      this.companyRolesColl.map((comp => {
        if(comp.role_name.toLowerCase() == role_name){
         this.role_id = comp.role_id;
         this.isEditMode = true;
         this.buttonTitle = 'UPDATE';
         this.getEventsPermissionForRole();
        }
      }))
    }
  }

  setRoleData(event){
    let role_name = event.option.value.toLowerCase();
    let selRole = this.companyRolesColl.filter(val => val.role_name.toLowerCase() == role_name);
    this.role_id = selRole[0].role_id;
    this.isEditMode = true;
    this.buttonTitle = 'UPDATE';
    this.getEventsPermissionForRole();
  }
}


@Component({
	selector: 'view-event-dialog',
	templateUrl: 'view-event-dialog.html',
  styleUrls: ['./role.component.css']
})

export class ViewEventDialog implements OnInit {
  ht:number; 
  width:number;
  screenParam: any;
  eventViewColl = new MatTableDataSource([]);
  subModuleList = [];
  moduleList = [];
  selSubModuleIdx: number = 0;
  selModuleIdx: number = 0;
  selSectionTabIndex = 0;
  currentModule: number;
  currentModuleIdx: number;
  currentSubModule: number;
  isLoading = false;

  @ViewChild('subModuleCategory', { read: ElementRef }) public subModuleCategory: ElementRef<any>;

	constructor(
		private router: Router,
		public dialogRef: MatDialogRef<ViewEventDialog>,
		@Inject(MAT_DIALOG_DATA) public data: ViewEventDialog,
		private authService: AuthenticationService,
		private reusable: ReusableComponent,
		private formBuilder: FormBuilder,
	){}

  ngOnInit() {
    this.reusable.screenChange.subscribe(res => {
      this.screenParam = { width: res.width, height: res.height - 60 };
      this.ht = res['height'] - 64;
      this.width = res["width"] - 64;
    });
    this.setModuleList();
    this.setSubModuleList();
  }

  setModuleList(){
    this.isLoading =  true;
    this.moduleList = [];
    this.moduleList = this.data[0].modules;
    this.moduleSelection(this.moduleList[0],0);
    this.isLoading =  false;
  }

  async setSubModuleList(){
    this.isLoading =  true;
    let module_ids = [];
    this.data[0].modules.map((mod) =>{
      module_ids.push(mod.module_id)
    })
    let param = {
      module_ids : module_ids
    }
    let result = await this.authService.getSubModulesForView({ param: this.reusable.encrypt(JSON.stringify(param))});
    if (result.success){
      this.isLoading =  false;
      let subModuleIds = [];
      this.data[0].sub_modules.map((submod) =>{
        subModuleIds.push(submod.sub_module_id)
      })
      result.rows.map((res:any) => {
        let subs = [];
        for(let sub of res['sub_modules']){
          if(subModuleIds.includes(sub.sub_module_id)){
            subs.push(sub);
          }
        }
        res['sub_modules'] = subs;
        this.subModuleList.push(res);
      })
      this.getEventForView();
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
    }
  }

  async getEventForView(){
    let param = {
      role_id : this.data[0].role_id
    }
    let result = await this.authService.getEventForView({ param: this.reusable.encrypt(JSON.stringify(param))});
    if(result.success){
      this.eventViewColl = new MatTableDataSource(result.result);
    }
  }

  async moduleSelection(module,idx){
    this.selSectionTabIndex = 0;
    this.moduleList.map((mod)=>{
      mod.is_selected = false;
    })
    module.is_selected = true;
    this.currentModule = module.module_id;
    this.currentModuleIdx = idx;
  }

  async changeSectionTabSubModule(submod){
    this.currentSubModule =  this.subModuleList[this.currentModuleIdx]['sub_modules'][submod].sub_module_id;
  }

  onClose(msg) {
    this.dialogRef.close(msg);
  }
}

