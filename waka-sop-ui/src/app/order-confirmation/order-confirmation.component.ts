import { Component, Inject, ViewChild, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { AuthenticationService } from '../_services/index';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReusableComponent } from '../reusable/reusable.component';
import { FormGroup, Validators, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatPaginator } from '@angular/material/paginator';

const TRANSACTION_COLUMNS_SCHEMA = [
	{
		key: "transaction_date",
		type: "date",
		label: "DATE"
	},
	{
		key: "shift_batch",
		type: "text",
		label: "SHIFT / BATCH"
	},
	{
		key: "mfg_qty",
		type: "number",
		label: "MFG. QTY"
	},	
	{
		key: "viewAttachment",
		type: "viewAttachment",
		label: ""
	},	
	{
		key: "isEdit",
		type: "isEdit",
		label: ""
	},	
	{
		key: "isDelete",
		type: "isDelete",
		label: ""
	}
];

@Component({
	selector: 'order-confirmation-grid-view',
	templateUrl: './order-confirmation.component-grid-view.html',
	styleUrls: ['./order-confirmation.component.css']
  })

  export class OrderConfirmationGridViewComponent implements OnInit {

	isLoading: boolean = false;
	height: number;
	width: number;
	SidePanelWidth: number = 420;
	userDetails: any;
	poColl = new MatTableDataSource([]);
	summaryToggle: string = 'table';
	isInviteTab: boolean = false;
	selectedTabIndex = 0;
	form: FormGroup;
	orderConfirmationColl:any;//new MatTableDataSource([]);
	dispPO = ["po_no", "company_name", "cargo_ready_date", "total_quantity", "actual_quantity", "pending_quantity"];
	// dispTransaction = ["date", "shift_batch", "mfg_qty", "file"];
	dispTransaction: string[] = TRANSACTION_COLUMNS_SCHEMA.map((col) => col.key);;
	tabTitle: string = "Active";
	purchaseOrderMonthWise = new MatTableDataSource([]);
	purchaseOrderCompanyWise  = new MatTableDataSource([]);
	transactionsColl = new MatTableDataSource([]);
	dummy_transactionsColl:any;
	dummy_purchaseOrderCompanyWise:any;
	transactionsColumnsSchema: any = TRANSACTION_COLUMNS_SCHEMA;
	isMobileView:Boolean;
	isMobileDetailedView:Boolean= false;
	mobileTransactions:Boolean = true;
	product: string = '';
	productDescription: string = '';
	supplierRefId: number;
	isPOAssigned:boolean = false;
	
	@ViewChild('TablePaginator', { static: true }) tablePaginator: MatPaginator;
	@ViewChild('TableSort', { static: true }) tableSort: MatSort;

	sample1 = [{"id":1},{"id":2}, {"id":3},{"id":4},{"id":5},{"id":6},{"id":7},{"id":8},{"id":9},{"id":10},{"id":11},{"id":12},{"id":13},{"id":14},{"id":15},{"id":16},{"id":17},{"id":18}];

	totalOrderedQty: number;
	totalPendingQty: number;
	attachedFile: any;
	fileName: any;
	previewUrl;
	attachType: string;
	isEditTransaction = false;
	transactionQtyEditMode: Boolean = false;

  constructor(
   	private reusable: ReusableComponent,
		private authService: AuthenticationService,
		private formBuilder: FormBuilder,
		private router: Router,
		public dialog: MatDialog,
	) { }

    ngOnInit(): void {
		this.reusable.headHt.next(0);
		this.reusable.titleHeader.next("Orders");
		this.reusable.curRoute.next('home');
		this.reusable.screenChange.subscribe(screen => {
			screen.height = screen.height - 0.1;
			if (screen.height < 600) {
			  this.height = screen.height
			} else {
			  this.height = screen.height-60;
			}
			if (screen.width < 900){
				this.isMobileView = true;
			  }
			  else {
				this.isMobileView = false;
			  }
			this.width = screen.width - 140;
		  });
		this.userDetails = ReusableComponent.usr;


		this.getPurchaseOrders();
		this.createForm();
    }

	createForm() {
		this.form = this.formBuilder.group({
			Date: ['', Validators.compose([
				Validators.required
			])],
			ShiftBatch: ['', Validators.compose([
				Validators.minLength(3),
				Validators.maxLength(50),
				this.noWhitespaceValidator,
				this.notOnlySpicalChar,
			])],
			Quantity: ['', Validators.compose([
				Validators.minLength(1),
				Validators.maxLength(50),
				this.noWhitespaceValidator,
				this.isValid,
			])]
	});
 }

	sortData(sort){
		console.log(sort)
		const data = this.dummy_purchaseOrderCompanyWise.slice();
    if (!sort.active || sort.direction === '') {
      this.purchaseOrderCompanyWise.data = data;
      return;
    }

    this.purchaseOrderCompanyWise.data = data.sort((a, b) => {

      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'po_no':
          return this.compare(a.order_number, b.order_number, isAsc);
        case 'company_name':
          return this.compare(a.company_name, b.company_name, isAsc);
        case 'cargo_ready_date':
          return this.compare(a.ship_date, b.ship_date, isAsc);
        case 'total_quantity':
          return this.compare(a.item_qty, b.item_qty, isAsc);
        case 'actual_quantity':
          return this.compare(a.actual_quantity, b.actual_quantity, isAsc);
        case 'pending_quantity':
					let ele_1 = a.item_qty - a.actual_quantity > 0 ? a.item_qty - a.actual_quantity : 0
					let ele_2 = b.item_qty - b.actual_quantity > 0 ? b.item_qty - b.actual_quantity : 0
          return this.compare(ele_1, ele_2, isAsc);
        default:
          return 0;
      }
    });

 	}

	compare(a: number | string, b: number | string, isAsc: boolean) {
		return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
	}

	noWhitespaceValidator(control: FormControl){
		const isWhitespace = (control.value || '').toString().trim().length === 0;
		const isValid = !isWhitespace;
		return isValid ? null : { 'whitespace': true };
	}

	
	notOnlySpicalChar(control: FormControl){
		let regex = /[A-Za-z0-9]/;
		const string = (control.value || '').toString().trim();
		return regex.test(string) ? null : { 'isOnlySplChar': true };
	}

	isValid = (control: FormControl) => {
		let limit = this.getTotalPendingQty() > 0 ? this.getTotalPendingQty() : 0
		const isValid = control.value <= limit && control.value > 0;
		return isValid ? null : { 'isValidInput': true };
	}

	backToProd(){
		this.isMobileDetailedView =  false; 
		this.transactionsColl=new MatTableDataSource([])
		this.form.reset();
	}

	btnDisabled=false
	isBtnDisabled(ele: any): boolean {
		if(ele['transaction_date'] != null && ele['shift_batch']?.length >0 && ele['mfg_qty'] >= 0){
			return false
		} else {
			return true;
		}
 	}
	
	applyOrderConfirmationFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.purchaseOrderMonthWise.filter = filterValue.trim().toLowerCase();
	}

	applyPOFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
		console.log("filter Value",filterValue);
		
		this.poColl.filter = filterValue.trim().toLowerCase();
        //console.log(this.purchaseOrderMonthWise)
		if(filterValue == ''){
			this.getPurchaseOrders();
		}else{
			const filtered=this.purchaseOrderMonthWise.filteredData.filter((e: any)=>{
			 return (e.product.toLowerCase().includes(filterValue)) || (e.product_description.toLowerCase().includes(filterValue));
				})
		    this.purchaseOrderMonthWise.filteredData=filtered;
	      }
	}

	tabChanged(tabChangeEvent: MatTabChangeEvent): void {
		if (tabChangeEvent.index == 0) {
			this.tabTitle = "Active"
		} else {
			this.tabTitle = "Cancelled"
		}
	}

	toggleNavigate(nav) {
		if(nav == 'cards') {
			this.router.navigate(['/nav/orderpo/details']);
		} else {
			this.router.navigate(['/nav/orderpo']);
		}
	}

	getErrorMessage(control, controlName) {
		let msg = '';
		msg += control.hasError('required') ? 'Field Cannot be empty. ' : '';
		if (controlName == 'ShiftBatch') { msg += (control.errors.minlength || control.errors.maxlength) ? 'Must be between 3 & 50 length. ' : '' }
		return msg;
	}

	async getPurchaseOrders() {
		// this.isLoading = true;
		// let result = await this.authService.getPurchaseOrders();
		// if (result.success) {
		// 	if(result.is_po_assigned) {
		// 		this.purchaseOrderMonthWise = new MatTableDataSource(result.result);
		// 		this.isPOAssigned = true;
		// 	} else {
		// 		this.purchaseOrderMonthWise = new MatTableDataSource([]);
		// 		this.isPOAssigned = false;
		// 	}
		// 	this.isLoading = false;
		// } else {
		// 	this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		// }


		this.isLoading = false;
		this.isPOAssigned = true;
		let dummyResult = [
			{"product": "140804200-001", "date": "DEC 2021", "product_description": "M10 Push Fit Tails (Pair)", "total_quantity": "203000"},
			{"product": "1625A0A", "date": "DEC 2021", "product_description": "M10 Push Fit Tails (Pair)", "total_quantity": "192000"},
			{"product": "INF6450606", "date": "DEC 2021", "product_description": "M10 Push Fit Tails (Pair)", "total_quantity": "23422"},
			{"product": "INF-AGU-001", "date": "JAN 2022", "product_description": "M10 Push Fit Tails (Pair)", "total_quantity": "193000"},
			{"product": "K304B", "date": "FEB 2022", "product_description": "M10 Push Fit Tails (Pair)", "total_quantity": "124400"},
			{"product": "QB-104", "date": "MAR 2022", "product_description": "M10 Push Fit Tails (Pair)", "total_quantity": "197800"},
			{"product": "131446088", "date": "MAR 2022", "product_description": "ASUS LAPTOP", "total_quantity": "193000"},
			{"product": "131184989", "date": "JUL 2022", "product_description": "SKU:JS duck feather 10.5 tog duvet superking", "total_quantity": "124000"}
		]
		this.purchaseOrderMonthWise = new MatTableDataSource(dummyResult);
	}

	async viewDetailedOrders(product:any) {
		console.log("vuew detailss",product);
		sessionStorage.setItem('oc_det', this.reusable.encrypt(JSON.stringify(product)));
		this.router.navigate(['/nav/orderpo/view']);
		// this.isLoading = true;
		// let param = {
		// 	product: product.product,
		// 	product_description: product.product_description,
		// 	month: product.date.split(' ')[0],
		// 	year: product.date.split(' ')[1],
		// }
		// let result = await this.authService.getPurchaseOrdersCompanywise(param);
		// console.log("view detaisl result", result);
		// this.isLoading = false;
		// if (result.success) {
		// 	this.product = product.product;
		// 	this.productDescription =product.product_description;
		// 	this.supplierRefId = product.supplier_ref_id;
		// 	this.totalOrderedQty = product.item_qty;
		// 	this.getOrderTransactions();
		// 	this.isMobileDetailedView = true;
		// 	this.dummy_purchaseOrderCompanyWise = JSON.parse(JSON.stringify(result.result));
		// 	this.purchaseOrderCompanyWise = new MatTableDataSource(result.result);
		// 	console.log("result product ",this.purchaseOrderCompanyWise);
		// 	this.openConfirmation(result.result,product);
		// } else {
		// 	this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		// }
		// this.reusable.curRoute.next("/nav/orderpo");
		// this.isMobileDetailedView = true;
	}

	openConfirmation(data,product){
		sessionStorage.setItem('order', this.reusable.encrypt(JSON.stringify(data)));
		this.router.navigate(['/nav/orderpo/view']);
	}


  async getMyOrders() {
		this.orderConfirmationColl = [{po_no:'PO1234', status:'Confirmed', shipment_date:'22 Mar 2021',cargo_ready_date:'22 Mar 2021',loading_port:'Visakhapatnam', lp_code:'IN', discharging_port:'London', dp_code:'GB', type:'FCL',mode:'ship',sc:'SC1234',supplier_name:'Jithin',supplier_number:'+91 7093753263', logistics_provider:''},{po_no:'PO1235', status:'Processing',shipment_date:'22 Mar 2021',cargo_ready_date:'22 Mar 2021', loading_port:'Brisbane',lp_code:'AU', discharging_port:'Beijing', dp_code:'CN', type:'LCL',mode:'flight',sc:'SC1235',supplier_name:'Balaji',supplier_number:'+91 7093753263', logistics_provider:''}];
		this.orderConfirmationColl.paginator = this.tablePaginator;
		this.tablePaginator._intl.itemsPerPageLabel = "Rows per page";
	}

  	addView() {
		const dialogRef = this.dialog.open(CustomViewComponent, {
			width: '28%',
			height: '100%',
			data: { view: this.dispPO },
			position: { right: '0px' },
			panelClass: 'dialogclass'
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
        		this.dispPO = result.filter(i => i.is_selected == true).map(i => i.name);
				this.getMyOrders();
			}
		});
	}

	async addTransaction() {
		let date = this.form.get('Date').value;
		let shiftBatch = this.form.get('ShiftBatch').value;
		let quantity = this.form.get('Quantity').value;
		// let duplicate = this.transactionsColl.data.filter(tran => tran.shift_batch.toLowerCase() == shiftBatch.toLowerCase() && tran.mfg_qty == quantity);
		// if(duplicate.length > 0){
		// 	this.reusable.openAlertMsg("Can't add dupicate Shift / batch", "error");
		// 	return;
		// }
		const param = {
			date: date, 
			shift_batch: shiftBatch, 
			mq: quantity,
			file_name: (this.fileName == undefined) ? null : this.fileName,
			file: (this.fileName == undefined) ? null : this.previewUrl,
			file_type: this.attachType,
			product: this.product,
			product_description: this.productDescription,
			supplier_ref_id: this.supplierRefId
		}
		let result = await this.authService.addOrdersTransaction(param);
		if (result.success) {
			this.form.get('Date').reset();
			this.form.get('ShiftBatch').reset();
			this.form.get('Quantity').reset();
			this.fileName = undefined;
			this.previewUrl = undefined;
			this.getOrderTransactions();

		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	onTransactionEdit(ele){
		this.transactionsColl.data.map(e => e['isEdit'] = false);
		ele['isEdit'] = true;
	}

	async getOrderTransactions() {
		let param = {
			product: this.product,
			product_description: this.productDescription,
			supplier_ref_id : this.supplierRefId,
		}
		let result = await this.authService.getOrderTransactions(param);
		if (result.success) {
			this.transactionsColl = new MatTableDataSource(result.result);
			console.log('transactionsColl', this.transactionsColl.data)
			this.dummy_transactionsColl = JSON.parse(JSON.stringify(result.result));;
			if(this.transactionsColl.data.length > 0) {
				this.getActualQty();
			} else {
				this.purchaseOrderCompanyWise.data.map((po)=>{
					po.actual_quantity = 0;
				})
			}
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	closeTransactionEdit(element: any){
		element.isEdit = !element.isEdit;
		this.dummy_transactionsColl.forEach(e => {
			if(element.pot_id == e.pot_id){
				element.transaction_date = e.transaction_date
				element.shift_batch = e.shift_batch
				element.mfg_qty = e.mfg_qty
				element.attachment_file_path = e.attachment_file_path
			}
		})
	}

	getActualQty() {
		let totalmgQty = this.getCompletedOrders();
		this.purchaseOrderCompanyWise.data.map((po,idx) =>{
			if(idx < this.purchaseOrderCompanyWise.data.length - 1) {
				po.actual_quantity = 0;
				if(totalmgQty > po.item_qty) {
					po.actual_quantity +=  po.item_qty;
					totalmgQty -= po.item_qty;
				} else {
					po.actual_quantity += totalmgQty;
					totalmgQty = 0;
				}
			} else {
				po.actual_quantity = 0;
				po.actual_quantity += totalmgQty;
			}
		});
	}

	getTotalPendingQty() {
		return this.purchaseOrderCompanyWise.data.reduce((accum, element) => accum + (element.item_qty - element.actual_quantity), 0);
	}
	
	getCompletedOrders() {
		return this.transactionsColl.data.reduce((a,element) => a + element.mfg_qty, 0)
	}
	
	async saveTransactionEdit(ele:any) {
		ele.isEdit = !ele.isEdit;
		const param = {
			pot_id: ele.pot_id,
			transaction_date: ele.transaction_date, 
			shift_batch: ele.shift_batch, 
			mq: ele.mfg_qty,
			attachment_file_path: ele.attachment_file_path,
			file_name: (this.fileName == undefined) ? null : this.fileName,
			file: (this.fileName == undefined) ? null : this.previewUrl,
			file_type: this.attachType,
		}
		let result = await this.authService.updOrdersTransaction(param);
		if (result.success) {
			const objects: any[] = this.transactionsColl.data;
			for(let transCol of objects){
				if(transCol.pot_id == ele.pot_id){
					transCol.transaction_date = ele.transaction_date
					transCol.ShiftBatch = ele.shift_batch
					transCol.Quantity = ele.mfg_qty
				}
			}
			this.getOrderTransactions();
			this.getActualQty();
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async delTransaction(ele:any) {
		let conf = confirm("Are you sure to delete this Transaction?");
		if (!conf) return;
		const param = {
			pot_id: ele.pot_id,
		}
		let result = await this.authService.delTransaction(param);
		if (result.success) {
			this.getOrderTransactions();
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	openUploadAttachmentDialog(is_uploaded:boolean) {
		this.transactionsColl.data.map(e => e['isEdit'] = false);
		this.isEditTransaction = false;
		this.fileName = undefined;
		const dialogRef = this.dialog.open(UploadAttachmentDialog, {
			height: '50%',
			width: '300px',
			data: { is_uploaded: is_uploaded , preview_url: this.previewUrl, attach_type: this.attachType },
			panelClass: 'dialogclass',
		});
		dialogRef.afterClosed().subscribe(result => {
			if(result.success) {
				this.fileName = result.file_name;
				this.previewUrl = result.preview_url;
				this.attachType = result.attach_type;
			}
		});
	}

	openUploadAttachmentDialogForTransEdit(is_uploaded:boolean, element:any) {
		const dialogRef = this.dialog.open(UploadAttachmentDialog, {
			height: '50%',
			width: '300px',
			data: { is_uploaded: is_uploaded , preview_url: this.previewUrl, attach_type: this.attachType },
			panelClass: 'dialogclass',
		});
		dialogRef.afterClosed().subscribe(result => {
			if(result.success) {
				this.fileName = result.file_name;
				this.previewUrl = result.preview_url;
				this.attachType = result.attach_type;
				this.isEditTransaction = true;
				element.attachment_file_path = result.file_name;
			}
		});
	}
	
	attachFile(element) {
		var Extensions = /(\.png|\.jpg|\.jpeg|\.pdf)$/i;
		if (Extensions.exec(element.target.value) && element.target.value.split('.').length == 2) {
			this.attachedFile = <File>element.target.files[0];
			this.fileName = element.target.files[0]["name"];
			if (this.fileName.toLowerCase().includes('pdf')) {
				this.attachType = 'PDF';
			} else {
				this.attachType = 'IMAGE';
			}
			if (this.attachedFile.size) {
				let reader = new FileReader();
				reader.readAsDataURL(this.attachedFile);
				reader.onload = (event: any) => {
					this.previewUrl = event.target.result;
				}
			}
		} else {
			this.reusable.openAlertMsg("Unsupported Format", "error");
		}
	}

	editAttachedFile(element, ele) {
		var Extensions = /(\.png|\.jpg|\.jpeg|\.pdf)$/i;
		if (Extensions.exec(element.target.value) && element.target.value.split('.').length == 2) {
			this.attachedFile = <File>element.target.files[0];
			this.fileName = element.target.files[0]["name"];
			if (this.attachedFile.size) {
				let reader = new FileReader();
				reader.readAsDataURL(this.attachedFile);
				reader.onload = (event: any) => {
					this.previewUrl = event.target.result;
				}
			}
		} else {
			this.reusable.openAlertMsg("Unsupported Format", "error");
		}
	}

	async viewAttachedFile(path) {
		let Path = { filePath: path };
		this.authService.viewTransactionsAttachedFile(Path).subscribe(img => {
				this.createImageFromBlob(img);
		});
	}

	createImageFromBlob(image: Blob) {
		var fileURL: any = URL.createObjectURL(image);
		var a = document.createElement("a");
		a.href = fileURL;
		a.target = '_blank';
		a.click();
	}

}

@Component({
	selector:'order-confirmation-product-view',
	templateUrl: 'order-confirmation-product-view.html',
	styleUrls: ['./order-confirmation.component.css']
})

export class OrderConfirmationProductView implements OnInit{

	isLoading: boolean = false;
	height: number;
	width: number;
	SidePanelWidth: number = 420;
	userDetails: any;
	poColl = new MatTableDataSource([]);
	summaryToggle: string = 'table';
	isInviteTab: boolean = false;
	selectedTabIndex = 0;
	form: FormGroup;
	orderConfirmationColl:any;//new MatTableDataSource([]);
	dispPO = ["po_no", "company_name", "cargo_ready_date", "total_quantity", "actual_quantity", "pending_quantity"];
	// dispTransaction = ["date", "shift_batch", "mfg_qty", "file"];
	dispTransaction: string[] = TRANSACTION_COLUMNS_SCHEMA.map((col) => col.key);;
	tabTitle: string = "Active";
	purchaseOrderMonthWise = new MatTableDataSource([]);
	purchaseOrderCompanyWise  = new MatTableDataSource([]);
	transactionsColl = new MatTableDataSource([]);
	dummy_transactionsColl:any;
	dummy_purchaseOrderCompanyWise:any;
	transactionsColumnsSchema: any = TRANSACTION_COLUMNS_SCHEMA;
	isMobileView:Boolean;
	isMobileDetailedView:Boolean= false;
	mobileTransactions:Boolean = true;
	product: string = '';
	productDescription: string = '';
	supplierRefId: number;
	isPOAssigned:boolean = false;
	ocDetails: any;
	
	@ViewChild('TablePaginator', { static: true }) tablePaginator: MatPaginator;
	@ViewChild('TableSort', { static: true }) tableSort: MatSort;

	sample1 = [{"id":1},{"id":2}, {"id":3},{"id":4},{"id":5},{"id":6},{"id":7},{"id":8},{"id":9},{"id":10},{"id":11},{"id":12},{"id":13},{"id":14},{"id":15},{"id":16},{"id":17},{"id":18}];

	totalOrderedQty: number;
	totalPendingQty: number;
	attachedFile: any;
	fileName: any;
	previewUrl;
	attachType: string;
	isEditTransaction = false;
	transactionQtyEditMode: Boolean = false;

  constructor(
   	private reusable: ReusableComponent,
		private authService: AuthenticationService,
		private formBuilder: FormBuilder,
		private router: Router,
		public dialog: MatDialog,
	) { }

    ngOnInit(): void {
		this.ocDetails = JSON.parse(this.reusable.decrypt(sessionStorage.getItem('oc_det')));
        this.ocDetails == null ? this.router.navigate(['nav/orderpo']) : '';
		console.log("is mobile data view",this.isMobileDetailedView)
		this.reusable.headHt.next(0);
		this.reusable.titleHeader.next(`Orders / product / ${this.ocDetails.product}`);
		this.reusable.curRoute.next('orderpo');
		this.reusable.screenChange.subscribe(screen => {
			screen.height = screen.height - 0.1;
			if (screen.height < 600) {
			  this.height = screen.height
			} else {
			  this.height = screen.height-60;
			}
			if (screen.width < 900){
				this.isMobileView = true;
			  }
			  else {
				this.isMobileView = false;
			  }
			this.width = screen.width - 140;
		  });
		this.userDetails = ReusableComponent.usr;

		this.createForm();
		this.viewOrder(this.ocDetails);
    }

	async viewOrder(product:any){
		this.isLoading = true;
		let param = {
			product: product.product,
			product_description: product.product_description,
			month: product.date.split(' ')[0],
			year: product.date.split(' ')[1],
		}
		let result = await this.authService.getPurchaseOrdersCompanywise(param);
		console.log("view detaisl result", result);
		this.isLoading = false;
		if (result.success) {
			this.product = product.product;
			this.productDescription =product.product_description;
			this.supplierRefId = product.supplier_ref_id;
			this.totalOrderedQty = product.item_qty;
			this.getOrderTransactions();
			this.isMobileDetailedView = true;
			this.dummy_purchaseOrderCompanyWise = JSON.parse(JSON.stringify(result.result));
			this.purchaseOrderCompanyWise = new MatTableDataSource(result.result);
			console.log("result product ",this.purchaseOrderCompanyWise);
			//this.openConfirmation(result.result,product);
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
		//this.reusable.curRoute.next("/nav/orderpo");
		this.isMobileDetailedView = true;
	}

	
	createForm() {
		this.form = this.formBuilder.group({
			Date: ['', Validators.compose([
				Validators.required
			])],
			ShiftBatch: ['', Validators.compose([
				Validators.minLength(3),
				Validators.maxLength(50),
				this.noWhitespaceValidator,
				this.notOnlySpicalChar,
			])],
			Quantity: ['', Validators.compose([
				Validators.minLength(1),
				Validators.maxLength(50),
				this.noWhitespaceValidator,
				this.isValid,
			])]
	});
 }

	sortData(sort){
		console.log(sort)
		const data = this.dummy_purchaseOrderCompanyWise.slice();
    if (!sort.active || sort.direction === '') {
      this.purchaseOrderCompanyWise.data = data;
      return;
    }

    this.purchaseOrderCompanyWise.data = data.sort((a, b) => {

      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'po_no':
          return this.compare(a.order_number, b.order_number, isAsc);
        case 'company_name':
          return this.compare(a.company_name, b.company_name, isAsc);
        case 'cargo_ready_date':
          return this.compare(a.ship_date, b.ship_date, isAsc);
        case 'total_quantity':
          return this.compare(a.item_qty, b.item_qty, isAsc);
        case 'actual_quantity':
          return this.compare(a.actual_quantity, b.actual_quantity, isAsc);
        case 'pending_quantity':
					let ele_1 = a.item_qty - a.actual_quantity > 0 ? a.item_qty - a.actual_quantity : 0
					let ele_2 = b.item_qty - b.actual_quantity > 0 ? b.item_qty - b.actual_quantity : 0
          return this.compare(ele_1, ele_2, isAsc);
        default:
          return 0;
      }
    });

 	}

	compare(a: number | string, b: number | string, isAsc: boolean) {
		return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
	}

	noWhitespaceValidator(control: FormControl){
		const isWhitespace = (control.value || '').toString().trim().length === 0;
		const isValid = !isWhitespace;
		return isValid ? null : { 'whitespace': true };
	}

	
	notOnlySpicalChar(control: FormControl){
		let regex = /[A-Za-z0-9]/;
		const string = (control.value || '').toString().trim();
		return regex.test(string) ? null : { 'isOnlySplChar': true };
	}

	isValid = (control: FormControl) => {
		let limit = this.getTotalPendingQty() > 0 ? this.getTotalPendingQty() : 0
		const isValid = control.value <= limit && control.value > 0;
		return isValid ? null : { 'isValidInput': true };
	}

	// backToProd(){
	// 	this.isMobileDetailedView =  false; 
	// 	this.transactionsColl=new MatTableDataSource([])
	// 	this.form.reset();
	// }

	btnDisabled=false
	isBtnDisabled(ele: any): boolean {
		if(ele['transaction_date'] != null && ele['shift_batch']?.length >0 && ele['mfg_qty'] >= 0){
			return false
		} else {
			return true;
		}
 	}
	
	applyOrderConfirmationFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.purchaseOrderMonthWise.filter = filterValue.trim().toLowerCase();
	}

	// applyPOFilter(event: Event) {
	// 	const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
	// 	console.log("filter Value",filterValue);
		
	// 	this.poColl.filter = filterValue.trim().toLowerCase();
    //     //console.log(this.purchaseOrderMonthWise)
	// 	if(filterValue == ''){
	// 		this.getPurchaseOrders();
	// 	}else{
	// 		const filtered=this.purchaseOrderMonthWise.filteredData.filter((e: any)=>{
	// 		 return (e.product.toLowerCase().includes(filterValue)) || (e.product_description.toLowerCase().includes(filterValue));
	// 			})
	// 	    this.purchaseOrderMonthWise.filteredData=filtered;
	//       }
	// }

	// tabChanged(tabChangeEvent: MatTabChangeEvent): void {
	// 	if (tabChangeEvent.index == 0) {
	// 		this.tabTitle = "Active"
	// 	} else {
	// 		this.tabTitle = "Cancelled"
	// 	}
	// }

	// toggleNavigate(nav) {
	// 	if(nav == 'cards') {
	// 		this.router.navigate(['/nav/orderpo/details']);
	// 	} else {
	// 		this.router.navigate(['/nav/orderpo']);
	// 	}
	// }

	getErrorMessage(control, controlName) {
		let msg = '';
		msg += control.hasError('required') ? 'Field Cannot be empty. ' : '';
		if (controlName == 'ShiftBatch') { msg += (control.errors.minlength || control.errors.maxlength) ? 'Must be between 3 & 50 length. ' : '' }
		return msg;
	}

	// async getPurchaseOrders() {
	// 	this.isLoading = true;
	// 	let result = await this.authService.getPurchaseOrders();
	// 	if (result.success) {
	// 		if(result.is_po_assigned) {
	// 			this.purchaseOrderMonthWise = new MatTableDataSource(result.result);
	// 			this.isPOAssigned = true;
	// 		} else {
	// 			this.purchaseOrderMonthWise = new MatTableDataSource([]);
	// 			this.isPOAssigned = false;
	// 		}
	// 		this.isLoading = false;
	// 	} else {
	// 		this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
	// 	}
	// 	// this.isLoading = false;
	// 	// this.isPOAssigned = true;
	// 	// let dummyResult = [
	// 	// 	{"product": "140804200-001", "date": "DEC 2021", "product_description": "M10 Push Fit Tails (Pair)", "total_quantity": "203000"},
	// 	// 	{"product": "1625A0A", "date": "DEC 2021", "product_description": "M10 Push Fit Tails (Pair)", "total_quantity": "192000"},
	// 	// 	{"product": "INF6450606", "date": "DEC 2021", "product_description": "M10 Push Fit Tails (Pair)", "total_quantity": "23422"},
	// 	// 	{"product": "INF-AGU-001", "date": "JAN 2022", "product_description": "M10 Push Fit Tails (Pair)", "total_quantity": "193000"},
	// 	// 	{"product": "K304B", "date": "FEB 2022", "product_description": "M10 Push Fit Tails (Pair)", "total_quantity": "124400"},
	// 	// 	{"product": "QB-104", "date": "MAR 2022", "product_description": "M10 Push Fit Tails (Pair)", "total_quantity": "197800"},
	// 	// 	{"product": "131446088", "date": "MAR 2022", "product_description": "M10 Push Fit Tails (Pair)", "total_quantity": "193000"},
	// 	// 	{"product": "131184989", "date": "JUL 2022", "product_description": "SKU:JS duck feather 10.5 tog duvet superking", "total_quantity": "124000"}
	// 	// ]
	// 	// this.purchaseOrderMonthWise = new MatTableDataSource(dummyResult);
	// }

	// async viewDetailedOrders(product:any) {
	// 	console.log("vuew detailss",product);
	// 	this.isLoading = true;
	// 	let param = {
	// 		product: product.product,
	// 		product_description: product.product_description,
	// 		month: product.date.split(' ')[0],
	// 		year: product.date.split(' ')[1],
	// 	}
	// 	let result = await this.authService.getPurchaseOrdersCompanywise(param);
	// 	console.log("view detaisl result", result);
	// 	this.isLoading = false;
	// 	if (result.success) {
	// 		this.product = product.product;
	// 		this.productDescription =product.product_description;
	// 		this.supplierRefId = product.supplier_ref_id;
	// 		this.totalOrderedQty = product.item_qty;
	// 		this.getOrderTransactions();
	// 		this.isMobileDetailedView = true;
	// 		this.dummy_purchaseOrderCompanyWise = JSON.parse(JSON.stringify(result.result));
	// 		this.purchaseOrderCompanyWise = new MatTableDataSource(result.result);
	// 		console.log("result product ",this.purchaseOrderCompanyWise);
	// 		this.openConfirmation();
	// 	} else {
	// 		this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
	// 	}
	// 	this.reusable.curRoute.next("/nav/orderpo");
	// 	this.isMobileDetailedView = true;
	// }

	openConfirmation(){
		this.router.navigate(['/nav/orderpo/view']);
	}


  async getMyOrders() {
		this.orderConfirmationColl = [{po_no:'PO1234', status:'Confirmed', shipment_date:'22 Mar 2021',cargo_ready_date:'22 Mar 2021',loading_port:'Visakhapatnam', lp_code:'IN', discharging_port:'London', dp_code:'GB', type:'FCL',mode:'ship',sc:'SC1234',supplier_name:'Jithin',supplier_number:'+91 7093753263', logistics_provider:''},{po_no:'PO1235', status:'Processing',shipment_date:'22 Mar 2021',cargo_ready_date:'22 Mar 2021', loading_port:'Brisbane',lp_code:'AU', discharging_port:'Beijing', dp_code:'CN', type:'LCL',mode:'flight',sc:'SC1235',supplier_name:'Balaji',supplier_number:'+91 7093753263', logistics_provider:''}];
		this.orderConfirmationColl.paginator = this.tablePaginator;
		this.tablePaginator._intl.itemsPerPageLabel = "Rows per page";
	}

  	// addView() {
	// 	const dialogRef = this.dialog.open(CustomViewComponent, {
	// 		width: '28%',
	// 		height: '100%',
	// 		data: { view: this.dispPO },
	// 		position: { right: '0px' },
	// 		panelClass: 'dialogclass'
	// 	});
	// 	dialogRef.afterClosed().subscribe(result => {
	// 		if (result) {
    //     		this.dispPO = result.filter(i => i.is_selected == true).map(i => i.name);
	// 			this.getMyOrders();
	// 		}
	// 	});
	// }

	async addTransaction() {
		let date = this.form.get('Date').value;
		let shiftBatch = this.form.get('ShiftBatch').value;
		let quantity = this.form.get('Quantity').value;
		// let duplicate = this.transactionsColl.data.filter(tran => tran.shift_batch.toLowerCase() == shiftBatch.toLowerCase() && tran.mfg_qty == quantity);
		// if(duplicate.length > 0){
		// 	this.reusable.openAlertMsg("Can't add dupicate Shift / batch", "error");
		// 	return;
		// }
		const param = {
			date: date, 
			shift_batch: shiftBatch, 
			mq: quantity,
			file_name: (this.fileName == undefined) ? null : this.fileName,
			file: (this.fileName == undefined) ? null : this.previewUrl,
			file_type: this.attachType,
			product: this.product,
			product_description: this.productDescription,
			supplier_ref_id: this.supplierRefId
		}
		let result = await this.authService.addOrdersTransaction(param);
		if (result.success) {
			this.form.get('Date').reset();
			this.form.get('ShiftBatch').reset();
			this.form.get('Quantity').reset();
			this.fileName = undefined;
			this.previewUrl = undefined;
			this.getOrderTransactions();

		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	onTransactionEdit(ele){
		this.transactionsColl.data.map(e => e['isEdit'] = false);
		ele['isEdit'] = true;
	}

	async getOrderTransactions() {
		let param = {
			product: this.product,
			product_description: this.productDescription,
			supplier_ref_id : this.supplierRefId,
		}
		let result = await this.authService.getOrderTransactions(param);
		if (result.success) {
			this.transactionsColl = new MatTableDataSource(result.result);
			console.log('transactionsColl', this.transactionsColl.data)
			this.dummy_transactionsColl = JSON.parse(JSON.stringify(result.result));;
			if(this.transactionsColl.data.length > 0) {
				this.getActualQty();
			} else {
				this.purchaseOrderCompanyWise.data.map((po)=>{
					po.actual_quantity = 0;
				})
			}
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	closeTransactionEdit(element: any){
		element.isEdit = !element.isEdit;
		this.dummy_transactionsColl.forEach(e => {
			if(element.pot_id == e.pot_id){
				element.transaction_date = e.transaction_date
				element.shift_batch = e.shift_batch
				element.mfg_qty = e.mfg_qty
				element.attachment_file_path = e.attachment_file_path
			}
		})
	}

	getActualQty() {
		let totalmgQty = this.getCompletedOrders();
		this.purchaseOrderCompanyWise.data.map((po,idx) =>{
			if(idx < this.purchaseOrderCompanyWise.data.length - 1) {
				po.actual_quantity = 0;
				if(totalmgQty > po.item_qty) {
					po.actual_quantity +=  po.item_qty;
					totalmgQty -= po.item_qty;
				} else {
					po.actual_quantity += totalmgQty;
					totalmgQty = 0;
				}
			} else {
				po.actual_quantity = 0;
				po.actual_quantity += totalmgQty;
			}
		});
	}

	getTotalPendingQty() {
		return this.purchaseOrderCompanyWise.data.reduce((accum, element) => accum + (element.item_qty - element.actual_quantity), 0);
	}
	
	getCompletedOrders() {
		return this.transactionsColl.data.reduce((a,element) => a + element.mfg_qty, 0)
	}
	
	async saveTransactionEdit(ele:any) {
		ele.isEdit = !ele.isEdit;
		const param = {
			pot_id: ele.pot_id,
			transaction_date: ele.transaction_date, 
			shift_batch: ele.shift_batch, 
			mq: ele.mfg_qty,
			attachment_file_path: ele.attachment_file_path,
			file_name: (this.fileName == undefined) ? null : this.fileName,
			file: (this.fileName == undefined) ? null : this.previewUrl,
			file_type: this.attachType,
		}
		let result = await this.authService.updOrdersTransaction(param);
		if (result.success) {
			const objects: any[] = this.transactionsColl.data;
			for(let transCol of objects){
				if(transCol.pot_id == ele.pot_id){
					transCol.transaction_date = ele.transaction_date
					transCol.ShiftBatch = ele.shift_batch
					transCol.Quantity = ele.mfg_qty
				}
			}
			this.getOrderTransactions();
			this.getActualQty();
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	async delTransaction(ele:any) {
		let conf = confirm("Are you sure to delete this Transaction?");
		if (!conf) return;
		const param = {
			pot_id: ele.pot_id,
		}
		let result = await this.authService.delTransaction(param);
		if (result.success) {
			this.getOrderTransactions();
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

	openUploadAttachmentDialog(is_uploaded:boolean) {
		this.transactionsColl.data.map(e => e['isEdit'] = false);
		this.isEditTransaction = false;
		this.fileName = undefined;
		const dialogRef = this.dialog.open(UploadAttachmentDialog, {
			height: '50%',
			width: '300px',
			data: { is_uploaded: is_uploaded , preview_url: this.previewUrl, attach_type: this.attachType },
			panelClass: 'dialogclass',
		});
		dialogRef.afterClosed().subscribe(result => {
			if(result.success) {
				this.fileName = result.file_name;
				this.previewUrl = result.preview_url;
				this.attachType = result.attach_type;
			}
		});
	}

	openUploadAttachmentDialogForTransEdit(is_uploaded:boolean, element:any) {
		const dialogRef = this.dialog.open(UploadAttachmentDialog, {
			height: '50%',
			width: '300px',
			data: { is_uploaded: is_uploaded , preview_url: this.previewUrl, attach_type: this.attachType },
			panelClass: 'dialogclass',
		});
		dialogRef.afterClosed().subscribe(result => {
			if(result.success) {
				this.fileName = result.file_name;
				this.previewUrl = result.preview_url;
				this.attachType = result.attach_type;
				this.isEditTransaction = true;
				element.attachment_file_path = result.file_name;
			}
		});
	}
	
	attachFile(element) {
		var Extensions = /(\.png|\.jpg|\.jpeg|\.pdf)$/i;
		if (Extensions.exec(element.target.value) && element.target.value.split('.').length == 2) {
			this.attachedFile = <File>element.target.files[0];
			this.fileName = element.target.files[0]["name"];
			if (this.fileName.toLowerCase().includes('pdf')) {
				this.attachType = 'PDF';
			} else {
				this.attachType = 'IMAGE';
			}
			if (this.attachedFile.size) {
				let reader = new FileReader();
				reader.readAsDataURL(this.attachedFile);
				reader.onload = (event: any) => {
					this.previewUrl = event.target.result;
				}
			}
		} else {
			this.reusable.openAlertMsg("Unsupported Format", "error");
		}
	}

	editAttachedFile(element, ele) {
		var Extensions = /(\.png|\.jpg|\.jpeg|\.pdf)$/i;
		if (Extensions.exec(element.target.value) && element.target.value.split('.').length == 2) {
			this.attachedFile = <File>element.target.files[0];
			this.fileName = element.target.files[0]["name"];
			if (this.attachedFile.size) {
				let reader = new FileReader();
				reader.readAsDataURL(this.attachedFile);
				reader.onload = (event: any) => {
					this.previewUrl = event.target.result;
				}
			}
		} else {
			this.reusable.openAlertMsg("Unsupported Format", "error");
		}
	}

	async viewAttachedFile(path) {
		let Path = { filePath: path };
		this.authService.viewTransactionsAttachedFile(Path).subscribe(img => {
				this.createImageFromBlob(img);
		});
	}

	createImageFromBlob(image: Blob) {
		var fileURL: any = URL.createObjectURL(image);
		var a = document.createElement("a");
		a.href = fileURL;
		a.target = '_blank';
		a.click();
	}


}

@Component({
	selector: 'order-confirmation-custom-view',
	templateUrl: 'order-confirmation-custom-view.html',
	styleUrls: ['./order-confirmation.component.css']
})

export class CustomViewComponent implements OnInit {

	isLoading: boolean;
	form: FormGroup;
	viewform: FormGroup;
	viewVal: any;
	isSaving = false;
	selectedModules :any;
	ht: number;
	width: number;
	screenParam: any;
	columnList = [{ name:"po_no", is_selected:false, display_name:"PO NO" }, { name:"status", is_selected:false, display_name:"STATUS"}, { name:"logistics_provider", is_selected:false, display_name:"LOGISTICS PROVIDER" }, { name:"shipment_date", is_selected:false , display_name:"SHIPMENT DATE" }, { name:"cargo_ready_date", is_selected:false, display_name:"CARGO READY DATE"  }, { name:"loading_port", is_selected:false , display_name:"LOADING PORT" }, { name:"discharging_port", is_selected:false, display_name:"DISCHARGING PORT"  }, { name:"type", is_selected:false, display_name:"TYPE"  }, { name:"mode", is_selected:false , display_name:"MODE" }, { name:"sc", is_selected:false, display_name:"SC NO"  }, { name:"supplier_name", is_selected:false , display_name:"SUPPLIER NAME" }, { name:"supplier_number", is_selected:false, display_name:"SUPPLIER NUMBER" }];
    selectedTabIndex:0;
 	viewList = ["view1", "view2", "view3", "view4", "view5", "view6"];
	type:any;
	isView: string;

	 constructor(
		public dialogRef: MatDialogRef<CustomViewComponent>,
		@Inject(MAT_DIALOG_DATA) public data: CustomViewComponent,
		private formBuilder: FormBuilder,
		public dialog: MatDialog,
		private reusable: ReusableComponent,
		private authService: AuthenticationService,

	) { }

	ngOnInit() {
		this.reusable.screenChange.subscribe(res => {
			this.screenParam = { width: res.width, height: res.height - 60 };
			this.ht = res['height'] - 64;
			this.width = res["width"] - 64;
		});
		this.columnList.forEach(i => {
		if ( this.data['view'].includes(i.name) ) {
			i.is_selected = true;
		}
		else i.is_selected = false;
		});		
		this.selectedModules = this.columnList.filter(i => i.is_selected == true );
		this.createForm();
	}

	createForm() {
		this.form = this.formBuilder.group({
			View: [''],
		})
		}

	onChange(ele) {
		if (ele.is_selected)
			this.selectedModules.push(ele);
		else
			this.selectedModules = this.selectedModules.filter(i => i.is_selected == true);
	}

	async apply() {
		this.closeWithReturn(this.selectedModules);
	}
	
	 saveView():  void {
		const dialogRef = this.dialog.open(SaveViewDialog, {
			  width: '30%', data: { type: 'save'},
			});
		dialogRef.afterClosed().subscribe(result => {
			  if (result) {
			}
		});	
	 }

	 editView(ele) {
		const dialogRef = this.dialog.open(SaveViewDialog, {
			  width: '30%', data: { type: 'edit', ele:ele},
			});
		dialogRef.afterClosed().subscribe(result => {
			  if (result) {
			}
		});	
	}
	
	onClose(status: boolean) {
		this.dialogRef.close(status);
	}

	closeWithReturn(data): void {
		this.dialogRef.close(data);
	  }
}

@Component({
	selector: 'order-confirmation-addedit-view',
	templateUrl: 'order-confirmation-add-edit-view.html',
	styleUrls: ['./order-confirmation.component.css']
})

export class SaveViewDialog implements OnInit {

	isLoading: boolean;
	form: FormGroup;
	isSaving = false;
	type:any;
	ht: number;
	width: number;
	screenParam: any;
	btnTitle: string;
	isView: string;
	is_default:boolean = true;

	constructor(
		public dialogRef: MatDialogRef<CustomViewComponent>,
		@Inject(MAT_DIALOG_DATA) public data: CustomViewComponent,
		private formBuilder: FormBuilder,
		private authService: AuthenticationService,
		public dialog: MatDialog,
		private reusable: ReusableComponent
	) { }

	ngOnInit() {
		this.reusable.screenChange.subscribe(res => {
			this.screenParam = { width: res.width, height: res.height - 60 };
			this.ht = res['height'] - 64;
			this.width = res["width"] - 64;
		});
		this.type = this.data['type'];
		if(this.type == 'edit')
		{
			this.createForm();
			this.btnTitle = "Edit Filter Name View"
		}
		else {
			this.createForm();
			this.btnTitle = "Save New Filter"
		}
    }

  createForm() {
    this.form = this.formBuilder.group({
        ViewName: ['', Validators.required],
		isDefault:[this.is_default]
     });
	
    }
	
	 async saveView() {
		if (this.form.valid) {
			this.isLoading = true;
			let data;
      		const param = {
				name: this.form.get('ViewName').value,
				is_default: this.form.get('isDefault').value
			};
          //data = await this.authService.addView({param: JSON.stringify(param)});
      	  this.isLoading = false;
			if (data.success) {
				this.reusable.openAlertMsg("View Added","info");
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

	onClose(status: boolean) {
		this.dialogRef.close(status);
	}

	closeWithReturn(data): void {
		this.dialogRef.close(data);
	  }
}

@Component({
	selector: 'order-confirmation-card-view',
	templateUrl: './order-confirmation.component-card-view.html',
	styleUrls: ['./order-confirmation.component.css']
  })

  export class OrderConfirmationCardViewComponent implements OnInit {

	isLoading: boolean = false;
	ht: number;
  	SidePanelWidth: number = 420;
  	userDetails: any;
	width: number;
  	poColl = new MatTableDataSource([]);
	summaryToggle: string = 'cards';
	isInviteTab: boolean = false;
	selectedTabIndex = 0;
	tabTitle: string = "Active";

	sample1 = [{"id":1},{"id":2}, {"id":3},{"id":4},{"id":5},{"id":6},{"id":7},{"id":8},{"id":9},{"id":10},{"id":11},{"id":12},{"id":13},{"id":14},{"id":15},{"id":16},{"id":17},{"id":18}];

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
		this.userDetails = ReusableComponent.usr;
		this.reusable.titleHeader.next("PO Booking & Management");
		this.reusable.headHt.next(60);
    }

	applyPOFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.poColl.filter = filterValue.trim().toLowerCase();
	}

	toggleNavigate(nav) {
		if(nav == 'cards') {
			this.router.navigate(['/nav/orderpo/details']);
		} else {
			this.router.navigate(['/nav/orderpo']);
		}
	}

	tabChanged(tabChangeEvent: MatTabChangeEvent): void {
		if (tabChangeEvent.index == 0) {
			this.tabTitle = "Active"
		} else {
			this.tabTitle = "Cancelled"
		}
	}

}

@Component({
	selector: 'order-confirmation-edit',
	templateUrl: './order-confirmation-edit.component.html',
	styleUrls: ['./order-confirmation.component.css']
  })

  export class OrderConfirmationEditComponent implements OnInit {

	isLoading: boolean = false;
	height: number;
	width: number;
  	userDetails: any;
	isMobileView:Boolean;
	isMobileDetailedView:Boolean= false;

  constructor(
   		private reusable: ReusableComponent,
		private authService: AuthenticationService,
		private router: Router,
		public dialog: MatDialog,
	) { }

    ngOnInit(): void {
		this.reusable.screenChange.subscribe(screen => {
			if (screen.height < 600) {
			  this.height = screen.height
			} else {
			  this.height = screen.height-60;
			}
			if (screen.width < 900){
				this.isMobileView = true;
			  }
			  else {
				this.isMobileView = false;
			  }
			this.width = screen.width - 140;
		});
		this.userDetails = ReusableComponent.usr;
		this.reusable.titleHeader.next("Add Transactions");
		this.reusable.headHt.next(0);
    }

	addTransaction() {
		const dialogRef = this.dialog.open(AddTransactionDialogComponent, {
			height: '100%',
			width: '820px',
			position: { right: '0px' },
			data: { },
			panelClass: 'dialogclass',
		});
		dialogRef.afterClosed().subscribe(result => {

		});
	}
}
  
  @Component({
	selector: 'add-transaction-dialog',
	templateUrl: './add-transaction-dialog.component.html',
	styleUrls: ['./order-confirmation.component.css']
  })
  export class AddTransactionDialogComponent implements OnInit {
	  isLoading: boolean;
	  ht: number;
	  width: number;
	  form: FormGroup;
	  userDetails;
	  inviteCompanyVal: any; parentCompanyId: number; parentCompanyType: number; companyTypeList: any;
	  modulesVal: any;
	  modulesList: any;
	  title: String;
	  btnTitle: String;
	  emailExists: boolean; invitee_user_id: any; invitee_company_id: any;
	  userCompanyList: any;
	inviteCompanyName: string;
	
	  constructor(
		  private reusable: ReusableComponent,
		  private formBuilder: FormBuilder,
		  private authService: AuthenticationService,
		  public dialogRef: MatDialogRef<AddTransactionDialogComponent>,
		  @Inject(MAT_DIALOG_DATA) public data: AddTransactionDialogComponent,
		  public dialog: MatDialog,
	  ) { }
  
	  ngOnInit() {
		  this.reusable.screenChange.subscribe(res => {
			  this.ht = res['height'] - 64;
			  this.width = res["width"] - 64;
		  });
		  this.isLoading = true;
		  // this.isLoading = false;
		  this.btnTitle = 'INVITE';
		  this.title = "INVITE STAKEHOLDERS COMPANY";
		  this.parentCompanyId = this.data['parentCompanyId'];
		  this.inviteCompanyName = this.data['inviteCompanyName'];
		  this.parentCompanyType = this.data['parentCompanyType'];
		  this.userDetails = ReusableComponent.usr;
		  this.getCompanyTypeList();
		  this.getLicensedModulesList();
		  this.createForm();
		  this.isLoading = false;
	  }
  
	  createForm() {
  
		  this.form = this.formBuilder.group({
			  Name: ['', Validators.compose([
				  Validators.minLength(3),
				  Validators.maxLength(50),
				  this.validateName
			  ])],
			  Email: ['', Validators.compose([
				  Validators.email,
				  Validators.required,
			  ])],
			  CompanyName: [{value: this.inviteCompanyName, disabled: true}, Validators.compose([
				  Validators.minLength(3),
				  Validators.maxLength(250),
			  ])],
			  ParentCompanyType: [ {value: this.parentCompanyType, disabled: true}, Validators.compose([
				  Validators.required,
			  ])],
			  InviteCompanyType: [ {value: this.inviteCompanyVal, disabled: false}, Validators.compose([
				  Validators.required,
			  ])],
			  LicenseModules: [this.modulesVal ? this.modulesVal : '', Validators.compose([
				  Validators.required,
			  ])],
		  })
	  }
  
	  getErrorMessage(control, controlName) {
		  let msg = '';
		  msg += control.hasError('required') ? 'Field Cannot be empty. ' : '';
		  if (controlName == 'Email') { msg += control.hasError('email') ? 'Enter a valid email ' : '' }
		  if (controlName == 'Email') { msg += (control.errors.inviteEmailExists) ? 'You cannot self invite to your own email' : '' }
		  if (controlName == 'Name') { msg += (control.errors.minlength || control.errors.maxlength) ? 'Must be between 3 & 50 length. ' : '' }
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
				let inviteVal = result.result.filter(x => x.name == 'Consignee');
				this.form.get('InviteCompanyType').setValue(inviteVal[0].lookup_id);
		  } else {
			  this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		  }
	  }
  
	  async getLicensedModulesList() {
		  let param = {
			  company_id: this.parentCompanyId
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
		  } else if (result.success && result.result == "Not available") {
			  this.emailExists = false;
			  this.invitee_user_id = undefined;
		  } else {
			  this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		  }
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
	  }
  
	  async checkPrevCompInvit() {
		  let param = {
			  invited_company_id: this.companyTypeList,
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
		  if (this.form.valid) {
			this.isLoading = true;
			  const param = {
				  invitee_contact_name: this.form.get('Name').value,
				  invitee_company_name: this.form.get('CompanyName').value.trim().toLowerCase(),
				  invitee_email: this.form.get('Email').value.trim().toLowerCase(),
				  invited_company_id:  this.parentCompanyId,
				  invited_company_type_id: this.form.get('ParentCompanyType').value,
				  invitee_company_type_id: this.form.get('InviteCompanyType').value,
				  shared_modules: this.form.get('LicenseModules').value,
				  invitee_user_id: this.invitee_user_id,
				  company_invite_id: null,
				  invitee_company_id: this.invitee_company_id != null || this.invitee_company_id != undefined ? this.invitee_company_id : null,
			  };
			  let data = await this.authService.inviteCompnay(param);
			  if (data.success) {
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
}

@Component({
	selector: 'upload-attachment-dialog',
	templateUrl: './upload-attachment-dialog.component.html',
	styleUrls: ['./order-confirmation.component.css']
})

export class UploadAttachmentDialog implements OnInit {
	isLoading: boolean;
	ht: number;
	width: number;
	userDetails;
	isOptionSelection: boolean = true;
	isMobile: boolean = false;
	isBrowsedFile: boolean = false;
	isViewImage: boolean = false;
	attachedFile: any;
	fileName: any;
	previewUrl;
	attachType: string;
	
	constructor(
		private reusable: ReusableComponent,
		private formBuilder: FormBuilder,
		private authService: AuthenticationService,
		public dialogRef: MatDialogRef<UploadAttachmentDialog>,
		@Inject(MAT_DIALOG_DATA) public data: UploadAttachmentDialog,
		public dialog: MatDialog,
	) { }
	
	ngOnInit() {
		this.reusable.screenChange.subscribe(res => {
			this.ht = res['height'] - 64;
			this.width = res["width"] - 64;
		});
		if(this.width > 500) {
			this.isMobile = false;
		} else {
			this.isMobile = true;
		}
		this.userDetails = ReusableComponent.usr;
		if(this.data['is_uploaded']) {
			this.isViewImage = true;
			this.previewUrl = this.data['preview_url'];
			this.attachType = this.data['attach_type'];
			this.isOptionSelection = false;
		} else {
			this.isViewImage = false;
			this.isOptionSelection = true;
		}
	}

	attachFile(element) {
		var Extensions = /(\.png|\.jpg|\.jpeg|\.pdf)$/i;
		if (Extensions.exec(element.target.value) && element.target.value.split('.').length == 2) {
			this.attachedFile = <File>element.target.files[0];
			this.fileName = element.target.files[0]["name"];
			if (this.fileName.toLowerCase().includes('pdf')) {
				this.attachType = 'PDF';
			} else {
				this.attachType = 'IMAGE';
			}
			if (this.attachedFile.size) {
				let reader = new FileReader();
				reader.readAsDataURL(this.attachedFile);
				reader.onload = (event: any) => {
					// this.previewUrl = this.attachType == 'IMAGE' ? event.target.result : URL.createObjectURL(element.target.files[0]);
					this.previewUrl = event.target.result;
				}
				this.isOptionSelection = false;
				this.isBrowsedFile = true;
			}
		} else {
			this.reusable.openAlertMsg("Unsupported Format", "error");
		}
	}

	onSubmit() {
		let data = {
			success: true,
			preview_url : this.previewUrl,
			file_name: this.fileName,
			attach_type: this.attachType,
		}
		this.dialogRef.close(data);
	}

	ngOnDestroy(): void {
		if((!this.previewUrl || this.isViewImage) || this.isOptionSelection){
			this.dialogRef.close({ success : false });
		}
	}
 }