import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../_services/index';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmDialog, ReusableComponent } from '../reusable/reusable.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog , MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-license',
  templateUrl: './license.component.html',
  styleUrls: ['./license.component.css']
})
export class LicenseComponent implements OnInit {
  
  isLoading = false;
  screenParam: any;
  isMobile:boolean = false;
  ht:number; 
  width:number;
  licenseColl = new MatTableDataSource([]);
  dispLicense = ["company_name", "status", "action"];
  licModuleVal:any;

  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatSort) set matSort(ms: MatSort) {
		this.sort = ms;
		this.setLicenseDetailsSort();
	}

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
      this.reusable.titleHeader.next("License");
      if (this.screenParam.width < 600) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });
    this.getLicenseDetails();
    setTimeout(()=>{
      this.reusable.headHt.next(60);
    },1000)
  }

  goBack(){
    this.router.navigate(['/nav/home']);
  }

  setLicenseDetailsSort(){
    this.licenseColl.sort = this.sort;
  }

  async getLicenseDetails(){
    this.isLoading = true;
    let result = await this.authService.getLicenseDetails();
    if (result.success){
      this.licenseColl = new MatTableDataSource(result.result);
      this.isLoading = false;
      this.setLicenseDetailsSort();
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
    }
  }

  async getlicenseModules(company_id) {
		this.isLoading = true;
		const param = {
			company_id : company_id,
		}
		let result = await this.authService.getlicenseModules({param:JSON.stringify(param)});
		this.isLoading = false;
		if (result.success) {
		    result.rowCount == 0 ? this.licModuleVal = 0 : this.licModuleVal = result.result[0];
		} else {
		  this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	  }

  async revokeLicense(ele) {
    await this.getlicenseModules(ele.company_id);
		const dialogRef = this.dialog.open(ManageLicenseComponent, {
			width: '400px',
      height: '100%',
      position: {right:'0px'},
      data: { element:ele, m_d_ids : this.licModuleVal, type:'revoke' }
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
					this.getLicenseDetails();
        }
		});
	}
	
	 async approveLicense(ele) {
    await this.getlicenseModules(ele.company_id);
    const dialogRef = this.dialog.open(ManageLicenseComponent, {
			width: '400px',
      height: '100%',
      position: {right:'0px'},
      data: { element:ele, m_d_ids : this.licModuleVal, type: 'approve' }
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
					this.getLicenseDetails();
           }
		});
	}

  applyLicenseFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.licenseColl.filter = filterValue.trim().toLowerCase();
	}
}

/* Manage License */
@Component({
	selector: 'app-manage-license',
	templateUrl: 'license-manage.html',
	styleUrls: ['./license.component.css']
})

export class ManageLicenseComponent implements OnInit {

  isLoading:boolean;
  form: FormGroup;
  moduleVal:any;
  btnTitle:string;
  isSaving = false;
  modulesList:any;
  selectedModules : any;
  selectable = true;
  checked = true;
  removable = true;
  confirmModulesList=[];
  isModulesValid:boolean;
  constructor(
	public dialogRef: MatDialogRef<ManageLicenseComponent>,
	@Inject(MAT_DIALOG_DATA) public data:ManageLicenseComponent,
    private reusable: ReusableComponent,
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
		public dialog: MatDialog,
  ) { }

  ngOnInit(){
      this.getModulesList();
      if (this.data['type'] == 'approve') {
        this.moduleVal = this.data['m_d_ids'].m_d_ids;
        //this.createForm();    
        this.btnTitle = "Approve";
      } else {
        this.moduleVal = this.data['m_d_ids'].m_d_ids;
        this.btnTitle = "Revoke";
        //this.createForm();
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
    let data = await this.authService.getModules({param:this.reusable.encrypt(JSON.stringify(param))});
    this.isLoading = false;
    if (data.success) {
      this.modulesList = data.result
      data.result.forEach(element => {
        element.is_selected = true;
      });
      console.log('modulelist',this.modulesList)
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(data), "error");
    }
    this.selectedModules = this.modulesList.filter( i => this.moduleVal.includes( i.module_id ));
    this.selectedModules.forEach(element => {
      element.is_selected = true
    });
  }

