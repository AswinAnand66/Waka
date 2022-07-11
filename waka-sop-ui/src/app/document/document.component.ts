import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../_services/index';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ReusableComponent } from '../reusable/reusable.component';
import { FormArray, FormBuilder, FormGroup, NgControlStatus, Validators } from '@angular/forms';
import { MatDialog , MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
//import { ClassLookup } from '../sop-add-edit-old-notinuse/sop-add-edit.component';
import { AddEditLookupComponent } from '../lookup/lookup.component';

export interface ClassRole {
  lookup_name_id: number, 
  lookup_type_id: number,
  lookup_name:string,
  display_name: string, 
  description: string, 
  lookup_type: string,
}

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
export class DocumentComponent implements OnInit {

  isLoading = false;
  screenParam: any;
  isMobile:boolean = false;
  ht:number; 
  width:number;
  userDetails: any;
  docColl = new MatTableDataSource([]);
  dispDoc= ["g0_name", "g1_name", "g2_name", "g3_name", "cnt", "edit", "delete"];

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
    this.getDocumentList();
  }

  async getDocumentList(){
    let param = {
      type: 'document'
    }
    let result = await this.authService.getRequirement({param:this.reusable.encrypt(JSON.stringify(param))});
    console.log(result);
    if (result.success){
      this.docColl = new MatTableDataSource(result.result);
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
    }
  }
  goBack(){
    this.router.navigate(['/nav/home']);
  }

  addDoc() {
    this.router.navigate(["document/aedoc/document"]);
		// const dialogRef = this.dialog.open(AddEditDocumentComponent, {
		// 	width: '920px',
		// });
		// dialogRef.afterClosed().subscribe(result => {
		// 	if (result){
    //   }
		// });
	}

  editDoc(ele) {
		// const dialogRef = this.dialog.open(AddEditDocumentComponent, {
		// 	width: '920px', data: ele
		// });
		// dialogRef.afterClosed().subscribe(result => {
		// 	if (result){
    //   }
		// });
	}
  
  async getAdminLookup(){
    let result = await this.authService.getAdminLookups();
    if (result.success){
      console.log(result.result);
      this.docColl = new MatTableDataSource(result.result);
      this.docColl.sort = this.sort;
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
    }
  }

  applyLookupFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.docColl.filter = filterValue.trim().toLowerCase();
	}

  async delDoc(ele){
		let conf = confirm("Deleting the document will remove all the records that are mapped to this document, Are you sure you like to delete this document?");
		if (!conf) return;
		let param = {
			req_id: ele.req_id
		}
		let result = await this.authService.delRequirement({param:this.reusable.encrypt(JSON.stringify(param))});
    console.log(result);
		if (result.success){
      this.reusable.openAlertMsg("Successfully Deleted","info");
			this.getDocumentList();
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}
}

@Component({
  selector: 'app-add-edit-document',
  templateUrl: './add-edit-document.component.html',
  styleUrls: ['./document.component.css'],
})
export class AddEditDocumentComponent implements OnInit {
  fieldType = ['radio','checkbox','multi','text','textarea','number']
  isLoading:boolean = false;
  userDetails: any;
  form: FormGroup;
  docGrpColl=[];//:ClassLookup[] = [];
  // LookupTypesList = []; LookUpId:number = null;
  // LookUpTypeSelValId: number;
  BtnTitle:string;
  typeId:number;
  who:string;

  constructor(
		// public dialogRef: MatDialogRef<AddEditDocumentComponent>,
		// @Inject(MAT_DIALOG_DATA) public data:ClassRole,
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private reusable: ReusableComponent,
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router,
  ) { }

  ngOnInit(){
    this.userDetails = ReusableComponent.usr;
    if (this.activatedRoute.snapshot.paramMap.has('data')){
      this.who = this.activatedRoute.snapshot.paramMap.get('data');
      if (this.who == 'document'){
        this.getDocTypeId()
        this.getDocumentLookup();
      }
    }
    this.createForm();
    this.addFields();
  }
  
  async getDocTypeId(){
    let param = {
      type: 'document'
    };
    let result = await this.authService.getLookupTypeId({param:this.reusable.encrypt(JSON.stringify(param))});
    if (result.success){
      this.typeId = result.result[0].lookup_type_id;
      console.log(this.typeId)
    } 
    else {
      this.authService.invalidSession(result);
    }
  }

  createForm() {
		this.form = this.formBuilder.group({
      Grp0: [null, Validators.compose([Validators.required])],
      Grp1: [null],
      Grp2: [null],
      Grp3: [null],
      Fields:this.formBuilder.array([]),
		});
  }

  get fields(){
		return this.form.get('Fields') as FormArray;
	}
	
	getFieldsArrControls(){
		return (this.form.get('Fields') as FormArray).controls;
	}
	
