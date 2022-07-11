import { environment } from './../../environments/environment.prod';
import { DomSanitizer } from '@angular/platform-browser';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from './../_services/authentication.service';
import { ReusableComponent } from './../reusable/reusable.component';
import { Component, NgZone, OnInit, ViewChild, Inject } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-shipment-booking',
  templateUrl: './shipment-booking.component.html',
  styleUrls: ['./shipment-booking.component.css']
})
export class ShipmentBookingComponent implements OnInit {
  isLoading: boolean = false;
	height: number;
	width: number;
  currentTab: string = 'Shipments';
	shipmentTableHeight: number;
  userDetails: any;
	isMobileView:Boolean = false;
  shipmentBookingColl = new MatTableDataSource([]);
  underProgress: boolean = false;
  toggleShipment: string;
  pageSize: number = 0;
  contentLength: number;
	dispSB = ["so_no", "status", "pos", "principal", "total_cbm", "total_teu" ,"quantity_tolerance","cargo_ready_date_tolerance","cargo_ready_date" ,"shipment_date", "type", "mode", "loading_port", "discharging_port", "principal_contact_name"];
	displaySB = ["so_no", "status", "pos", "principal", "total_cbm", "total_teu" ,"quantity_tolerance","cargo_ready_date_tolerance","cargo_ready_date" ,"shipment_date", "type", "mode", "loading_port", "discharging_port", "principal_contact_name"];
  currentPage: number = 0;
  prevPage: number;
  spliceIndex = 0;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('matTable', { static: false }) set table(matTable: MatTable<any>) {
    if (matTable) {
      this.ngZone.onMicrotaskEmpty
        .pipe(take(3))
        .subscribe(() => matTable.updateStickyColumnStyles())
    }
  }
  
  constructor(
    private reusable: ReusableComponent,
		private authService: AuthenticationService,
		private formBuilder: FormBuilder,
		private router: Router,
		public dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.reusable.headHt.next(0);
		this.reusable.titleHeader.next("Shipments");
    this.reusable.curRoute.next('home');
    this.toggleShipment = 'table';
		this.reusable.screenChange.subscribe(screen => {
      if (screen.height < 600) {
			  this.height = screen.height
			} else {
			  this.height = screen.height-1;
			}
			if (screen.width < 900){
				this.isMobileView = true;
			} else {
				this.isMobileView = false;
			}
			this.width = screen.width - 80;
      this.shipmentTableHeight = this.height - 160;
    });
		this.userDetails = ReusableComponent.usr;
    !this.underProgress ? this.getShipmentBooking() : '';
  }

  toggleNavigate(nav) {
		this.toggleShipment = nav;
	}

  public getSantizeUrl(url : string) {
		return this.sanitizer.bypassSecurityTrustUrl(url);
	}

  applySOFilter(event) {
		const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
		this.shipmentBookingColl.filter = filterValue.trim().toLowerCase();
		if (filterValue == '') {
			this.shipmentBookingColl.filteredData = this.shipmentBookingColl.data;
		}
		if (event.key == 'Escape') {
			(event.target as HTMLInputElement).value = '';
			this.shipmentBookingColl.filteredData = this.shipmentBookingColl.data;
		}
	}

  changePage(event) {
    this.currentPage = event.pageIndex;
    this.prevPage = event.previousPageIndex;
    // this.shipmentBookingColl.filteredData = this.shipmentBookingColl.data.splice(this.spliceIndex, this.pageSize);
    // this.spliceIndex += this.pageSize;
  }

  async openShipmentOrder(row){
    sessionStorage.setItem('so_det', this.reusable.encrypt(JSON.stringify(row)));
    this.router.navigate(['/nav/shipment_booking/view']);
  }
  