  onChange(ele,i){
    if(this.modulesList[i].is_selected == true){
      this.modulesList[i].is_selected = false;
    } else {
      this.modulesList[i].is_selected = true;
    }
    // if (ele.is_selected)
    //   this.selectedModules.push(ele);
    // else
    //   this.selectedModules = this.selectedModules.filter( i => i.is_selected == true);
  }

  async updateLicense(){
    
    if(this.modulesList.length != 0){
      let metrics = [];
      this.modulesList.map(ele=>{
        if(ele.is_selected && ele.module_name == 'Admin'){
          metrics.push(Number(ele.module_id));
        }
      });
      if(metrics.length != 0){
        this.isLoading = true;
        let msg, data;
        const param ={
          m_ids:metrics,
          company_id:this.data['element'].company_id,
          cl_id: this.data['element'].cl_id,
        }
        if (this.data['type'] == 'approve') { 
          data = await this.authService.approveLicenseStatus({param: JSON.stringify(param)});
          msg = 'License Approved Successfully!';
        }else {
          data = await this.authService.revokeLicenseStatus({param: JSON.stringify(param)});
          msg = 'License Revoked Successfully!';
        } 
        this.isLoading = false;
        if (data.success) {
          setTimeout(() => {
            this.dialog.open(ConfirmDialog, {
              data: {
                type: 'info-success',
                content:msg,
              },
              disableClose: true,
            });
          }, 1000);
          this.onClose(data.success);
        } else {
            this.reusable.openAlertMsg(this.authService.invalidSession(data), "error");
            if (data.invalidToken != undefined && data.invalidToken) {
              this.onClose(data.success);
              }
        }
      } else {
        this.reusable.openAlertMsg('Atleast select one permission','warn');
      }
      
    } else {
      this.reusable.openAlertMsg("Form is not valid, please check for errors", "info");
    }
		// if (this.form.valid) {
    //   console.log('running')
    // //   let metrics = [];
    // //   this.selectedModules.map(ele => {
		// // 		metrics.push(Number(ele.module_id));
		// // 	});
		// // 	this.isLoading = true;
		// // 	let msg,data;
    // //   const param = {
		// // 		m_ids: metrics,
		// // 		company_id: this.data['element'].company_id,
		// // 		cl_id : this.data['element'].cl_id
		// // 	};
    // //   if (this.data['type'] == 'approve') {
    // //       data = await this.authService.approveLicenseStatus({param: JSON.stringify(param)});
    // //       msg = 'License Approved for company : '+ this.data['element'].company_name; 
    // //   }else {
    // //       data = await this.authService.revokeLicenseStatus({param: JSON.stringify(param)});
    // //       msg = 'License Revoked for company : '+ this.data['element'].company_name;
    // //   } 
		// //   this.isLoading = false;
		// // 	if (data.success) {
		// // 		setTimeout(() => {
    // //       this.dialog.open(ConfirmDialog, {
    // //         data: {
    // //           type: 'info-success',
    // //           content:msg,
    // //         },
    // //         disableClose: true,
    // //       });
    // //     }, 1000);
		// // 		this.onClose(data.success);
		// // 	} else {
		// // 		this.reusable.openAlertMsg(this.authService.invalidSession(data), "error");
		// // 		if (data.invalidToken != undefined && data.invalidToken) {
		// // 		this.onClose(data.success);
		// // 		}
		// // 	}
		// // } else {
		// //   this.reusable.openAlertMsg("Form is not valid, please check for errors", "info");
		// }
	}
	
  onClose(status){
		this.dialogRef.close(status);
  }
}

