import { Component, OnInit, Inject, ViewChild, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../_services/index';
import { ReusableComponent, ConfirmDialog } from '../reusable/reusable.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatStepper } from '@angular/material/stepper';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-po-ingestion',
  templateUrl: './po-ingestion.component.html',
  styleUrls: ['./po-ingestion.component.css'],
})
export class PoIngestionComponent implements OnInit {
  screenParam: any; varFxLayout: string = "row wrap";
  cardPadding: number;
  userDetails: any;
  poIngestionCardsColl = [];
  height: number;
  width: number;
  rowChartCnt: number = 3;
  cardDivWidth: number = 380;
  isMobile: boolean = false;

  constructor(
    private reusable: ReusableComponent,
    private authService: AuthenticationService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.reusable.headHt.next(0);
    this.reusable.titleHeader.next("PO Ingestion");
    this.reusable.curRoute.next('home');
    this.reusable.screenChange.subscribe(screen => {
      if (screen.height < 600) {
        this.height = screen.height
      } else {
        this.height = screen.height;
      }
      this.width = screen.width - 140;
      if (screen.width < 600) {
        this.rowChartCnt = 1
        this.cardDivWidth = screen.width * (1 - 10 / 100);
      }
      else if (screen.width < 1200) {
        this.rowChartCnt = 2
        this.isMobile = false;
        this.cardDivWidth = (screen.width * (1 - 10 / 46) - 28) / this.rowChartCnt;
      }
      else if (screen.width < 1400) {
        this.rowChartCnt = 3;
        this.isMobile = false;
        this.cardDivWidth = (screen.width - 200 - 28 * 2) / this.rowChartCnt;
      }
      else {
        this.rowChartCnt = Math.floor(screen.width / 400);
        this.isMobile = false;
        this.cardDivWidth = (screen.width - 212 - 28 * (this.rowChartCnt - 1)) / this.rowChartCnt;
      }
    });
    this.userDetails = ReusableComponent.usr;
    this.getPoIngestionCards();
  }

  async getPoIngestionCards() {
    let result = await this.authService.getPoIngestionCards();
    if (result.success) {
      this.poIngestionCardsColl = result.result;
      this.poIngestionCardsColl.map(cards => {
        this.getTotalCntForRunningStatus(cards);
        this.getTotalCntForSchemaErrors(cards);
        this.getTotalCntForMasterErrors(cards);
      });
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  async getTotalCntForRunningStatus(cards) {
    let param = { company_id: cards.company_id }
    let rowCount = await this.authService.getTotalCntForRunningStatus(param);
    if (rowCount.success) {
      let res = rowCount.result;
      if (res.length > 0) {
        cards.runningStatusCount = res.find(x => x.company_id == cards.company_id).count;
      }
      else {
        cards.runningStatusCount = 0;
      }
    } else {
      this.authService.invalidSession(rowCount);
    }
  }

  async getTotalCntForSchemaErrors(cards) {
    let param = { company_id: cards.company_id }
    let rowCount = await this.authService.getTotalCntForSchemaErrors(param);
    if (rowCount.success) {
      let res = rowCount.result[0];
      if (res.company_id) {
        cards.schemaErrorCount = res.count;
      }
      else {
        cards.schemaErrorCount = 0;
      }
    } else {
      this.authService.invalidSession(rowCount);
    }
  }

  async getTotalCntForMasterErrors(cards) {
    let param = { company_id: cards.company_id }
    let rowCount = await this.authService.getTotalCntForMasterErrors(param);
    if (rowCount.success) {
      let res = rowCount.result[0];
      if (res?.company_id) {
        cards.masterErrorCount = res.count;
      }
      else {
        cards.masterErrorCount = 0;
      }
    } else {
      this.authService.invalidSession(rowCount);
    }
  }

  async navigate(moduleName: string, companyId: number, companyTypeId?: number) {
    if (moduleName == 'Master Errors') {
      this.router.navigate(['/nav/po_ingestion/master_error']);
    }
    else if (moduleName == 'POI Config') {
      sessionStorage.setItem("PoIngestionConfig", JSON.stringify({ company_id: companyId }));
      this.router.navigate(['/nav/po_ingestion/config']);
    }
    else if (moduleName == 'Schema Validation') {
      sessionStorage.setItem("PoIngestionConfig", JSON.stringify({ company_id: companyId }));
      this.router.navigate(['/nav/po_ingestion/schema_validation']);
    }
    else if (moduleName == 'Master Validation') {
      sessionStorage.setItem("PoIngestionConfig", JSON.stringify({ company_id: companyId, company_type_id: companyTypeId }));
      this.router.navigate(['/nav/po_ingestion/master_validation']);
    }
    else if (moduleName == 'Running Status') {
      sessionStorage.setItem("PoIngestionConfig", JSON.stringify({ company_id: companyId }));
      this.router.navigate(['/nav/po_ingestion/running_status']);
    }
    else if (moduleName == 'SOP Errors') {
      this.router.navigate(['/nav/po_ingestion/sop_error']);
    }
  }
}

@Component({
  selector: 'app-po-ingestion-config',
  templateUrl: './po-ingestion-config.html',
  styleUrls: ['./po-ingestion.component.css'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false }
  }]
})
export class PoIngestionConfigComponent implements OnInit {
  isLoading: boolean = false;
  userDetails: any;
  screen: { width: number; height: number; };
  fileName: string;
  fileData: any;
  sampleDataSet: any;
  poiData: any;
  targetSelect: any;
  sourceSelect: any;
  stepOne: boolean = true;
  stepTwo: boolean = false;
  stepThree: boolean = false;
  targetKeys = [];
  sourceKeys = [];
  mappedKeys = [];
  newKeys = [];
  rejectedKeys = [];
  skipMapping: boolean = false;
  sheduleForm: FormGroup;
  requestType: any;
  contentType: any;
  authType: any;
  runFrequency = [{ runFrq_id: 1, name: '1 hr' }, { runFrq_id: 2, name: '2 hr' }, { runFrq_id: 3, name: '3 hr' }, { runFrq_id: 6, name: '6 hr' }, { runFrq_id: 12, name: '12 hr' }, { runFrq_id: 24, name: '24 hr' }];
  daysList = [{ disp: 'Sunday', value: 'sun' }, { disp: 'Monday', value: 'mon' }, { disp: 'Tuesday', value: 'tue' }, { disp: 'Wednesday', value: 'wed' }, { disp: 'Thursday', value: 'thu' }, { disp: 'Friday', value: 'fri' }, { disp: 'Saturday', value: 'sat' }];
  selectedDaysList = [];
  daysListDefaults = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  selectedAuthType: string;
  selectedReqType: string;
  selectedContentType: string;
  selTabIndex = 0;
  arrReqHeader = [];
  respTime: number;
  respSize: any;
  respContent: any;
  isTestReqvalid: boolean = false;
  mapping = {};
  companyId: number;
  poisId: number = undefined;
  isShipdateMapped:boolean = false;
  isDeliveryDateMapped:boolean = false;
  isCargoReadyDateMapped:boolean = false;
  @ViewChild('stepper') stepper: MatStepper;

  ShipmentDateForm: any;
  CargoReadyDateForm: any;
  DeliveryDateForm: any;

  shipmentDateArr: any = [];
  cargoReadyDateArr: any = [];
  deliveryDateArr: any = [];
  isMandatoryCleared: boolean = false;

  cargoMappedKey:string = '';
  shipMappedKey:string = '';
  deliveryMappedKey:string = '';

  constructor(
    private reusable: ReusableComponent,
    private authService: AuthenticationService,
    private router: Router,
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
  ) { }

  async ngOnInit(): Promise<void> {
    if (sessionStorage.getItem("PoIngestionConfig")) {
      this.companyId = JSON.parse(sessionStorage.getItem("PoIngestionConfig"))?.company_id;
    }
    this.createForm();
    this.getIngestionLookups('request_type').then(Data => { this.requestType = Data });
    this.getIngestionLookups('content_type').then(Data => { this.contentType = Data });
    await this.viewPoiMappings();
    await this.getPoIngestionData();
    this.getIngestionLookups('authorize_type').then(Data => { this.authType = Data });
    this.reusable.headHt.next(60);
    this.reusable.curRoute.next('po_ingestion');
    this.reusable.screenChange.subscribe(res => {
      this.screen = { width: res.width - 112, height: res.height - 70 };
    });
    this.userDetails = ReusableComponent.usr;
    this.reusable.titleHeader.next("PO Ingestion - Config");
  }
  