  async getShipmentBooking(){
    this.isLoading = true;
		let result = await this.authService.getShipmentBooking();
		if (result.success) {
			if(result.rowCount > 0) {
        this.pageSize = Math.round( this.shipmentTableHeight / 60);
        this.paginator._changePageSize(this.pageSize);
				this.shipmentBookingColl = new MatTableDataSource(result.result);
        this.contentLength = this.shipmentBookingColl.data.length;
        this.shipmentBookingColl.paginator = this.paginator;
        const unique_principal = [...new Set(this.shipmentBookingColl.data.map(ship => ship.principal))];
        const unique_logistic_provider = [...new Set(this.shipmentBookingColl.data.map(ship => ship.logistics_provider))];
        let data = unique_logistic_provider.concat(unique_principal);
        data.map((com)=> {
          this.getCompanyLogoPath(com,`company_logo_${com}`);
        });
			} 
			this.isLoading = false;
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
  }

  async openCustomView() {
    console.log('disp po', this.dispSB);
    let dialogRef = this.dialog.open(CustomViewDialog, {
      height: '100vh',
      width: '400px',
      position: { right: '0px' },
      panelClass: 'dialogclass',
      data: { disp_sb : this.dispSB , width: 400 }
    });
    dialogRef.afterClosed().subscribe(result => {
			if (result.success) {
        this.displaySB = result.disp_sb;
			}
		});
  }

  async getCompanyLogoPath(company_id: number, keyname: string){
    let param = {
      company_id: company_id
    }
    let result = await this.authService.getCompanyLogoPaths({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if(result.success) {
      if(result.rowCount > 0) {
        this.getCompanyLogo(result.result[0].company_logo_path, keyname);
      }
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }
  
  async getCompanyLogo(path:number, keyname: string) {
    let img1Path = { filePath: path };
		this.authService.getCompanyLogo(img1Path).subscribe(async img => {
			this.createImageFromBlob(img, keyname);
		});
  }

	createImageFromBlob(image: Blob, keyname: string) {
		let reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = (_event) => {
      this.shipmentBookingColl.data.map((d)=>{
        d[keyname] = reader.result;
      })
		}
	}
}

@Component({
  selector: 'app-shipment-booking-view',
  templateUrl: './shipment-booking-view.component.html',
  styleUrls: ['./shipment-booking.component.css']
})
export class ShipmentBookingViewComponent implements OnInit {
  isLoading: boolean = false;
	height: number;
	width: number;
  userDetails: any;
	isMobileView:Boolean = false;
  shipmentBookingViewColl = new MatTableDataSource([]);
  underProgress: boolean = false;
  soDetails;
  showShipmentDetails: boolean = true;
  showCarrierDetails: boolean = true;
  showProductDetails: boolean = false;
  showContainerDetails: boolean = true;
  showPODetails: boolean = true;
  showTodo: boolean = true;
  POList = new MatTableDataSource([]);
  dispPO = [];
  ContainerColl = new MatTableDataSource([]);
  allSelected: boolean = false;
  selPOs = [];
  addRemoveButton: string = 'ADD PO';
  productDetailsButton: string = 'EDIT';
	noimagePlaceholder: string = environment.noimage_placeholder;
	noimagePlaceholderTable: string = environment.noimage_placeholder_table;
  TotalTEU = new FormControl('');
  messages = {};
  selPOsProductDetails = {};
  cartonDet =[];
  cartonType = ['Rigit Cartons'];

  constructor(
    private reusable: ReusableComponent,
		private authService: AuthenticationService,
		private formBuilder: FormBuilder,
		private router: Router,
		public dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.soDetails = JSON.parse(this.reusable.decrypt(sessionStorage.getItem('so_det')));
    this.soDetails == null ? this.router.navigate(['nav/shipment_booking']) : '';
    this.reusable.headHt.next(0);
		this.reusable.titleHeader.next(`Shipments / SO ${this.soDetails.so_no}`);
    this.reusable.curRoute.next('shipment_booking');
		this.reusable.screenChange.subscribe(screen => {
      if (screen.height < 600) {
			  this.height = screen.height
			} else {
			  this.height = screen.height-60;
			}
			if (screen.width < 900){
				this.isMobileView = true;
			} else {
				this.isMobileView = false;
			}
			this.width = screen.width - 80;
    });
		this.userDetails = ReusableComponent.usr;
    if(sessionStorage.getItem('po_list')) {
      let check = JSON.parse(this.reusable.decrypt(sessionStorage.getItem('po_list')));
      if(check.length > 0) {
        let display_po = Object.keys(check[0]);
        display_po.splice(display_po.indexOf('edit'),1);
        this.dispPO = display_po;
        this.POList.data = check;
      }
    } else {
      this.getPOList();
    }
    this.soDetails["selected_containers"] != null ? this.ContainerColl = new MatTableDataSource(this.soDetails["selected_containers"]) : '';
    // PO after add po
    // this.soDetails["selected_pos"] != null ? this.POList = new MatTableDataSource(this.soDetails["selected_pos"]) : '';
    // if(this.soDetails["selected_pos"] != null) {
    //   let display_po = Object.keys(this.soDetails["selected_pos"][0]);
    //   display_po.splice(display_po.indexOf('is_selected'),1);
    //   this.dispPO = display_po;
    //   this.soDetails["selected_pos"].map((pos) => { pos.is_selected = false });
    // }
    this.getCompanyLogoPath(this.soDetails.principal,'principal_logo');
    this.getCompanyLogoPath(this.soDetails.logistics_provider,'logistics_provider_logo');
    this.TotalTEU.setValue(this.soDetails.total_teu);
  }

  checkSelected() {
    if (this.POList.filteredData == null) {
      return false;
    }
    return this.POList.filteredData.filter(t => t.is_selected).length > 0 && !this.allSelected;
  }

  public getSantizeUrl(url : string) {
		return this.sanitizer.bypassSecurityTrustUrl(url);
	}

  setAll(is_selected: boolean) {
    this.allSelected = is_selected;
    if (this.POList.filteredData == null) {
      return;
    }
    this.POList.filteredData.forEach(t => (t.is_selected = is_selected));
  }
  
  addRemovePO(check, selpo) {
    selpo.is_selected = check;
    selpo.is_selected ? this.selPOs.push(selpo) : this.removePO(selpo);
    this.allSelected = this.POList.filteredData != null && this.POList.filteredData.every(t => t.is_selected);
    this.selPOs.length > 0 ? this.addRemoveButton = 'REMOVE PO' : this.addRemoveButton = 'ADD PO';
  }

  removePO(selpo) {
    let idx = this.selPOs.indexOf(selpo);
    this.selPOs.splice(idx, 1);
  }

  async editSelectedPO(selpo) {
    selpo['edit'] = true;
  }

  async saveSelectedPO(selpo) {
    selpo['edit'] = false;
    sessionStorage.setItem('po_list', this.reusable.encrypt(JSON.stringify(this.POList.data)));
  }

  async selPOforCartons(selpo) {
    this.showProductDetails = true;
    selpo['view_carton'] = true;
    this.selPOsProductDetails = selpo;
    console.log('selPOforCartons selpo ->', this.selPOsProductDetails);
    this.cartonDet = selpo.carton_product_details;
    // this.cartonDet = [
    //   {
    //     type: 'Number of Cartons',
    //     value: 12,
    //   },
    //   {
    //     type: 'Carton Type',
    //     value: 12,
    //   },
    //   {
    //     type: 'Carton Length',
    //     value: 12,
    //   },
    //   {
    //     type: 'Carton Depth',
    //     value: 12,
    //   },
    //   {
    //     type: 'Carton Height',
    //     value: 12,
    //   },
    //   {
    //     type: 'Piece per Inner',
    //     value: 12,
    //   },
    //   {
    //     type: 'Inner per Outer',
    //     value: 12,
    //   },
    //   {
    //     type: 'Inner Carton EAN',
    //     value: 12,
    //   },
    //   {
    //     type: 'Outer Carton EAN',
    //     value: 12,
    //   }
    // ]
  }
  
  async getPOList() {
    let param = {
      so_no : this.soDetails.so_no,
    }
    let result = await this.authService.getPOListforAddPOs({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if(result.success) {
      this.dispPO = Object.keys(result.result[0]);
      console.log('disp po', result.result);
      this.POList = new MatTableDataSource(result.result);
      this.POList.data.map((po)=> {
        po['view_carton'] = false;
        po['carton_product_details'] = [
          {
            type: 'Number of Cartons',
            value: 12,
            edit_type: 'number',
          },
          {
            type: 'Carton Type',
            value: 'Rigit Cartons',
            edit_type: 'select',
          },
          {
            type: 'Carton Length',
            value: 12,
            edit_type: 'number',
            unit: 'Inch'
          },
          {
            type: 'Carton Depth',
            value: 12,
            edit_type: 'number',
            unit: 'Inch'
          },
          {
            type: 'Carton Height',
            value: 12,
            edit_type: 'number',
            unit: 'Inch'
          },
          {
            type: 'Piece per Inner',
            value: 'None',
            edit_type: 'text'
          },
          {
            type: 'Inner per Outer',
            value: 'None',
            edit_type: 'text'
          },
          {
            type: 'Inner Carton EAN',
            value: 'None',
            edit_type: 'text'
          },
          {
            type: 'Outer Carton EAN',
            value: 'None',
            edit_type: 'text'
          }
        ]
      })
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  async getContainerList() {
    
    let data = [
      {
        container_type: '20’ Container',
        min_cbm: 100,
        max_weight: 1000,
        container_count: 1,
      },
      {
        container_type: '40’ NOR Container',
        min_cbm: 200,
        max_weight: 2345,
        container_count: 1,
      },
      {
        container_type: '40’ Container',
        min_cbm: 300,
        max_weight: 2000,
        container_count: 1,
      }
    ]
    this.ContainerColl = new MatTableDataSource(data);
  }

  async getCompanyLogoPath(company_id: number, keyname: string){
    let param = {
      company_id: company_id
    }
    let result = await this.authService.getCompanyLogoPaths({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if(result.success) {
      if(result.rowCount > 0) {
        this.getCompanyLogo(result.result[0].company_logo_path, keyname);
      }
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  validateNumberOnly(event) {
    let regex = new RegExp(/^-?\d*\.?\d*$/);
    let regPass = regex.test(event.target.value)
    regPass ? this.TotalTEU.setValue(event.target.value) : event.target.value = null;
  }
  
  async updateTEUValue(event) {
    console.log('event',event)
    let param = {
      total_teu: this.TotalTEU.value,
      so_no: this.soDetails.so_no
    }
    console.log('oasa',param)
    let result = await this.authService.updateTEUValue({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if(result.success) {
      this.messages['TotalTEU'] = true;
      setTimeout(() => {
        this.messages['TotalTEU'] = false ;
      }, 1000);
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  async saveEditProductDetails() {
    if(this.productDetailsButton == 'EDIT') {
      this.cartonDet.map((car) => {
        car['edit'] = true;
      });
    } else {
      this.cartonDet.map((car) => {
        car['edit'] = false;
      })
    }
    this.productDetailsButton == 'EDIT' ? this.productDetailsButton = 'SAVE' : this.productDetailsButton = 'EDIT';
    console.log('cartonDet', this.cartonDet)
  }
  
  async getCompanyLogo(path:number, keyname: string) {
    let data;
    let img1Path = { filePath: path };
		this.authService.getCompanyLogo(img1Path).subscribe(async img => {
			this.createImageFromBlob(img, keyname);
		});
    return data;
  }

	createImageFromBlob(image: Blob, keyname: string) {
		let reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = (_event) => {
      this.soDetails[keyname] =  reader.result;
		}
    console.log('dsda',this.soDetails)
	}
  
  async editContainerDetails() {
    this.router.navigate(['/nav/shipment_booking/view/container_selection'])
  }

  async openAddPO() {
    this.addRemoveButton == 'ADD PO' ? this.router.navigate(['/nav/shipment_booking/view/add_po']) : '';
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('po_list');
  }
}

@Component({
  selector: 'app-shipment-booking-edit-container',
  templateUrl: './shipment-booking-edit-container.component.html',
  styleUrls: ['./shipment-booking.component.css']
})
export class ShipmentBookingEditContainer implements OnInit {
  isLoading: boolean = false;
	height: number;
	width: number;
  userDetails: any;
	isMobileView:Boolean = false;
  underProgress: boolean = false;
  soDetails;
  ContainerColl = new MatTableDataSource([]);
  selContainer = [];
  
  constructor(
    private reusable: ReusableComponent,
		private authService: AuthenticationService,
		private formBuilder: FormBuilder,
		private router: Router,
		public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.soDetails = JSON.parse(this.reusable.decrypt(sessionStorage.getItem('so_det')));
    this.soDetails == null ? this.router.navigate(['nav/shipment_booking']) : '';
    this.reusable.headHt.next(0);
		this.reusable.titleHeader.next(`Shipments / SO ${this.soDetails.so_no} / Container Selection`);
    this.reusable.curRoute.next('shipment_booking/view');
		this.reusable.screenChange.subscribe(screen => {
      if (screen.height < 600) {
			  this.height = screen.height
			} else {
			  this.height = screen.height-60;
			}
			if (screen.width < 900){
				this.isMobileView = true;
			} else {
				this.isMobileView = false;
			}
			this.width = screen.width - 80;
    });
		this.userDetails = ReusableComponent.usr;
    this.getContainerList();
  }

  async getContainerList() {
    let data = [
      {
        container_type_id: 1,
        container_type: '20’ Container',
        container_size_first: '20’',
        min_cbm: 100,
        max_weight: 1000,
        is_added: false,
        container_count: 1,
      },
      {
        container_type_id: 2,
        container_type: '40’ NOR Container',
        container_size_first: '40’ NOR',
        min_cbm: 200,
        max_weight: 2345,
        is_added: false,
        container_count: 1,
      },
      {
        container_type_id: 3,
        container_type: '40’ Container',
        container_size_first: '40’',
        min_cbm: 300,
        max_weight: 2000,
        is_added: false,
        container_count: 1,
      }
    ]
    if(this.soDetails['selected_containers'] != null) {
      this.soDetails['selected_containers'].map((scon) => {
        let value = data.filter(val => val.container_type_id == scon.container_type_id);
        value[0].container_count = scon.container_count;
        value[0].is_added = true;
        this.selContainer.push(scon);
        console.log('val',value)
      });
      this.ContainerColl = new MatTableDataSource(data);
    } else {
      this.ContainerColl = new MatTableDataSource(data);
    }
  }

  addContainer(container) {
    container.is_added = true;
    // this.selContainer.push({ container_type_id : container.container_type_id, container_count: container.container_count});
    this.selContainer.push(container);
    console.log('selContainer',this.selContainer)
  }

  exitEditContainer() {
    this.router.navigate(['/nav/shipment_booking/view']);
  }

  saveEditContainer() {
    this.soDetails["selected_containers"] = this.selContainer;
    console.log('so',this.soDetails);
    sessionStorage.setItem('so_det', this.reusable.encrypt(JSON.stringify(this.soDetails)));
    this.router.navigate(['/nav/shipment_booking/view']);
  }
  
  async incdecContainerCount(container,count) {
    container.container_count > 0 ? container.container_count += (count == '+' ? 1 : -1) : '';
    container.container_count == 0 ? container.is_added = false :'';
    console.log('selContainer',this.selContainer)
  }
}

@Component({
  selector: 'app-shipment-booking-add-po',
  templateUrl: './shipment-booking-add-po.component.html',
  styleUrls: ['./shipment-booking.component.css']
})
export class ShipmentBookingAddPO implements OnInit {
  isLoading: boolean = false;
	height: number;
	width: number;
  userDetails: any;
	isMobileView:Boolean = false;
  underProgress: boolean = false;
  soDetails;
  POList = new MatTableDataSource([]);
  dispPO = [];
  selPOs = [];
  allSelected: boolean = false;

  constructor(
    private reusable: ReusableComponent,
		private authService: AuthenticationService,
		private formBuilder: FormBuilder,
		private router: Router,
		public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.soDetails = JSON.parse(this.reusable.decrypt(sessionStorage.getItem('so_det')));
    this.soDetails == null ? this.router.navigate(['nav/shipment_booking']) : '';
    this.reusable.headHt.next(0);
		this.reusable.titleHeader.next(`Shipments / SO ${this.soDetails.so_no} / Add POs`);
    this.reusable.curRoute.next('shipment_booking/view');
		this.reusable.screenChange.subscribe(screen => {
      if (screen.height < 600) {
			  this.height = screen.height
			} else {
			  this.height = screen.height-60;
			}
			if (screen.width < 900){
				this.isMobileView = true;
			} else {
				this.isMobileView = false;
			}
			this.width = screen.width - 80;
    });
		this.userDetails = ReusableComponent.usr;
    this.getPOList();
  }

  checkSelected() {
    if (this.POList.filteredData == null) {
      return false;
    }
    return this.POList.filteredData.filter(t => t.is_selected).length > 0 && !this.allSelected;
  }

  setAll(is_selected: boolean) {
    this.allSelected = is_selected;
    if (this.POList.filteredData == null) {
      return;
    }
    this.POList.filteredData.forEach(t => (t.is_selected = is_selected));
  }
  
  async getPOList() {
    let param = {
      so_no : this.soDetails.so_no,
    }
    let result = await this.authService.getPOListforAddPOs({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if(result.success) {
      this.dispPO = Object.keys(result.result[0]);
      console.log('disp po', result.result)
      this.POList = new MatTableDataSource(result.result);
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  addRemovePO(check, selpo) {
    selpo.is_selected = check;
    selpo.is_selected ? this.selPOs.push(selpo) : this.removePO(selpo);
    this.allSelected = this.POList.filteredData != null && this.POList.filteredData.every(t => t.is_selected);
    console.log('selPOs',this.selPOs)
  }

  removePO(selpo) {
    let idx = this.selPOs.indexOf(selpo);
    this.selPOs.splice(idx, 1);
    console.log('selPOs', this.selPOs)
  }
  
  exitAddPO() {
    this.router.navigate(['/nav/shipment_booking/view']);
  }

  saveAddPO() {
    this.soDetails["selected_pos"] = this.selPOs;
    sessionStorage.setItem('so_det', this.reusable.encrypt(JSON.stringify(this.soDetails)));
    this.router.navigate(['/nav/shipment_booking/view']);
  }
}

/* Custom View */
@Component({
	selector: 'custom-view-dialog',
	templateUrl: 'custom-view-dialog.html',
	styleUrls: ['./shipment-booking.component.css']
})

export class CustomViewDialog implements OnInit {
  isLoading: boolean = false;
	height: number;
	width: number;
  userDetails: any;
  title: any;
  currentDialogTab: string = 'Columns';
  dispSB = [];
  displayColumns = [];
  selDisplayColumns = [];
  savedViews = [];
  isSaveAsNewView: boolean = true;
  isDefault: boolean = true;
  isDefaultDisabled: boolean = false;
  openSaveAsNewView: boolean = false;
  applyButtonName: string = 'APPLY';
  ViewName = new FormControl('');
  isEditMode: boolean = false;
  editCustomViewDetails: any;
  saveViewTitle = 'SAVE NEW VIEW';
  appliedDispSB = [];
  
	constructor(
		public dialogRef: MatDialogRef<CustomViewDialog>,
		@Inject(MAT_DIALOG_DATA) public data: CustomViewDialog,
		private reusable: ReusableComponent,
		private authService: AuthenticationService,
		private formBuilder: FormBuilder,
		public dialog: MatDialog,
	) { }

	ngOnInit() {
    this.title = 'CUSTOM VIEW'
    this.reusable.screenChange.subscribe(res => {
			this.height = res['height'] - 64;
		});
    this.width = this.data['width'];
    this.dispSB = this.data['disp_sb'];
    this.createDisplayColumns();
    this.getCustomViews();
    this.changeTab('Columns')
	}

  createDisplayColumns() {
    this.displayColumns = [];
    this.dispSB.map((disp, idx) => {
      this.displayColumns.push({ column_name_id: idx, column_name: disp, is_selected: false, is_sticky: false })
    });
    console.log('displayColumns',this.displayColumns);
    if(this.isEditMode) {
      this.selDisplayColumns = [];
      this.editCustomViewDetails['display_columns'].filter(val => this.selDisplayColumns.push(val.column_name_id));
      console.log('disp col', this.editCustomViewDetails['display_columns'])
      console.log('selDisplayColumns', this.selDisplayColumns);
      this.displayColumns.map((disp) => {
        this.selDisplayColumns.includes(disp.column_name_id) ? disp['is_selected'] = true : disp['is_selected'] = false;
      });
    }
  }

  async getCustomViews() {
    let param = {}
    let result = await this.authService.getCustomViews({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if (result.success) {
      console.log('result.result', result.result);
      result.result.map((sv, idx) => {
        if(sv.is_default ){
          sv.is_selected = true;
          this.editCustomViewDetails = this.savedViews[idx];
        } else {
          sv.is_selected = false;
        }
      });
      this.savedViews = result.result;
      
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
    }
  }

	async addRemoveColumns(column: any, check: boolean) {
    console.log('check',check)
    column.is_selected = check;
    check ? this.selDisplayColumns.push(column.column_name_id) : this.selDisplayColumns.splice(this.selDisplayColumns.indexOf(column.column_name_id), 1);
    console.log('column',column)
  }

  async addRemoveSticky(column: any, sticky: boolean) {
    console.log('id',column.column_name_id);
    column.is_sticky = sticky;
    // sticky ? this.selDisplayColumns.push(column.column_name_id) : this.selDisplayColumns.splice(this.selDisplayColumns.indexOf(column.column_name_id), 1);
    console.log('addRemoveSticky', column);
    console.log('selDisplayColumns', this.selDisplayColumns);
  }

	onClose(status: boolean) {
		this.dialogRef.close(status);
	}

  exitCustomView() {
    if(this.openSaveAsNewView) {
      this.openSaveAsNewView = !this.openSaveAsNewView;
    } else if(this.isEditMode) {
      this.isEditMode = !this.isEditMode;
      this.selDisplayColumns = [];
      this.createDisplayColumns();
      this.isSaveAsNewView = true;
    } else {
      this.onClose(false);
    }
  }

  changeTab(tab: string) {
    this.currentDialogTab = tab;
    tab == 'Columns' ? this.createDisplayColumns() : this.getCustomViews();
    this.openSaveAsNewView = false;
  }

  onViewChange(event) {
    let sbcv_id = event.value.sbcv_id;
    this.savedViews.map((sv, idx) => {
      if(sv.sbcv_id == sbcv_id) {
        sv.is_selected = true;
        this.editCustomViewDetails = this.savedViews[idx];
      } else {
        sv.is_selected = false;
      }
    });
  }
  
  async saveCustomView() {
    this.appliedDispSB = []
    let selectedColumnDetails = [];
    this.displayColumns.map((disp) => {
      this.selDisplayColumns.includes(disp.column_name_id) ?  selectedColumnDetails.push(disp) : '';
      this.selDisplayColumns.includes(disp.column_name_id) ?  this.appliedDispSB.push(disp.column_name) : '';
    });
    if(this.isSaveAsNewView && !this.openSaveAsNewView) {
      this.openSaveAsNewView = true;
      let defaultCount = this.savedViews.filter(saved => saved.is_default);
      if(defaultCount.length > 0) {
        this.isDefault = false;
        this.isDefaultDisabled = true;
      } else {
        this.isDefault= true;
        this.isDefaultDisabled = false;
      }
    } else if((this.isSaveAsNewView && this.openSaveAsNewView) || (this.isEditMode && this.openSaveAsNewView)) {
      let param = {
        sbcv_id: this.editCustomViewDetails != null ? this.editCustomViewDetails['sbcv_id'] : undefined,
        view_name: this.ViewName.value,
        is_default: this.isDefault,
        display_columns: JSON.stringify(selectedColumnDetails),
      }
      let result = await this.authService.insUpdCustomView({ param: this.reusable.encrypt(JSON.stringify(param)) });
      if (result.success) {
        this.reusable.openAlertMsg(result.message ,"info");
        this.changeTab('Saved Views');
        this.isEditMode = false;
      } else {
        this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
      }
    } else if(this.isEditMode && !this.isSaveAsNewView) {
      this.saveViewTitle = `EDIT VIEW (${this.editCustomViewDetails['view_name']}) `
      this.openSaveAsNewView = true;
      this.editCustomViewDetails['is_default'] ? this.isDefault = true : this.isDefault = false;
      this.ViewName.setValue(this.editCustomViewDetails['view_name']);
    } else {
      this.dispSB = this.appliedDispSB;
      this.dialogRef.close({success: true, disp_sb: this.dispSB});
    }
  }

  applyView() {
    this.appliedDispSB = []
    this.selDisplayColumns = [];
    this.editCustomViewDetails['display_columns'].filter(val => this.selDisplayColumns.push(val.column_name_id));
    this.displayColumns.map((disp) => {
      this.selDisplayColumns.includes(disp.column_name_id) ? this.appliedDispSB.push(disp.column_name) : '';
    });
    this.dispSB = this.appliedDispSB;
    this.dialogRef.close({success: true, disp_sb: this.dispSB});
  }

  async editCustomView(idx) {
    this.isEditMode = true;
    this.isSaveAsNewView = false;
    console.log('first', this.savedViews[idx]);
    this.editCustomViewDetails = this.savedViews[idx];
    // this.editCustomViewDetails = this.savedViews.filter(val => val.sbcv_id = view.sbcv_id);
    this.changeTab('Columns');
    this.title = `EDIT ${this.editCustomViewDetails['view_name']}`
    // let param = {
    //   sbcv_id: view.sbcv_id,
    //   view_name: view.view_name
    // }
    // console.log('param',param)
  }
  
  async deleteCustomView(view) {
    let param = {
      sbcv_id: view.sbcv_id,
      view_name: view.view_name
    }
    let result = await this.authService.deleteCustomView({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if (result.success) {
      this.reusable.openAlertMsg(result.message ,"info");
      this.getCustomViews();
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
    }
  }

	ngOnDestroy() {}

}