	addFields(){
		this.fields.push(this.formBuilder.group({
			Type: [null, Validators.compose([
				Validators.required,
			])],
			Name: [null, Validators.compose([
				Validators.required,
        this.validateName
			])],
      Options:[null],
			Value:[null],
      AddText: [null],
      Others:[null],
      IsPrefix: [false],
			HasChild: [false],
		}));
	}
	
  setValidators(ele){
    if (ele.get('Type').value == 'radio' || ele.get('Type').value == 'multi'){
      ele.get('Options').setValidators([Validators.required, this.validateOptions]);
      ele.get('Options').updateValueAndValidity();
    }
    else {
      ele.get('Options').clearValidators();
      ele.get('Options').updateValueAndValidity();
    }
    if (ele.get('Type').value == 'number'){
      ele.get('AddText').setValidators([Validators.required, this.validateName]);
      ele.get('Value').setValidators([this.validateNumber]);
      ele.get('AddText').updateValueAndValidity();
      ele.get('Value').updateValueAndValidity();
    }
    else {
      ele.get('AddText').clearValidators();
      ele.get('Value').clearValidators();
      ele.get('AddText').updateValueAndValidity();
      ele.get('Value').updateValueAndValidity();

    }
  }

  validateNumber(controls){
		if (controls.value == undefined) return null;
		const reqExp = new RegExp("^[+-]?\\d+$");
		if (reqExp.test(controls.value)){
			if(controls.value.trim().length == 0) return {'validateNumber' : true};
			return null;
		} 
		else {
			return { 'validateNumber' : true};
		}
  }

  validateName(controls){
		if (controls.value == undefined) return null;
		const reqExp = new RegExp("^[a-zA-Z0-9& ]+$");
		if (reqExp.test(controls.value)){
			if(controls.value.trim().length == 0) return {'validateName' : true};
			return null;
		} 
		else {
			return { 'validateName' : true};
		}
  }

  validateOptions(controls){
		if (controls.value == undefined) return null;
		const reqExp = new RegExp("^[a-zA-Z0-9,&_\\-\\ ]+$");
		if (reqExp.test(controls.value)){
			if(controls.value.trim().length == 0) return {'validateOptions' : true};
			return null;
		} 
		else {
			return { 'validateOptions' : true};
		}
  }

	removeFields(idx){
		this.fields.removeAt(idx);
		this.form.markAsDirty();
	}

  async getDocumentLookup(){
    let result = await this.authService.getDocumentLookup();
    if (result.success){
      this.docGrpColl = result.result;
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
    }
    //console.log(this.docGrpColl);
  }

  async openLookup(controlName){
    const dialogRef = this.dialog.open(AddEditLookupComponent, {
			width: '920px',
		});
		dialogRef.afterClosed().subscribe(result => {
      console.log("result", result);
			if (result){
        this.getDocumentLookup();
      }
		});

  }
  onLookUpTypeChange(val) {
    // this.LookUpTypeSelValId = val;
  }

  async saveReq() {
    if (this.form.valid) {
      this.isLoading = true;
      let fields = [];
      let ctrlFields = this.getFieldsArrControls();
      ctrlFields.map((control,ix) => {
        fields.push({
          type: control.get('Type').value,
          name: control.get('Name').value,
          options: control.get('Options').value,
          num_text: control.get('AddText').value,
          others: control.get('Others').value,
          is_prefix: control.get('IsPrefix').value,
          has_child:control.get('HasChild').value,
          value: control.get('Value').value,
          controlname: (control.get('Name').value.replace(/ /g,'').replace(/&/g,'')+ix).toLowerCase(),
        })
      });
      let param = {
        req_type_id: this.typeId,
        group_id0: this.form.get('Grp0').value.lookup_name_id,
        group_id1: this.form.get('Grp1').value != undefined ? this.form.get('Grp1').value.lookup_name_id:null,
        group_id2: this.form.get('Grp2').value != undefined ? this.form.get('Grp2').value.lookup_name_id:null,
        group_id3: this.form.get('Grp3').value != undefined ? this.form.get('Grp3').value.lookup_name_id:null,
        fields: JSON.stringify(fields)
      }
      let result = await this.authService.insReq({param:this.reusable.encrypt(JSON.stringify(param))});
      console.log(result, param, this.typeId);
      if (result.success){
        this.reusable.openAlertMsg("Successfully added","info");
        if (this.who == 'document') this.router.navigate(['/nav/document']);
      }
      else {
        this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
      } 
    }
  }

  goBack(){
    this.router.navigate(['/nav/document']);
  }
  onClose(status){
    // this.dialogRef.close(status);
  }
  onChange(event, ele){
    ele.get('Value').setValue(event.value);
  }
}