  ngOnDestroy() {
    sessionStorage.removeItem("PoIngestionConfig");
  }

  LocalConv(time) {
    var modifiedTime = "01-01-1999 " + time + " UTC";
    var Hours = (new Date(modifiedTime).getHours() < 10 ? '0' : '') + new Date(modifiedTime).getHours()
    var Mins = (new Date(modifiedTime).getMinutes() < 10 ? '0' : '') + new Date(modifiedTime).getMinutes()
    var convertedTime = Hours + ":" + Mins + ":00";
    return convertedTime;
  }

  UTCconvert(time) {
    var modifiedTime = "01-01-1999 " + time;
    var UTCHours = new Date(modifiedTime).getUTCHours();
    var UTCMins = new Date(modifiedTime).getUTCMinutes();
    var convertedTime = UTCHours + ":" + UTCMins + ":00";
    return convertedTime;
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  async getIngestionLookups(lookupName?: string) {
    const param = {
      lookup_name: lookupName,
      company_id: this.companyId
    };
    let result = await this.authService.getIngestionLookups({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if (result.success) {
      if (lookupName == 'authorize_type') {
        result.result.forEach((x) => {
          if (x.display_name == 'No Auth') {
          this.sheduleForm.get('AuthType').setValue(x.lookup_name_id);
          }
        });
      }
      return result.result
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
      return []
    }
  }

  createForm() {
    this.sheduleForm = this.formBuilder.group({
      Url: ['', Validators.compose([
        Validators.required,
        // Validators.pattern(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm),
        Validators.minLength(3),
        Validators.maxLength(500),
      ])],
      RequestType: ['', Validators.compose([
        Validators.required
      ])],
      ContentType: ['', Validators.compose([
        Validators.required
      ])],
      AuthType: ['', Validators.compose([
        Validators.required
      ])],
      UserName: ['', Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/),
    ],
      Password: [''],
      Token: [''],
      RunFrequency: [1, Validators.compose([
        Validators.required
      ])],
      BodyType: ['raw', Validators.required],
      ReqBody: [''],
      SelectedDays: ['', Validators.compose([
        Validators.required
      ])],
      StartTime: ['00:00:00', Validators.compose([
        Validators.required
      ])],
      EndTime: ['23:59:00', Validators.compose([
        Validators.required
      ])],
      ReqHeaders: this.formBuilder.array([]),
      ReqParams: this.formBuilder.array([])
    });
  }

  async getPoIngestionData() {
    this.isLoading = true;
    let param = {
      company_id: this.companyId
    }
    let result = await this.authService.getPoIngestionData({ param: this.reusable.encrypt(JSON.stringify(param)) });
    this.isLoading = false;
    if (result.success && result.rowCount > 0) {
      let res = result.result[0];
      if(res.mandatory_fields){
        this.setMandatoryFields(res.mandatory_fields)
      }
      this.poiData = res;
      if (res.filepath && !res.is_validated && !res.is_scheduled) {
        this.nextStage();
        if (!res.is_validated) {
          this.getPoIngestionMappingData();
        }
        this.stepOne = false;
        this.stepTwo = true;
        this.stepThree = false;
      } else if (res.filepath && res.is_validated && !res.is_scheduled) {
        this.nextStage();
        this.nextStage();
        this.stepOne = false;
        this.stepTwo = false;
        this.stepThree = true;
        this.createForm();
        this.onContentTypeChange();
        this.onReqTypeChange();
        this.arrReqHeader[0] = { name: 'Accept-Language', value: 'en-US,en;q=0.5' };
        this.arrReqHeader[1] = { name: 'Connection', value: 'close' };
        this.arrReqHeader[2] = { name: 'User-Agent', value: 'Mozilla/6.0 (Windows 11; WOW64; rv:45.0) Gecko/20220221 Firefox/52.0' };
        this.addDefaultReqHeaders();
        this.sheduleForm.get('SelectedDays').setValue(this.daysListDefaults);
        this.selectedDaysList = this.daysListDefaults;
      } else if (res.filepath && res.is_validated && res.is_scheduled) {
        this.nextStage();
        this.nextStage();
        this.stepOne = false;
        this.stepTwo = false;
        this.stepThree = true;
        this.getPoiScheduleData();
      }
    } else {
      if (!result.success) {
        this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
      }
    }
  }

  setMandatoryFields(mandatField:any){
    for(let key in mandatField){
      switch(key){
        case 'cargoreadydate': 
          this.CargoReadyDateForm = +mandatField[key].value?.toString().replace('-','');
          this.cargoMappedKey = mandatField[key].mapped_key
          this.cargoReadyDateMapper();   
          break;
        case 'shipdate':
          this.ShipmentDateForm = +mandatField[key].value?.toString().replace('-','');
          this.shipMappedKey = mandatField[key].mapped_key
          this.shipmentDateMapper();
          break;
        case 'deliverydate':
          this.DeliveryDateForm = +mandatField[key].value?.toString().replace('-','');
          this.deliveryMappedKey = mandatField[key].mapped_key
          this.deliveryDateMapper()
          break;
        default:
          break;
      }
      
    }
  }

  onFileChange(fileInput: any) {
    this.fileData = <File>fileInput.target.files[0];
    var allowedExtensions = /(\.xml|\.XML)$/i;
    if (allowedExtensions.exec(fileInput.target.value) && fileInput.target.value.split('.').length == 2) {
      this.fileName = this.fileData["name"];
      if (this.fileData.size <= 10240 * 1024) {
        var reader = new FileReader();
        reader.readAsDataURL(this.fileData);
        reader.onload = (_event) => {
          this.sampleDataSet = reader.result;
        }
      } else {
        this.fileName = undefined;
        this.reusable.openAlertMsg("Max file size is 10 MB", "error");
      }
    } else {
      this.reusable.openAlertMsg("File Unsupported", "error");
    }
    fileInput.target.value='';
  }

  onFileDrag(fileInput: any) {
    this.fileData = <File>fileInput[0];
    if (this.fileData.type.includes('xml')) {
      this.fileName = this.fileData.name;
      if (this.fileData.size <= 10240 * 1024) {
        var reader = new FileReader();
        reader.readAsDataURL(this.fileData);
        reader.onload = (_event) => {
          this.sampleDataSet = reader.result;
        }
      } else {
        this.fileName = undefined;
        this.reusable.openAlertMsg("Max file size is 10 MB", "error");
      }
    } else {
      this.reusable.openAlertMsg("File Unsupported", "error");
    }
  }


  async uploadDataSet() {
    let param = {
      company_id: this.companyId,
      dataset: (this.fileName == undefined) ? undefined : this.sampleDataSet,
      fileName: this.fileName
    }
    let result: any = await this.authService.uploadDataSet({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if (result.success) {
      this.nextStage();
      this.getPoIngestionMappingData();
      this.stepOne = false;
      this.stepTwo = true;
      this.stepThree = false;
      this.reusable.openAlertMsg("Document uploaded Successfully!", "info");
    }
  }

  async getPoIngestionMappingData() {
    this.isLoading = true;
    let param = {
      company_id: this.companyId
    }
    let result = await this.authService.getPoIngestionMappingData({ param: this.reusable.encrypt(JSON.stringify(param)) });
    this.isLoading = false;
    if (result.success) {
      let tKeys = result.result['targetMissingKeys'];
      let sKeys = result.result['sourceMissingKeys'];
      if (tKeys.length != 0) {
        tKeys.map((tk: any) => {
          this.targetKeys.push({ display: tk, key: tk, isSelected: false });
        });
      }
      if (sKeys.length != 0) {
        sKeys.map((sk: any) => {
          let disp = sk.split('.');
          this.sourceKeys.push({ display: disp, key: sk, isSelected: false });
          // this.mapping[sk] = "";
        });
      }     
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  targetMapping(ele) {
    this.targetKeys.map((x) => {
      if (x.display != ele.display) {
        x.isSelected = false;
      }
    });
    this.targetSelect = ele;
  }

  sourceMapping(ele) {
    this.sourceKeys.map((x) => {
      if (x.display != ele.display) {
        x.isSelected = false;
      }
    });
    this.sourceSelect = ele;
  }

  markNewKey(ele) {
    this.mapping[ele.key] = "NEW_COLUMN_PO_RAW"
    this.newKeys.push({ key: ele.key, display: ele.display });
  }

  unMarkNewKey(ele) {
    this.mapping[ele.key] = ""
    this.newKeys.map((el, idx) => {
      if (el.key == ele.key) {
        this.newKeys.splice(idx, 1);
      }
    });
  }

  markRejectedKey(ele) {
    this.mapping[ele.key] = ""
    this.rejectedKeys.push({ key: ele.key, display: ele.display });
  }

  unMarkRejectedKey(ele) {
    this.rejectedKeys.map((el, idx) => {
      if (el.key == ele.key) {
        this.rejectedKeys.splice(idx, 1);
      }
    });
    var key = ele.key;
    delete this.mapping[key];
  }

  mapSelectedKey() {
    let param = {
      display: this.sourceSelect['display'],
      targetMapped: this.targetSelect.key
    }
    this.mappedKeys.push(param);
    this.mapping[this.sourceSelect.key] = this.targetSelect.key;
    let sourceKeyIdx = this.sourceKeys.indexOf(this.sourceSelect);
    this.sourceKeys.splice(sourceKeyIdx, 1);
    let targetKeyIdx = this.targetKeys.indexOf(this.targetSelect);
    this.targetKeys.splice(targetKeyIdx, 1);
    this.sourceSelect = null;
    this.targetSelect = null;
  }

  async validationConfirm() {
    const dialogRef = this.dialog.open(ValidationConfirmDialogComponent, {
      width: '60%', 
      data: { 
        newColl: this.newKeys,
        rejectedColl: this.rejectedKeys,
        mappedColl: this.mappedKeys, 
        sourceKeys: this.sourceKeys, 
        targetKeys: this.targetKeys, 
        mapping: this.mapping, 
        companyId: this.companyId }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getPoIngestionData();
      }
      if (result == undefined && this.targetKeys.length == 0 && this.sourceKeys.length == 0) {
        this.getPoIngestionData();
      }
      this.viewPoiMappings();
    });
  }

  async getPoiScheduleData() {
    const param = {
      company_id: this.companyId,
    };
    let result = await this.authService.getPoiScheduleData({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if (result.success && result.rowCount > 0) {
      let resData = result.result[0];
      this.poisId = resData.pois_id;
      this.sheduleForm.get('Url').setValue(resData.testurl);
      this.sheduleForm.get('RequestType').setValue(resData.request_type);
      this.onReqTypeChange(resData.request_type);
      if(this.selectedReqType == 'HTTP Request (POST)') {
        this.sheduleForm.get('ReqBody').setValue(resData.request_body);
      }
      this.sheduleForm.get('ContentType').setValue(resData.content_type);
      this.sheduleForm.get('AuthType').setValue(resData.authorize_type);
      this.onAuthTypeChange(resData?.authorize_type);
      if(this.selectedAuthType == 'Basic Auth') {
        this.sheduleForm.get('UserName').setValue(resData.authorize_param['user_name']);
        this.sheduleForm.get('Password').setValue(resData.authorize_param['password']);
      } else if (this.selectedAuthType == 'Bearer Token') {
        this.sheduleForm.get('Token').setValue(resData.authorize_param['jwttoken']);
      }
      this.sheduleForm.get('RunFrequency').setValue(resData.frequency);
      this.sheduleForm.get('StartTime').setValue(this.LocalConv(resData.start_time));
      this.sheduleForm.get('EndTime').setValue(this.LocalConv(resData.end_time));
      this.respContent = resData?.test_response;
      this.respSize = resData?.test_response_size;
      this.respTime = resData?.test_response_time;
      let arrReqHeader = resData?.request_headers;
      arrReqHeader.map(head => {
        if (head.name == 'Authorization' || head.name == 'Basic Auth' || head.name == 'Accept' || head.name == 'Content-Type') {
          this.reqHeaders.push(this.formBuilder.group({
            Name: [{ value: head.name, disabled: true }],
            Value: [{ value: head.value, disabled: true }]
          }));
        } else {
          this.reqHeaders.push(this.formBuilder.group({
            Name: [head.name, Validators.required],
            Value: [head.value, Validators.required]
          }));
        }
      })
      this.sheduleForm.get('SelectedDays').setValue(resData.selected_days);
      this.selectedDaysList = resData.selected_days;
    } else {
      if (!result.success) {
        this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
      }
    }
  }

  async viewPoiMappings() {
    let param = {
      company_id: this.companyId
    }
    let result: any = await this.authService.viewPoiMappings({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if (result.success) {
      let res = result.result;
      res.map((keys: any) => {
        if(keys.targetKeys == "shipdate") {
          this.isShipdateMapped = true;
        }
        if(keys.targetKeys == "deliverydate") {
          this.isDeliveryDateMapped = true;
        }
        if(keys.targetKeys == "cargoreadydate") {
          this.isCargoReadyDateMapped = true;
        }
      });
      if(this.isShipdateMapped && this.isDeliveryDateMapped && this.isCargoReadyDateMapped) {
        this.isMandatoryCleared = true;
      }
    }
  }

  onAuthTypeChange(element?: number) {
    this.authType?.forEach((x) => {
      if (x.lookup_name_id == element) {
        this.selectedAuthType = x.display_name;
      }
    });
    if(this.selectedAuthType == 'No Auth') {
      this.sheduleForm.get('Token').setErrors(null);
      this.sheduleForm.get('UserName').setErrors(null);
      this.sheduleForm.get('Password').setErrors(null);
    } else if(this.selectedAuthType == 'Bearer Token') {
      this.sheduleForm.get('UserName').setErrors(null);
      this.sheduleForm.get('Password').setErrors(null);
    } else if (this.selectedAuthType == 'Basic Auth') {
      this.sheduleForm.get('Token').setErrors(null);
    }
  }

  onReqTypeChange(val?){
    if (val == undefined) {
      this.selectedReqType = "HTTP Request (GET)"
      this.requestType?.forEach((x) => {
        if (x.display_name == this.selectedReqType) {
          this.sheduleForm.get('RequestType').setValue(x.lookup_name_id);
          if (this.sheduleForm.get('ReqBody').hasError("required")) {
            this.sheduleForm.get('ReqBody').setErrors(null);
          }
        }
      });
    } else {
      this.requestType?.forEach((x) => {
        if (x.lookup_name_id == val) {
          this.selectedReqType = x.display_name;
        }
      });
    }
    if(this.selectedReqType == 'HTTP Request (GET)'){
      this.selTabIndex=0
      this.reqParam.clear();
    } else if(this.selectedReqType == 'HTTP Request (POST)') {
      this.selTabIndex=2
      if (this.reqParam.length == 0) {
        this.addArrReqParam();
      }
      this.onChangeBodyType('raw');
    }
    this.onContentTypeChange();
  }

  onChangeBodyType(bodyType) {
    if (bodyType == "raw") {
      if (this.sheduleForm.get('ContentType').value == null) {
        this.sheduleForm.get('ContentType').setValue(this.contentType[1])
      }
    } else {
      this.removeReqHeader("Content-Type");
      this.reqHeaders.push(this.formBuilder.group({
        Name: ['Content-Type', Validators.required],
        Value: ['application/x-www-form-urlencoded', Validators.required]
      }));
      if (this.reqParam.length == 0) {
        this.addArrReqParam();
      }
      if (this.sheduleForm.get('ReqBody').hasError("required")) {
        this.sheduleForm.get('ReqBody').setErrors(null);
      }
    }
  }

  get reqParam() {
    return this.sheduleForm.get('ReqParams') as FormArray;
  }

  addArrReqParam() {
    this.reqParam.push(this.formBuilder.group({
      ParamName: ['', Validators.required],
      ParamValue: ['', Validators.required]
    }));
  }

  removeReqParamElement(idx) {
    this.reqParam.removeAt(idx);
  }

  async viewMapping() {
    this.dialog.open(MappingViewDialogComponent, {
      data: { companyId: this.companyId }
    });
  }

  // deleteFile(f) {
  //   this.fileData = this.fileData.filter(function (w) { return w.name != f.name });
  //   this.reusable.openAlertMsg("Successfully delete!", "info");
  // }

  // deleteFromArray(index) {
  //   this.fileData.splice(index, 1);
  // }

  async deleUploadedFile() {
    this.isLoading = true;
    let param = {
      company_id: this.companyId,
    }
    let result = await this.authService.deleUploadedFile({ param: this.reusable.encrypt(JSON.stringify(param)) });
    this.isLoading = false;
    if (result.success) {
      this.prevStage();
      delete this.fileData;
      delete this.fileName;
      this.clearMappingArrays();
      this.stepOne = true;
      this.stepTwo = false;
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  async redoMapping() {
    this.isLoading = true;
    let param = {
      company_id: this.companyId,
    }
    let result = await this.authService.deleteMappings({ param: this.reusable.encrypt(JSON.stringify(param)) });
    this.isLoading = false;
    if (result.success) {
      this.sheduleForm.reset();
      delete this.respTime;
      delete this.respSize;
      delete this.respContent;
      this.arrReqHeader = [];
      this.clearMappingArrays();
      this.clearFormArray(this.reqHeaders);
      this.clearFormArray(this.reqParam);
      this.prevStage();
      this.getPoIngestionMappingData();
      this.stepOne = false;
      this.stepTwo = true;
      this.stepThree = false;
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  clearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0)
    }
  }

  changeTime() {
    if(this.UTCconvert(this.sheduleForm.get("StartTime").value) == this.UTCconvert(this.sheduleForm.get("EndTime").value)){
      this.sheduleForm.get('EndTime').reset();
      this.reusable.openAlertMsg("Start time and End time cannot be same", "error");
    }
    if(this.UTCconvert(this.sheduleForm.get("StartTime").value) > this.UTCconvert(this.sheduleForm.get("EndTime").value)){
      this.sheduleForm.get('EndTime').reset();
      this.reusable.openAlertMsg("End time must not be greater than Start time", "error");
    }
  }

  addDefaultReqHeaders() {
    this.arrReqHeader.map(head => {
      this.reqHeaders.push(this.formBuilder.group({
        Name: [head.name, Validators.required],
        Value: [head.value, Validators.required]
      }));
    })
  }

  get reqHeaders() {
    return this.sheduleForm.get('ReqHeaders') as FormArray;
  }

  addArrReqHeader() {
    this.reqHeaders.push(this.formBuilder.group({
      Name: ['', Validators.required],
      Value: ['', Validators.required]
    }));
  }

  removeReqHeaderElement(idx) {
    this.reqHeaders.removeAt(idx);
  }

  getReqHeadersControls() {
    return (this.sheduleForm.get('ReqHeaders') as FormArray).controls;
  }

  getReqParamsControls() {
    return (this.sheduleForm.get('ReqParams') as FormArray).controls;
  }

  onContentTypeChange(type?: number) {
    if (type == undefined) {
      this.selectedContentType = "XML"
      this.contentType?.forEach((x) => {
        if (x.display_name == this.selectedContentType) {
          this.sheduleForm.get('ContentType').setValue(x.lookup_name_id);
        }
      });
    } else {
      this.contentType?.forEach((x) => {
        if (x.lookup_name_id == type) {
          this.selectedContentType = x.display_name;
        }
      });
      this.removeReqHeader("Content-Type");
      this.removeReqHeader("Accept");
    }
    if (this.selectedContentType == 'XML') {
      this.reqHeaders.controls.unshift(this.formBuilder.group({
        Name: [{ value: 'Content-Type', disabled: true }],
        Value: [{ value: 'application/xml', disabled: true }]
      }),
      this.formBuilder.group({
        Name: [{ value: 'Accept', disabled: true }],
        Value: [{ value: 'application/xml', disabled: true }]
      }));
      if(this.selectedReqType == "HTTP Request (POST)"){
        this.sheduleForm.get('ReqBody').setValidators([Validators.required, this.validateXML]);
        this.sheduleForm.get('ReqBody').setValue(null);
      } else {
        this.sheduleForm.get('ReqBody').setValidators(null);
        this.sheduleForm.get('ReqBody').setValue(null);
      }
    } else if (this.selectedContentType == 'JSON') {
      this.reqHeaders.controls.unshift(this.formBuilder.group({
        Name: [{ value: 'Content-Type', disabled: true }],
        Value: [{ value: 'application/json', disabled: true }]
      }),
      this.formBuilder.group({
        Name: [{ value: 'Accept', disabled: true }],
        Value: [{ value: 'application/json', disabled: true }]
      }));
      if(this.selectedReqType == "HTTP Request (POST)"){
        this.sheduleForm.get('ReqBody').setValidators([Validators.required, this.validateJson, Validators.maxLength(6000)]);
        this.sheduleForm.get('ReqBody').setValue(null);
      } else {
        this.sheduleForm.get('ReqBody').setValidators(null);
        this.sheduleForm.get('ReqBody').setValue(null);
      }
    }
    console.log(this.sheduleForm);
  }

  validateXML(controls) {
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(controls.value, "text/xml");
    let parsererrorColl = xmlDoc.getElementsByTagName("parsererror");
    if (parsererrorColl.length > 0) {
      return { 'validateXML': true }
    } else {
      return null;
    }
  }

  validateJson(controls) {
    try {
      let jsonParse = JSON.parse(controls.value);
      return null;
    } catch {
      return { 'validateJson': true }
    }
  }

  async updateReq() {
    this.removeReqHeader("Authorization");
    if (this.selectedAuthType == 'No Auth') {
      this.sheduleForm.get("UserName").setValue(null);
      this.sheduleForm.get("Password").setValue(null);
      this.sheduleForm.get("Token").setValue(null);
    } else if (this.selectedAuthType == 'Basic Auth') {
      if (this.sheduleForm.get("UserName").value == null || this.sheduleForm.get("UserName").value == '') {
        // this.reusable.openAlertMsg("For Basic Authentication, username is mandatory", "error");
        return;
      } else if (this.sheduleForm.get("Password").value == null || this.sheduleForm.get("Password").value == '') {
        // this.reusable.openAlertMsg("For Basic Authentication, password is mandatory", "error");
        return;
      }
      this.sheduleForm.get("Token").setValue(null)
      let val = this.sheduleForm.get("UserName").value + ':' + this.sheduleForm.get("Password").value
      let auth = "Basic " + btoa(val);
      this.reqHeaders.controls.unshift(this.formBuilder.group({
        Name: [{ value: 'Authorization', disabled: true }],
        Value: [{ value: auth, disabled: true }]
      }));
    } else {
      if (this.sheduleForm.get("Token").value == null || this.sheduleForm.get("Token").value == '') {
        this.reusable.openAlertMsg("For JWT Token, token is mandatory", "error");
        return;
      }
      this.sheduleForm.get("UserName").setValue(null);
      this.sheduleForm.get("Password").setValue(null);
      this.reqHeaders.controls.unshift(this.formBuilder.group({
        Name: [{ value: 'Authorization', disabled: true }],
        Value: [{ value: "Bearer " + this.sheduleForm.get("Token").value, disabled: true }]
      }));
    }
  }

  removeReqHeader(headerName: string) {
    let length = this.reqHeaders.length;
    let i = 0;
    while (i < length) {
      if (this.reqHeaders.controls[i] != undefined) {
        if (this.reqHeaders.controls[i].get("Name").value == headerName) {
          this.reqHeaders.removeAt(i);
          length = this.reqHeaders.length;
          i = 0;
        } else {
          i++;
        }
      } else {
        i++;
      }
    }
  }

  async sendRequest() {
    this.isLoading = true;
    this.respTime = undefined;
    this.respSize = undefined;
    let reqMethod = this.selectedReqType;
    let reqHeaders = {};
    let reqParams = {};
    let bodyType = null;
    if (reqMethod == "HTTP Request (GET)") {
      bodyType = null;
    } else {
      bodyType = this.sheduleForm.get("BodyType").value;
    }
    let headerLength = this.reqHeaders.length;
    for (let i = 0; i < headerLength; i++) {
      reqHeaders[this.reqHeaders.controls[i].get('Name').value] = this.reqHeaders.controls[i].get('Value').value;
    }
    let param = {
      url: this.sheduleForm.get('Url').value,
      headers: JSON.stringify(reqHeaders),
      bodyType: bodyType,
      method: reqMethod == 'HTTP Request (GET)' ? 'GET' : 'POST'
    }
    if (reqMethod == 'HTTP Request (POST)') {
      if (this.sheduleForm.get('BodyType').value == "raw") {
        if (this.sheduleForm.get('ReqBody').value != null && this.sheduleForm.get('ReqBody').value != '') {
          param['body'] = this.sheduleForm.get('ReqBody').value;
          param['contentType'] = this.selectedContentType == 'JSON' ? 'json' : 'text';
        } else {
          this.reusable.openAlertMsg("For Post Method and body type raw, Body cannot be empty", "error");
          this.isLoading = false;
          return;
        }
      } else {
        let paramLength = this.reqParam.length;
        if (paramLength == 0) {
          this.reusable.openAlertMsg("For Post and body type form-data, Parameter must be defined", "error");
          this.isLoading = false;
          return;
        }
        let paramExist = false;
        for (let i = 0; i < paramLength; i++) {
          let paramName = this.reqParam.controls[i].get('ParamName').value;
          let paramVal = this.reqParam.controls[i].get('ParamValue').value;
          if (paramName != "" && paramVal != "" && paramName != undefined && paramVal != undefined) {
            reqParams[paramName] = paramVal;
            paramExist = true;
          }
        }
        if (!paramExist) {
          this.reusable.openAlertMsg("For Post and body type form-data, Parameter must be defined", "error");
          this.isLoading = false;
          return;
        } else {
          param['body'] = JSON.stringify(reqParams);
        }
      }
    }
    let startTime = new Date().getTime();
    this.respContent = await this.authService.poIngestionTestRequest({ param: this.reusable.encrypt(JSON.stringify(param)) });
    this.respTime = new Date().getTime() - startTime
    this.isLoading = false;
    if (this.respContent.success) {
      this.isTestReqvalid = true;
      let contLength = this.respContent.headers['content-length'];
      this.respSize = this.formatBytes(contLength);
    }
    this.changeTab(4);
  }

  cargoReadyDateMapper(val?:any) {
    let days = this.CargoReadyDateForm == undefined ? 0 : this.CargoReadyDateForm;
    this.cargoMappedKey = val ? val : this.cargoMappedKey
    if(days <= 0){
      this.isMandatoryCleared = false;
      return;
    }
    this.cargoReadyDateArr = this.cargoMappedKey ? { key: 'cargoreadydate', mapped_key: this.cargoMappedKey, value: parseInt('-'+days) } : {};
    if((this.isShipdateMapped || Object.keys(this.shipmentDateArr).length >= 1 ) && (this.isDeliveryDateMapped || Object.keys(this.deliveryDateArr).length >= 1) && this.cargoMappedKey){
      this.isMandatoryCleared = true;
    }
  }

  shipmentDateMapper(val?:any) {
    let days = this.ShipmentDateForm == undefined ? 0 : this.ShipmentDateForm;
    this.shipMappedKey = val ? val : this.shipMappedKey
    if(days <= 0){
      this.isMandatoryCleared = false;
      return;
    }
    this.shipmentDateArr = this.shipMappedKey ? { key: 'shipdate', mapped_key: this.shipMappedKey, value: this.shipMappedKey == 'cargoreadydate' ? days : parseInt('-'+days) } : {};
    if((this.isDeliveryDateMapped || Object.keys(this.deliveryDateArr).length >= 1) && (this.isCargoReadyDateMapped || Object.keys(this.cargoReadyDateArr).length >= 1) && this.shipMappedKey) {
      this.isMandatoryCleared = true;
    }

  }

  deliveryDateMapper(val?:any) {
    let days = this.DeliveryDateForm == undefined ? 0 : this.DeliveryDateForm;
    this.deliveryMappedKey = val ? val : this.deliveryMappedKey
    if(days <= 0){
      this.isMandatoryCleared = false;
      return;
    }
    this.deliveryDateArr = this.deliveryMappedKey ? { key: 'deliverydate', mapped_key: this.deliveryMappedKey, value: days } : {};
    if((this.isCargoReadyDateMapped || Object.keys(this.cargoReadyDateArr).length == 3) &&  (this.isShipdateMapped || Object.keys(this.shipmentDateArr).length == 3) && this.deliveryMappedKey){
      this.isMandatoryCleared = true;
    }
  }

  async schedule() {
    this.isLoading = true;
    let mandatoryFields = {};
    let reqMethod = this.selectedReqType;
    if( this.cargoReadyDateArr.length != 0) {
      mandatoryFields['cargoreadydate'] = this.cargoReadyDateArr;
    }
    if( this.shipmentDateArr.length != 0) {
      mandatoryFields['shipdate'] = this.shipmentDateArr;
    }
    if( this.deliveryDateArr.length != 0) {
      mandatoryFields['deliverydate'] = this.deliveryDateArr;
    }
    let arrReqHeader = [];
    let arrReqParam = [];
    let bodyType = null;
    if (reqMethod == "HTTP Request (GET)") {
      bodyType = null;
    } else {
      bodyType = this.sheduleForm.get("BodyType").value;
    }
    for (let i = 0; i < this.reqHeaders.length; i++) {
      arrReqHeader.push({ name: this.reqHeaders.controls[i].get("Name").value, value: this.reqHeaders.controls[i].get("Value").value });
    }
    if (reqMethod == 'HTTP Request (POST)') {
      for (let i = 0; i < this.reqParam.length; i++) {
        arrReqParam.push({ name: this.reqParam.controls[i].get("ParamName").value, value: this.reqParam.controls[i].get("ParamValue").value });
      }
    }
    let authType = this.selectedAuthType;
    let authParam = null;
    if (authType == 'Basic Auth') {
      authParam = { user_name: this.sheduleForm.get('UserName').value, password: this.sheduleForm.get('Password').value };
    } else if (authType == 'JWT Token') {
      authParam = { jwttoken: this.sheduleForm.get('Token').value };
    }
    let scheduleData = {
      pois_id: this.poisId == undefined ? null : this.poisId,
      poi_id: this.poiData.poi_id,
      company_id: this.companyId,
      request_type: this.sheduleForm.get("RequestType").value,
      content_type: this.sheduleForm.get("ContentType").value,
      authorize_type: this.sheduleForm.get("AuthType").value,
      url: this.sheduleForm.get('Url').value,
      selected_days: this.selectedDaysList,
      timezone_offset: new Date().getTimezoneOffset(),
      frequency: this.sheduleForm.get('RunFrequency').value,
      start_time: this.sheduleForm.get("StartTime").value == '' || this.sheduleForm.get("StartTime").value == undefined ? null : this.UTCconvert(this.sheduleForm.get("StartTime").value),
      end_time: this.sheduleForm.get("EndTime").value == '' || this.sheduleForm.get("EndTime").value == undefined ? null : this.UTCconvert(this.sheduleForm.get("EndTime").value),
      mandatory_fields: mandatoryFields,
      request_headers: JSON.stringify(arrReqHeader),
      authorize_param: authParam,
      test_response: this.respContent,
      test_response_size: this.respSize,
      test_response_time: this.respTime,
      req_body_type: bodyType,
      request_parameters: JSON.stringify(arrReqParam),
      request_body: this.sheduleForm.get('ReqBody').value == null ? '' : this.sheduleForm.get('ReqBody').value,
    };
    let result: any = await this.authService.schedulePoIngestion({ param: this.reusable.encrypt(JSON.stringify(scheduleData)) });
    this.isLoading = false;
    if (result.success) {
      this.router.navigate(['/nav/po_ingestion']);
      this.reusable.openAlertMsg("Scheduled", "info");
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  onSelectDaysChange(days) {
    this.selectedDaysList = days;
  }

  nextStage() {
    this.stepper.next();
  }

  prevStage() {
    this.stepper.previous();
  }

  changeTab(tabIdx) {
    this.selTabIndex = tabIdx;
  }

  onClose() {
    this.router.navigate(['/nav/po_ingestion']);
  }

  clearMappingArrays() {
    this.targetKeys = [];
    this.sourceKeys = [];
    this.mapping = {};
    this.newKeys = [];
    this.rejectedKeys = [];
    this.mappedKeys = [];
  }
}

@Component({
  selector: 'validation-confirm-dialog',
  templateUrl: './validation-confirm-dialog.html',
  styleUrls: ['./po-ingestion.component.css'],
})

export class ValidationConfirmDialogComponent implements OnInit {
  isLoading: boolean;
  mappedCollData: any;
  newCollData: any;
  rejectedColl: any;
  paramCollData: any;
  sourceKeys: any;
  targetKeys: any;
  mapError: boolean = false;
  mapSkip: boolean = false;
  companyId: number;
  unMappedTargets = [];

  constructor(
    private reusable: ReusableComponent,
    private authService: AuthenticationService,
    public dialogRef: MatDialogRef<ValidationConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ValidationConfirmDialogComponent,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.mappedCollData = this.data['mappedColl'];
    this.newCollData = this.data['newColl'];
    this.rejectedColl = this.data['rejectedColl'];
    this.paramCollData = this.data['mapping'];
    this.sourceKeys = this.data['sourceKeys'];
    this.targetKeys = this.data['targetKeys'];
    this.companyId = this.data['companyId'];
    // if (this.targetKeys.length == 0 && this.sourceKeys.length == 0) {
    //   this.mapSkip = true;
    // } else if (this.targetKeys.length != 0) {
    //   this.mapError = true
    // }
    this.targetKeys.map((t:any)=>{
      this.unMappedTargets.push(t.key);
    });

    if (this.unMappedTargets.includes('deliverydate') && this.unMappedTargets.includes('shipdate') && this.unMappedTargets.includes('cargoreadydate') ){
      this.mapError = true;
    }
  }

  async validatePoiMapping() {
    let param = {
      company_id: this.companyId,
      mappedKeys: this.paramCollData,
      unMappedTargetKeys: this.unMappedTargets
    }
    let result: any = await this.authService.validatePoiMapping({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if (result.success) {
      this.onClose(true)
      this.reusable.openAlertMsg("Mapping Validated!", "info");
    } else {
      this.onClose(false)
    }
  }

  onClose(bool) {
    this.dialogRef.close(bool);
  }
}

export class FileNode {
  children: FileNode[];
  filename: string;
  type: any;
}

@Component({
  selector: 'mapping-view-dialog',
  templateUrl: './mapping-view-dialog.html',
  styleUrls: ['./po-ingestion.component.css'],
})

export class MappingViewDialogComponent implements OnInit {
  isLoading: boolean;
  mappedCollData = [];
  companyId: number;

  constructor(
    private reusable: ReusableComponent,
    private authService: AuthenticationService,
    @Inject(MAT_DIALOG_DATA) public data: MappingViewDialogComponent,
    public dialogRef: MatDialogRef<MappingViewDialogComponent>,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.companyId = this.data['companyId'];
    this.viewPoiMappings();
  }

  async viewPoiMappings() {
    let param = {
      company_id: this.companyId
    }
    let result: any = await this.authService.viewPoiMappings({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if (result.success) {
      let res = result.result;
      res.map((keys: any) => {
        keys.sourceKeys = keys.sourceKeys.replaceAll('[0]', '');
        keys.sourceKeyDisplay = keys.sourceKeys.split('.');
      });
      this.mappedCollData = res;
    }
  }

  onClose(bool) {
    this.dialogRef.close(bool);
  }
}

@Component({
  selector: 'app-poi-schema-validation',
  templateUrl: './po-ingestion-schema.component.html',
  styleUrls: ['./po-ingestion.component.css'],
})
export class PoIngestionSchemaComponent implements OnInit {
  isLoading: boolean = false;
  userDetails: any;
  screen: { width: number; height: number; };
  companyId: number;

  schemaErrorKeys = [];
  unMappedTargets = [];
  mapping = {};


  mappedKeys = [];
  newKeys = [];
  
  constructor(
    private reusable: ReusableComponent,
    private authService: AuthenticationService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.reusable.headHt.next(60);
    this.reusable.titleHeader.next("Schema Errors");
    this.reusable.curRoute.next('po_ingestion');
    if (sessionStorage.getItem("PoIngestionConfig")) {
      this.companyId = JSON.parse(sessionStorage.getItem("PoIngestionConfig")).company_id;
    }
    this.reusable.screenChange.subscribe(res => {
      this.screen = { width: res.width - 112, height: res.height - 70 };
    });
    this.userDetails = ReusableComponent.usr;
    this.getPoIngestionSchemaErrors();
    this.getPoiUnmappedTargets();
  }

  async getPoIngestionSchemaErrors() {
    this.isLoading = true;
    let param = {
      company_id: this.companyId
    }
    let result = await this.authService.getPoIngestionSchemaErrors({ param: this.reusable.encrypt(JSON.stringify(param)) });
    this.isLoading = false;
    if (result.success && result.rowCount > 0) {
      let sErrors = result.result;
      if (sErrors.length != 0) {
        sErrors.map((schema: any) => {
          let disp = schema.missing_key_hierarchy.split('.');
          this.schemaErrorKeys.push({ poi_id: schema.poi_id, missing_key: schema.missing_key, missing_key_hierarchy: schema.missing_key_hierarchy, display: disp, isSelected: false, isRejected: false, targetKey: '' });
        });
      }     
    } else {
      this.goBack();
      if(!result.success){
        this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
      }
    }
  }

  async getPoiUnmappedTargets() {
		const param = {
			company_id: this.companyId,
		}
		let result = await this.authService.getPoiUnmappedTargets({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			this.unMappedTargets = result.result[0].unmapped_targets;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

  async viewMapping() {
    this.dialog.open(MappingViewDialogComponent, {
      data: { companyId: this.companyId }
    });
  }

  markNewKey(ele) {
    if(ele.targetKey != '' && ele.targetKey != 'NEW_COLUMN_PO_RAW'){
      this.unMappedTargets.push(ele.targetKey);
    }
    this.mapping[ele.missing_key_hierarchy] = "NEW_COLUMN_PO_RAW"
    ele.targetKey = '';
    if(this.mapping[ele.missing_key_hierarchy].length >0){
      this.mapping[ele.missing_key_hierarchy]= '';
    }
  }

  markRejectedKey(ele) {
    this.mapping[ele.missing_key_hierarchy] = ""
    if(ele.targetKey != '' && ele.targetKey != 'NEW_COLUMN_PO_RAW'){
      this.unMappedTargets.push(ele.targetKey);
    }
    ele.targetKey = '';
    if(this.mapping[ele.missing_key_hierarchy].length >0){
      this.mapping[ele.missing_key_hierarchy]= '';
    }


  }

  unMarkNewKey(ele) {
    // this.mapping[ele.key] = "" // doubt here
    this.mapping[ele.missing_key_hierarchy] = "" // doubt here
    this.newKeys.map((el, idx) => {
      if (el.key == ele.key) {
        this.newKeys.splice(idx, 1);
      }
    });
  }

  unMarkRejectedKey(ele) {
    var key = ele.missing_key_hierarchy;
    delete this.mapping[key];
    ele.targetKey = '';
  }

  OnUMTargetsChange(key: string, sources:any, eleRef:any) {
    if(sources.targetKey != '' && sources.targetKey != 'NEW_COLUMN_PO_RAW'){
      this.unMappedTargets.push(sources.targetKey);
    }
    sources.targetKey = key;
    sources.isNewColumn = false;
    sources.isRejectedColumn = false;
    this.mapping[sources.missing_key_hierarchy] = key;
    this.unMappedTargets.map((el, idx) => {
      if (el == key) {
        this.unMappedTargets.splice(idx, 1);
      }
    });
    eleRef.value=null;
  }

  unMapTargetKey(sources: any) {
    sources.isNewColumn = false;
    sources.isRejectedColumn = false;
    this.mapping[sources.missing_key_hierarchy] = '';
    if(this.mapping[sources.missing_key_hierarchy].length >0){
      this.mapping[sources.missing_key_hierarchy]= '';
    }
    if(sources.targetKey != '' && sources.targetKey != 'NEW_COLUMN_PO_RAW')
      this.unMappedTargets.push(sources.targetKey);
    sources.targetKey = '';
  }

  async applyAll() {
    let param = {
      company_id: this.companyId,
      mappedKeys: this.mapping,
      unMappedTargetKeys: this.unMappedTargets
    }
    let result: any = await this.authService.validatePoiSchema({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if (result.success) {
      this.reusable.openAlertMsg("Schema Validated!", "info");
      this.schemaErrorKeys = [];
      this.getPoIngestionSchemaErrors();
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  goBack() {
    this.router.navigate(['/nav/po_ingestion']);
  }
}

@Component({
  selector: 'app-poi-master-validation',
  templateUrl: './po-ingestion-master.component.html',
  styleUrls: ['./po-ingestion.component.css'],
})
export class PoIngestionMasterComponent implements OnInit {
  isLoading: boolean = false;
  userDetails: any;
  screen: { width: number; height: number; };
  companyId: number;
  companyTypeId: number;
  masterErrors = [];
  consigneeList = new MatTableDataSource([]);
  portList = new MatTableDataSource([]);
  selectedConsignee = {};
  incotermsList = [];
  ConsigneeSelected: any;
  PortIncoSelected: any;
  companyAlreadyExists: boolean = false;
  existingCompanyId: number;
  
  constructor(
    private reusable: ReusableComponent,
    private authService: AuthenticationService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.reusable.headHt.next(60);
    this.reusable.titleHeader.next("Master Validation");
    this.reusable.curRoute.next('po_ingestion');
    if (sessionStorage.getItem("PoIngestionConfig")) {
      this.companyId = JSON.parse(sessionStorage.getItem("PoIngestionConfig")).company_id;
      this.companyTypeId = JSON.parse(sessionStorage.getItem("PoIngestionConfig")).company_type_id;
    }
    this.reusable.screenChange.subscribe(res => {
      this.screen = { width: res.width - 112, height: res.height - 70 };
    });
    this.userDetails = ReusableComponent.usr;
    this.getConsigneeListForMasterValidation();
    this.getPortListForMasterValidation();
    this.getIngestionLookups('incoterms').then(Data => { this.incotermsList = Data });
  }

  async getPoIngestionMasterErrors() {
    this.masterErrors = [];   
    this.isLoading = true;
    let param = {
      company_id: this.companyId
    }
    let result = await this.authService.getPoIngestionMasterErrors({ param: this.reusable.encrypt(JSON.stringify(param)) });
    this.isLoading = false;
    if (result.success && result.rowCount > 0) {
      let mErrors = result.result;
      this.masterErrors = mErrors;
      this.masterErrors.map(async (mas) =>{
        if(mas.is_invite_sent) {
          let param1 = {
            company_id: this.companyId,
            invitee_company_name: mas.error_value,
          }
          let res2 = await this.authService.getCompanyInviteData({ param: this.reusable.encrypt(JSON.stringify(param1)) });
          if(res2.success) {
            let data =  res2.result[0];
            mas["company_invite_id"] = data?.company_invite_id;
          }
        } else {
          let companyExists = this.consigneeList.data.filter((comp) => comp.company_name.replaceAll(' ','').toLowerCase()  == mas.error_value.replaceAll(' ','').toLowerCase());
          console.log('companyExists',companyExists);
          mas['is_company_already_exists'] = companyExists.length > 0 ? true : false;
          mas.is_company_already_exists ? mas['existing_company_id'] = companyExists[0].company_id :  mas['existing_company_id'] = null;
        }
      });
    } else {
      this.goBack();
      if(!result.success){
        this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
      }
    }
  }

  async getConsigneeListForMasterValidation() {
    this.isLoading = true;
    let result = await this.authService.getConsigneeListForMasterValidation();
    this.isLoading = false;
    if (result.success) {
      this.consigneeList = new MatTableDataSource(result.result);
      this.getPoIngestionMasterErrors();
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  searchCompany(value) {
    let data = this.consigneeList.data.filter(val => val.company_name.toLowerCase().includes(value.toLowerCase()));
    this.consigneeList.filteredData =  data;
  }

  searchPorts(value) {
    let data = this.portList.data.filter(val => val.port_name.toLowerCase().includes(value.toLowerCase()) || val.country.replaceAll(' ','').toLowerCase().includes(value.toLowerCase().replaceAll(' ','')));
    this.portList.filteredData =  data;
  }

  unMatchMappedCompany(mErrors) {
    this.ConsigneeSelected = null;
    mErrors.matchedWithExisting = null;
  }
  
  async getPortListForMasterValidation() {
    this.isLoading = true;
    let result = await this.authService.getPortListForMasterValidation();
    this.isLoading = false;
    if (result.success) {
      this.portList =  new MatTableDataSource(result.result);
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  OnConsigneeChange(element:any, mErrors:any, eleRef) {
    mErrors.matchedWithExisting = element.company_name;
    mErrors.matchedCompanyId = element.company_id;
    eleRef.value=null;
  }

  OnPortChange(element:any, mErrors:any, eleRef) {
    mErrors.matchedWithExisting = element.port_name;
    mErrors.matchedPortId = element.port_id;
    eleRef.value=null;
  }
  OnIncotermsChange(element:any, mErrors:any, eleRef) {
    mErrors.matchedWithExisting = element.display_name;
    mErrors.matchedIncotermId = element.lookup_name_id;
    eleRef.value=null;
  }

  async inviteNewCompany(companyName:string, ele:any) {
    this.companyAlreadyExists = ele.is_company_already_exists;
    this.existingCompanyId = ele.existing_company_id;
    console.log(this.companyAlreadyExists, this.existingCompanyId);
    if(this.companyAlreadyExists && this.existingCompanyId != null) {
      console.log('ele,',ele)
      let param = {
        invitee_company_id: this.existingCompanyId,
        invited_company_id: this.companyId,
        invitee_company_name: ele.error_value,
        poi_master_error_id: ele.poi_me_id,
      }
      console.log('param', param)
      let result = await this.authService.insInviteExistingSupplier({ param: this.reusable.encrypt(JSON.stringify(param)) });
      if (result.success) {
        ele.is_invite_sent = true;
        setTimeout(() => {
				  this.dialog.open(ConfirmDialog, {
					  data: {
							type: 'info-success',
							content: "Invite Sent Successfully !",
						}
					});
				}, 1000);
      } else {
        this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
      }
    } else {
      setTimeout(() => {
        const dialogRef = this.dialog.open(InviteCompanyAddDialogComponent, {
          height: '100%',
          width: '820px',
          position: { right: '0px' },
          data: { parentCompanyId: this.companyId, inviteCompanyName: companyName, parentCompanyType: this.companyTypeId  , poi_me_id: ele.poi_me_id , error_data: ele},
          panelClass: 'dialogclass',
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.updMasterError(ele);
          }
        });
      }, 100);
    }
	}

  addNew(content:string, ele:any) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        type: 'info-success',
        content: content,
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.applyAll(ele);
      }
    });
	}
  
  async addNewIncoterm(ele:any) {
    let param = { 
      company_id: this.companyId,
      error_value: ele.error_value,
      error_type: ele.error_type,
      poi_id: ele.poi_id
    };
    let upd = await this.authService.addNewIncoterm({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if (upd.success) {
      const dialogRef = this.dialog.open(ConfirmDialog, {
        data: {
          type: 'info-success',
          content: 'Incoterm  '+ ele.error_value + ' will be added.',
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if(result){
          this.getPoIngestionMasterErrors();
        }
      });
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(upd), "error");
    }
  }

  async updMasterError(ele: any){
    let param = { 
      poi_me_id: ele.poi_me_id
    };
    let upd = await this.authService.updMasterErrors({ param: JSON.stringify(param) });
    if (upd.success) {
      this.getPoIngestionMasterErrors();
     }
  }

	async delInviteCompany(ele: any) {
		let conf = confirm("Do you want to Delete this Company Invite?");
		if (!conf) return;
    this.isLoading = true;
		let param = { 
      poi_id: ele.poi_id,
      error_type: ele.error_type,
      invitee_company_name: ele.error_value,
      poi_master_error_id: ele.poi_me_id,
      company_invite_id: ele.company_invite_id,
    };
		let result = await this.authService.delInviteFromMasterValidation({ param: JSON.stringify(param) });
    // let result = { success : true }
		if (result.success) {
      this.isLoading = false;
			setTimeout(() => {
				this.dialog.open(ConfirmDialog, {
					data: {
						type: 'info-success',
						content: "Invite Deleted",
					}
				});
			}, 100);
			this.getPoIngestionMasterErrors();
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

  goBack() {
    this.router.navigate(['/nav/po_ingestion']);
  }

  async getIngestionLookups(lookupName?: string) {
    const param = {
      lookup_name: lookupName,
      company_id: this.companyId
    };
    let result = await this.authService.getIngestionLookups({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if (result.success) {
      return result.result
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
      return []
    }
  }

  async applyAll(data: any) {
    let result: any = await this.authService.validatePoiMaster({ param: this.reusable.encrypt(JSON.stringify(data)) });
    if (result.success) {
      this.reusable.openAlertMsg(result.message, "info");
      this.getPoIngestionMasterErrors();
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }
}

@Component({
  selector: 'app-poi-status-validation',
  templateUrl: './po-ingestion-status.component.html',
  styleUrls: ['./po-ingestion.component.css'],
})
export class PoIngestionStatusComponent implements OnInit {
  isLoading: boolean = false;
  userDetails: any;
  screen: { width: number; height: number; };
  companyId: number;
	runningStatusColl = new MatTableDataSource([]);
	dispcolumn = ["executed_on", "success", "response", "schema", "master"];
  currentPage: number = 0;
  prevPage: number;
  spliceIndex = 0;
  pageSize: number = 0;
  contentLength: number;
  height: number;
	width: number;
	poiTableHeight: number;
  isMobileView:Boolean = false;
  offset = 0; limit = 40; isFetched = false;

  @ViewChild('TablePaginator', { static: true }) tablePaginator: MatPaginator;
  @ViewChild('TableSort', { static: true }) tableSort: MatSort;
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
    private router: Router,
    public dialog: MatDialog,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.reusable.headHt.next(60);
    this.reusable.titleHeader.next("PO Ingestion Running Status");
    this.reusable.curRoute.next('po_ingestion');
    if (sessionStorage.getItem("PoIngestionConfig")) {
      this.companyId = JSON.parse(sessionStorage.getItem("PoIngestionConfig")).company_id;
    }
    this.reusable.screenChange.subscribe(res => {
      this.screen = { width: res.width - 112, height: res.height - 70 };
    });
    this.userDetails = ReusableComponent.usr;
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
      this.poiTableHeight = this.height - 160;
    });
    this.getPoiRunningStatus(this.offset, this.limit);
  }

  handlePagination = (scrolled: boolean) => {
    if (scrolled) {
      this.offset += this.limit;
      this.getPoiRunningStatus(this.offset, this.limit);
    }
  }

  public getPaginatorData(event: PageEvent): PageEvent {
    if (!this.tablePaginator.hasNextPage()) {
      if(this.hasMore())
        this.handlePagination(true);
    }
    return event;
  }

  hasMore(){
    return this.isFetched;
  }

  async getPoiRunningStatus(offset?:number, limit?:number) {
    let reset = false;
    if (offset == undefined){offset = this.offset = 0; reset = true; } 
    if (limit == undefined) limit = 40;
		const param = {
			company_id: this.companyId,
      offset,
      limit
		}
		let result = await this.authService.getPoiRunningStatus({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
      this.isFetched = true;
      if(this.runningStatusColl.data.length == 0 || reset){
			this.runningStatusColl = new MatTableDataSource(result.result);
      } else {
        let newData = this.runningStatusColl.data.concat(result.result);
			this.runningStatusColl = new MatTableDataSource(newData);
      }
			this.runningStatusColl.sort = this.tableSort;
      this.runningStatusColl.paginator = this.paginator;
      this.pageSize = Math.round( this.poiTableHeight / 50);
      this.paginator._changePageSize(this.pageSize);
			// this.runningStatusColl = new MatTableDataSource(result.result);
      this.contentLength = this.runningStatusColl.data.length;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

  sortData(sort: Sort) {
    this.runningStatusColl.data = this.runningStatusColl.data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'executed_on':
          return this.compare(a.received_on, b.received_on, isAsc);
        case 'response':
          return this.compare(a.response, b.response, isAsc);
        default:
          return 0;
      }
    });
  }
  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  changePage(event) {
    this.currentPage = event.pageIndex;
    this.prevPage = event.previousPageIndex;
    this.getPaginatorData(event)
    // this.shipmentBookingColl.filteredData = this.shipmentBookingColl.data.splice(this.spliceIndex, this.pageSize);
    // this.spliceIndex += this.pageSize;
  }

  goBack() {
    this.router.navigate(['/nav/po_ingestion']);
  }
}

@Component({
	selector: 'invite-company-dialog',
	templateUrl: './add-invite-compnay-dialog.component.html',
  styleUrls: ['./po-ingestion.component.css'],
})
export class InviteCompanyAddDialogComponent implements OnInit {
	isLoading: boolean;
	ht: number;
	width: number;
	form: FormGroup;
	userDetails;
	inviteCompanyVal: any;
  parentCompanyId: number;
  parentCompanyType: number; 
  companyTypeList = [];
  parentCompanyTypelist = [];
	modulesVal: any;
	modulesList: any;
	title: String;
	btnTitle: String;
	emailExists: boolean;
  invitee_user_id: any;
  invitee_company_id: any;
	userCompanyList: any;
  inviteCompanyName: string;
  companyAlreadyExists: boolean = false;
  existingCompanyId: number;
  
	constructor(
		private reusable: ReusableComponent,
		private formBuilder: FormBuilder,
		private authService: AuthenticationService,
		public dialogRef: MatDialogRef<InviteCompanyAddDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: InviteCompanyAddDialogComponent,
		public dialog: MatDialog,
	) { }

	ngOnInit() {
    console.log('adat',this.data);
    this.companyAlreadyExists = this.data['error_data'].is_company_already_exists;
    this.existingCompanyId = this.data['error_data'].existing_company_id;
		this.reusable.screenChange.subscribe(res => {
			this.ht = res['height'] - 64;
			this.width = res["width"] - 64;
		});
		this.isLoading = true;
		this.isLoading = false;
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
      this.parentCompanyTypelist = result.result;
      this.companyTypeList = result.result.filter(x => x.lookup_id != this.parentCompanyType);
      let inviteVal = result.result.filter(x => x.name == 'Shipper');
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
				invitee_company_name: this.form.get('CompanyName').value,
				invitee_email: this.form.get('Email').value.trim().toLowerCase(),
				invited_company_id:  this.parentCompanyId,
				invited_company_type_id: this.form.get('ParentCompanyType').value,
				invitee_company_type_id: this.form.get('InviteCompanyType').value,
				shared_modules: this.form.get('LicenseModules').value,
				invitee_user_id: this.invitee_user_id,
				company_invite_id: null,
				invitee_company_id: this.invitee_company_id != null || this.invitee_company_id != undefined ? this.invitee_company_id : null,
        poi_me_id: this.data["poi_me_id"],
			};
			let data = await this.authService.inviteCompnay(param);
			if (data.success) {
			  setTimeout(() => {
				  this.dialog.open(ConfirmDialog, {
					  data: {
							type: 'info-success',
							content: "Invite Sent Successfully !",
						}
					});
				}, 1000);
			}
			this.isLoading = false;
			if (data.success) {
        data["closeDialogWithSucces"] = true
			  this.onClose(data.success);
			} else {
        data["closeDialogWithSucces"] = false;
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