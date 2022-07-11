import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../_services/index';
import { ReusableComponent } from '../reusable/reusable.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-map-services',
  templateUrl: './map-services.component.html',
  styleUrls: ['./map-services.component.css']
})
export class MapServicesComponent implements OnInit {

  userDetails: any;
  height: number;
  width: number;
  isMobile: boolean = false;
  isLoading: boolean = false;
  mappedServicesColl = [];
  serviceTypeList = [];
  constructor(
    private reusable: ReusableComponent,
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.reusable.headHt.next(60);
    this.reusable.titleHeader.next("Map Enabled Services");
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
    this.isLoading = true;
    let result = await this.authService.getServiceTypeList();
    if (result.success) {
      this.serviceTypeList = result.result;
      this.viewMappedServices();
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  async viewMappedServices() {
    let result = await this.authService.viewMappedServices();
    if (result.success) {
      this.isLoading = false;
      result.rows.map((x)=>{
        x.serviceCount = 0
        x.service_types.map((y)=>{
          x.selected_services[y].map((z)=>{
            if(z.is_selected) {
              x.serviceCount += 1;
            }
          });
        });
      });
      this.mappedServicesColl = result.rows;
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  // mapService(service?:any) {
	// 	const dialogRef = this.dialog.open(ServicesMapping, {
	// 		height: '100%',
	// 		width: '100%',
	// 		position: { right: '0px' },
	// 		panelClass: "dialogclass",
	// 		data: service,
	// 	});
	// 	dialogRef.afterClosed().subscribe(result => {
	// 		if (result) {
	// 			this.viewMappedServices();
	// 		}
	// 	});
	// }

  mapService() {
    this.router.navigate(['/nav/admin/map-enabled-services/mapping']);
  }

  updmappedService(service?:any) {
    sessionStorage.setItem("MapServices", JSON.stringify(service));
    this.router.navigate(['/nav/admin/map-enabled-services/mapping']);
  }


  async delMappedService(services: any) {
    let conf = confirm("Are you sure you like to delete this Mapped Service?");
    if (!conf) return;
    let param = { 
      ms_id: services.ms_id
    };
    let result = await this.authService.delMappedServices({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if (result.success) {
      this.reusable.openAlertMsg("Mapped Service Deleted", "info");
      this.viewMappedServices();
    } else {
      this.reusable.openAlertMsg("Unable to Map the Services", "error");
    }
  }

  async viewServices(services:any){
    this.dialog.open(ViewMappedServicesDialog, {
      height: '70%',
      width: '60vw',
      panelClass: "dialogclass",
      data: services,
    });
  }
}

@Component({
	selector: 'map-services',
	templateUrl: 'services-mapping.html',
  styleUrls: ['./map-services.component.css']
})

export class ServicesMapping implements OnInit {
	userDetails: any;
	form: FormGroup;
  height: number;
  width: number;
	isLoading: boolean = false;
	isExtendMode: boolean;
	btnTitle: string;
	title: string;
	isEditMode: boolean = false;

  companyTypeList = [];
  serviceTypeList = []; 
  selectedServiceTypes = [];
  selectedServiceIds = [];
  selectedServices = [];
  
  selSectionTabIndex = 0;
  currentModule: number;
  mappedServicesColl = [];
  
  availableServiceColl = {};
  data:any;

	constructor(
		private router: Router,
		private authService: AuthenticationService,
		private reusable: ReusableComponent,
		private formBuilder: FormBuilder
	) {	}

	ngOnInit() {
    this.reusable.headHt.next(60);
    this.reusable.titleHeader.next("Map Enabled Services")
    this.reusable.screenChange.subscribe(screen => {
      if (screen.height < 600) {
        this.height = screen.height -70
      } else {
        this.height = screen.height -70;
      }
      this.width = screen.width - 112;
    });
    this.userDetails = ReusableComponent.usr;
    this.viewMappedServices();
		if (sessionStorage.getItem("MapServices") == undefined) {
			this.isExtendMode = false;
			this.btnTitle = 'SAVE';
			this.title = "MAP SERVICE";
			this.createForm();
		} else {
      this.data = JSON.parse(sessionStorage.getItem("MapServices"));
      this.getServiceTypeList();
			this.isEditMode = true;
      this.availableServiceColl = this.data['selected_services'];
      this.btnTitle = 'UPDATE';
			this.createForm();
      this.form.get('AccountType').setValue(this.data['account_type_id']);
      this.form.get('ServiceType').patchValue(this.data['service_type_id']);
			this.title = "EDIT MAPPED SERVICE";
		}
	}

	ngOnDestroy() {

  }

  createForm() {
    this.form = this.formBuilder.group({
      AccountType: [{value:'', disabled: this.isEditMode}, Validators.compose([
        Validators.required,
      ])],
      ServiceType: ['', Validators.compose([
        Validators.required,
      ])]
    })
  }

	onClose() {
		this.router.navigate(['/nav/admin/map-enabled-services']);
		sessionStorage.removeItem("MapServices");
	}

	getErrorMessage(control, controlName) {
		let msg = '';
		msg += control.hasError('required') ? 'Field Cannot be empty. ' : '';
		if (controlName == 'AccountType') { msg += (control.errors.ContractExists) ? 'Select a valid Account Type' : '' }
		if (controlName == 'ServiceType') { msg += (control.errors.ContractBlank) ? 'Select a valid Service Type' : '' }
		if (controlName == 'AvailableServices') { msg += (control.errors.maxlength) ? 'Select a valid Service' : '' }
		return msg;
	}

  async moduleSelected(mod){
    this.selSectionTabIndex = 0;
  }

  async getAvailableServices(serviceName:string) {
    let param = { 
      service_type: serviceName
    };
    let result = await this.authService.getAvailableServices({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
      if(this.availableServiceColl[serviceName] == undefined) {
        this.availableServiceColl[serviceName] = result.rows;
      }
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
  }

  async viewMappedServices() {
    let result = await this.authService.viewMappedServices();
    if (result.success) {
      this.getCompanyTypeList();
      this.isLoading = false;
      result.rows.map((r)=>{
        this.mappedServicesColl.push(r.account_type)
      });
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  async getCompanyTypeList() {
		let result = await this.authService.getCompanyTypeList();
		if (result.success) {
      if(!this.isEditMode){
        const filteredArr = new Set(this.mappedServicesColl);
        const newArr = result.result.filter((service) => {
          return !filteredArr.has(service.name);
        });
        this.companyTypeList = newArr
      } else {
        this.companyTypeList = result.result
      }
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

  async getServiceTypeList() {
    let result = await this.authService.getServiceTypeList();
    if (result.success) {
      this.serviceTypeList = result.result;
      if(this.isEditMode) {
        this.onChangeServiceType(this.data['service_type_id']);
      }
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  async onChangeAccountType(){
    this.form.get('ServiceType').reset();
    this.availableServiceColl = {}
    this.selectedServiceTypes = [];
    this.getServiceTypeList();
  }

  async onChangeServiceType(serviceIds){
    let removed = null;
    this.selectedServiceTypes = [];
    for (let i = 0; i < this.selectedServiceIds.length; i++) {
      if (serviceIds.indexOf(this.selectedServiceIds[i]) == -1) removed = this.selectedServiceIds[i];
    }
    if (removed) {
      delete this.availableServiceColl[this.serviceTypeList.filter(val => val.lookup_name_id == removed)[0].lookup_name];
    }
    this.selectedServiceIds = serviceIds;
    serviceIds.map((mod)=>{
      this.selectedServiceTypes.push(this.serviceTypeList.filter(val => val.lookup_name_id == mod)[0]);
      this.getAvailableServices(this.serviceTypeList.filter(val => val.lookup_name_id == mod)[0].lookup_name);
    });
  }

  onChangePermission(service:any) {

  }

  isEmpty(obj) {
    this.selectedServiceTypes.map((st:any)=>{
      let idx = 0;
      obj[st.lookup_name].map((x:any)=>{
        if(x.is_selected == undefined){
          idx +=1
        }
      })
      if(obj[st.lookup_name].length == idx){
        delete obj[st.lookup_name];
        const index = this.form.get('ServiceType').value.indexOf(st.lookup_name_id);
        if (index > -1) {
          this.form.get('ServiceType').value.splice(index, 1);
        }
      }
    });
    for(var prop in obj) {
      if(Object.prototype.hasOwnProperty.call(obj, prop)) {
        return false;
      }
    }
  
    return JSON.stringify(obj) === JSON.stringify({});
  }

  async mapServices() {
    if(!this.isEmpty(this.availableServiceColl)) {
      let result:any;
      let alertMsg:string;
      let param = { 
        ms_id: this.isEditMode ? this.data['ms_id'] : 0,
        account_type_id: this.form.get('AccountType').value,
        service_type_id: this.form.get('ServiceType').value,
        selected_services: this.availableServiceColl
      };
      if(this.isEditMode) {
        result = await this.authService.updMappedServices({ param: this.reusable.encrypt(JSON.stringify(param)) });
        alertMsg = "Services Updated.";
      } else {
        result = await this.authService.mapServices({ param: this.reusable.encrypt(JSON.stringify(param)) });
        alertMsg = "Services Mapped.";
      }
      if (result.success) {
        this.reusable.openAlertMsg(alertMsg, "info");
        this.onClose();
      } else {
        this.reusable.openAlertMsg("Unable to Map the Services", "error");
      }
    } else  {
      this.reusable.openAlertMsg("Please select at least one service", "error");
    }
  }
}

@Component({
	selector: 'view-mapped-services-dialog',
	templateUrl: 'view-mapped-services-dialog.html',
  styleUrls: ['./map-services.component.css']
})

export class ViewMappedServicesDialog implements OnInit {
  ht:number; 
  width:number;
  screenParam: any;
  isLoading = false;
  serviceTypeList = [];
  selectesSeviceTypes = [];
  availableServiceColl = {};

	constructor(
		public dialogRef: MatDialogRef<ViewMappedServicesDialog>,
		@Inject(MAT_DIALOG_DATA) public data: ViewMappedServicesDialog,
		private authService: AuthenticationService,
		private reusable: ReusableComponent,
	){}

  ngOnInit() {
    this.reusable.screenChange.subscribe(res => {
      this.screenParam = { width: res.width, height: res.height - 60 };
      this.ht = res['height'] - 64;
      this.width = res["width"] - 204;
    });
    this.availableServiceColl = this.data['selected_services'];
    this.getServiceTypeList();
  }

  async getServiceTypeList() {
    let result = await this.authService.getServiceTypeList();
    if (result.success) {
      this.serviceTypeList = result.result;
      this.data['service_type_id'].map((x)=>{
        this.selectesSeviceTypes.push(this.serviceTypeList.filter(val => val.lookup_name_id == x)[0].lookup_name);
      })
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  onClose(msg) {
    this.dialogRef.close(msg);
  }
}