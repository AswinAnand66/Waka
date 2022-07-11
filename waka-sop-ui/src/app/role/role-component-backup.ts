import { startWith, map } from 'rxjs/operators';
import { Component, OnInit, Inject, ViewChild, ElementRef, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../_services/index';
import { ReusableComponent , ConfirmDialog } from '../reusable/reusable.component';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog , MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-add-role-backup',
    templateUrl: './add-role.component.html',
    styleUrls: ['./role.component.css'],
})

export class AddEditRoleComponentBackup implements OnInit {
    filterRole: Observable<any>;
    
    constructor() {
        
    }

    ngOnInit() {

    }
    private _filterRole(name: string): any {
        if (name!=undefined){
          const filterValue = name!=undefined ? name.toLowerCase() : '';
          return this.roleNameColl.filter(option => option.role_name.toLowerCase().indexOf(filterValue) >= 0);
        }
      }


      async getAdminCompany(){
        let result = await this.authService.getAdminCompany();
        if (result.success){
          this.compColl = result.result;
          if (result.rowCount == 1){
            this.form.get("Company").setValue(this.compColl[0]);
            this.getCompRole(this.compColl[0]);
          }
        } else {
        this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
      }
      }



      async checkTicked(ele){
        if(ele == undefined){
          this.tickedArray.splice(0,1);
        } else {
          this.tickedArray.push(ele);
        }
        if(this.tickedArray.length > 0){
          this.isSelected = true;
        } else {
          this.isSelected = false;
        }
      }


      async getCompRole(element){
        let param = {
          company_id: element
        }
        this.permissionColl = new MatTableDataSource([]);
        this.roleModuleColl =[];
        this.getRoleNameForCompany(param);
        if(!this.isEditMode){
          this.form.get('RoleName').reset();
        }
      }

      async getRoleNameForCompany(param){
        this.isLoading = true;
        let result = await this.authService.getRoleNameForCompany({param:JSON.stringify(param)});
        if(result.success){
          this.isLoading = false;
          this.AssignedRolesOfCompany = result.result;
        }
        else {
          this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
        }
      }


      async getLicensedModules(param){
        let result = await this.authService.getInviteCompanyLicensedModulesList({param:JSON.stringify(param)});
        if (result.success){
          this.moduleColl = result.result;
          if(this.isEditMode){
            let Module = result.result.filter(x => x.module_id == this.module.module_id);
            this.form.get('Module').setValue(Module[0]);
          }
        }
        else {
          this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
        }
      }


      async validateRoleName_old() {
        this.CompanyRolesName.includes(this.form.get("RoleName").value) ?  this.buttonTitle = 'UPDATE' : this.buttonTitle = 'ADD';
        this.form.get('Module').reset();
        this.form.get('SubModule').reset();
        this.form.get("RoleName").valid ? this.form.get('Module').enable() : this.form.get('Module').disable();
        if(this.form.get("RoleName").value.trim() == ''){
          this.form.get("RoleName").setErrors({RoleNameEmpty : true})
        } else {
          let param = {
            role_name: this.form.get("RoleName").value.toLowerCase().replace(/ /gi, ''),
            company_id: this.form.get("Company").value,
          };
          let result = await this.authService.validateRoleName({param:JSON.stringify(param)});
          if (result.success && result.rowCount > 0) {
              this.form.get("RoleName").setErrors({ RoleNameExists: true });
              this.getRoleId(this.form.get("RoleName").value)
              return false;
          } else if (result.success && result.rowCount == 0) {
            
              return true;
          } else {
            this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
          };
        }
      }

      
      async getEditRolePermission(){
        this.isLoading = true;
        let param = {
          module_id:this.module.module_id,
        };
        let result = await this.authService.getModulesAndRolesForCompany({ param: this.reusable.encrypt(JSON.stringify(param)) });
        this.isLoading = false;
        if(this.module.module_name == 'Admin'){
          this.roleModuleColl = result.result.filter(x=>x.sub_module_name == 'Roles');  
        }else {
          this.roleModuleColl = result.result;
        }
        this.rolePermission = [];
        let i = 0;
        this.roleModuleColl.filter(x=>x.sub_module_name == this.datas.sub_module_name).map((role) => {
          this.rolePermission[i] = {};
          this.rolePermission[i]["role_id"] = this.datas!=undefined ? this.datas.role_id : null;
          this.rolePermission[i]["company_id"] = this.datas.company_id;
          this.rolePermission[i]["role_name"] = this.datas.role_name;
          this.rolePermission[i]["module_name"] = this.datas.module_name;
          this.rolePermission[i]["module_id"] = this.datas.module_id;
          this.rolePermission[i]["sub_module"] = this.datas.sub_module_name;
          this.rolePermission[i]["sub_module_id"] = this.datas.sub_module_id;
          this.rolePermission[i]["create_role"] = this.datas.create_role;
          this.rolePermission[i]["view_role"] = this.datas.view_role;
          this.rolePermission[i]["update_role"] = this.datas.update_role;
          this.rolePermission[i]["delete_role"] = this.datas.delete_role;
          i++;
        });
        this.permissionColl = new MatTableDataSource(this.rolePermission);
    }


    async getRoleId(rol){
        const role_id = this.AssignedRolesOfCompany.filter(x=>{
          return x.role_name.toLowerCase() === rol.toLowerCase()
        })
        this.role_id=role_id[0].role_id;
      }


      async getExistingRoleDetails(){
        let param ={
          role_id : this.role_id,
        }
        const result = await this.authService.getExistingRoleDetails({ param:param.role_id });
        this.permissionExistColl = result.result;
      }
  

      async getRolePermission(selValue){
        // if (this.form.get("RoleName").value == undefined){
        //   this.selRoleErrMsg = "Field is mandatory";
        //   return;
        // }
        // this.getExistingRoleDetails();
        this.isSelected = false;
        this.RoleName = this.form.get('RoleName').value;
        let param = {
          module_id:selValue.module_id
        };
        //if (typeof this.form.get("RoleName").value === 'string'){
          let i = 0;
          this.rolePermission = [];
          this.isLoading = true;
          let result = await this.authService.getModulesAndRolesForCompany({ param: this.reusable.encrypt(JSON.stringify(param)) });
          this.isLoading = false;
          if(selValue.module_name == 'Admin'){
            this.roleModuleColl = result.result.filter(x=>x.sub_module_name == 'Roles');
          }else {
              this.roleModuleColl = result.result;
          }
          this.roleModuleColl.map((role) => {
            if (role.module_name == selValue.module_name){
              this.rolePermission[i] = {};
              this.rolePermission[i]["role_id"] =  null;
              this.rolePermission[i]["company_id"] = this.form.get("Company").value;
              this.rolePermission[i]["module_name"] = selValue.module_name;
              this.rolePermission[i]["module_id"] = role.module_id;
              this.rolePermission[i]["sub_module"] = role.sub_module_name || role.sub_module;
              this.rolePermission[i]["sub_module_id"] = role.sub_module_id;
              this.rolePermission[i]["create_role"] = false;
              this.rolePermission[i]["view_role"] = false;
              this.rolePermission[i]["update_role"] = false;
              this.rolePermission[i]["delete_role"] = false;
              i++;
            }
          });
          
        
      //}
      // else {
      //   this.rolePermission = this.roleModuleColl.filter(x=>x.module_name == this.form.get("Module").value && (x.role_name == this.form.get("RoleName").value.role_name || x.role_id == undefined));
      //   this.rolePermission.map(role=>{
      //     role["company_id"] = this.form.get("Company").value.company_id;
      //     if (role.role_name == undefined) role["role_name"] = this.form.get("RoleName").value.role_name;
      //   })
      // }
      this.permissionColl = new MatTableDataSource(this.rolePermission);
      this.syncExistData();
    }


    async syncExistData(){
        if(this.permissionExistColl.length > 0){
          this.permissionExistColl.forEach((x)=>{
            const index = this.permissionColl.data.indexOf(x.sub_module_id);
            this.permissionColl.data.splice(index, 1);
            this.permissionColl._updateChangeSubscription();
            this.permissionColl.data.push(x);
          });
        }
      }


      async savePermission(){

        this.isSaving = true;
        this.form.get("Company").disable();
        this.form.get("RoleName").disable();
        this.form.get("Module").disable();
        let role_permission, param, result;
        role_permission = this.permissionColl.data.filter(x=>x.view_role!=false);
        param = {
          role_name: this.form.get('RoleName').value.trim(),
          company_id:this.form.get('Company').value, 
          permissions: role_permission,
          role_id:this.role_id,
          rmm_id:this.datas != undefined ? this.datas.rmm_id : null
        };
        if (this.role_id == null) {
          result = await this.authService.insRole({ param: this.reusable.encrypt(JSON.stringify(param)) }); 
        } else {
          let res = this.permissionColl.data.filter(x=>x.view_role== false);
          if(res.length === 0){
            result = await this.authService.updRole({ param: this.reusable.encrypt(JSON.stringify(param)) });
          } else {
            result = {success:false};
          }
        }
        this.isSaving = false;
        if (result.success) {
          setTimeout(() => {
            this.dialog.open(ConfirmDialog, {
              data: {
                type: 'info-success-role-add',
                content: result.message,
              }
            });
          }, 1000);
          this.router.navigate(['/nav/roles']);
        }
        else {
          this.reusable.openAlertMsg('View Must be Enabled',"warn");
        }
        }


        async onChangeCompanyName(){
            this.form.get('RoleName').reset();
            this.form.get('Module').reset();
            this.roleModuleColl = [];
          }

}