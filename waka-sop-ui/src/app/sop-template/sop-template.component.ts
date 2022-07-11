import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../_services/index';
import { Router } from '@angular/router';
import { ReusableComponent } from '../reusable/reusable.component';
import { MatTableDataSource } from '@angular/material/table';
import { PrintService } from '../_services/print.service';
import { ClassSOPPort, ClassSOPCMW } from '../sop//sop-global-class';
import { ClassSOPContainer } from '../sop//sop-global-class';

@Component({
  selector: 'app-sop-template',
  templateUrl: './sop-template.component.html',
  styleUrls: ['./sop-template.component.css']
})
export class SopTemplateComponent implements OnInit {
  isLoading: boolean = false;
  sop:any;
  section1:any;
  objectKeys = Object.keys;
  disp = false;
  tblContactDisp = ["contact_name", "designation", "email", "mobile", "wechat_id"];
  revdisplayedColumns = ["version", "approved_on", "effective_date", "approver_ff", "approver_p", "description"];
	dispSOPPort = ["origin_country_name", "origin_port", "dest_country_name", "dest_port"];
  dispContainerWeight = ["container_size", "max_weight"];
  dispConMin = ["container_size", "min_cbm", "max_cbm"];
  dispCarrierAllocation = ["option", "carrier", "contract_number", "allocation"];
  dispConPreference = ["preference","container_size","lcl_min","fcl_min","optimal_cbm","max_weight"]
  section2:any;
  serviceTypes = [];
  section3:any;
  section4:any;
  pobGrp = [];
  chGrp = [];
  communicationColl = [];
  sopPortColl = new MatTableDataSource<ClassSOPPort>([]);
  sopCarrierAllocationColl = new MatTableDataSource([]);
  docGrpColl = [];
  cmGrpColl = [];
  caColl = [];
  carriers = [];
  carriersCA = [];
  allocationFormValues = [];
  sopContainerMaxWeightColl = new MatTableDataSource<ClassSOPCMW>([]);
  principalContacts:any
  FFContacts:any;
  stakeholders:any;
  allocatedValuesColl = [];
  displayColumns;
  IntervalWeekNumbers = [];
	IntervalLastDates = [];
	selectedCarriers = [];
  isPercentage:boolean = false;
  intervalType: string;
  effectiveEndDate;
  effectiveStartDate;
  containerColl = new MatTableDataSource<ClassSOPContainer>([]);
  sopContainerColl = new MatTableDataSource<ClassSOPContainer>([]);
  fetchedSopContainerIds:number[] = [];
  portStorageColl = [];
	portColumnNames;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private reusable: ReusableComponent,
    private printService: PrintService
  ) { }

  ngOnInit(): void {
    if (sessionStorage.getItem("sop")) {
      this.isLoading = true;
			this.sop = JSON.parse(this.reusable.decrypt(sessionStorage.getItem("sop")));
      this.getCompany();
      this.getSOPStakeholdersForPrint();
      this.section2 = {Territories:{"Origin Countries":[],"Destination Countries":[]},Services:{}}
      // this.getCountries();
      this.section3 = {Communications:[]};
      this.getSOPCommunicationForPrint();
      this.section4 ={"PO & Booking":{},"Cargo Bookings":[],"Documents":[],"Service Charges":[],"Carriers":[]};
      this.getSOPPOB();
      this.getDocGrp();
      this.getSOPCH();
      this.getCMGrp();
      this.getSopPortCountryWiseList();
      this.getSOPServices();
      this.getSopPortFreeStorageDetails();
      this.getSopPortList();
      this.getSOPCarrierListForPrint();
      //this.getSOPCarrierAllocationForPrint();
      this.getSOPCAForGroupForPrint();
      this.getSopContainerWeightForPrint();
      this.getSOPContainer();
      setTimeout(() => {
        this.isLoading = false;
        this.printService.onDataReady();
      }, 5000);
    }
    else {
      this.router.navigate(['/nav/sop'])
    }
  }

  capitalize(s: string): string {
		return s.replace(/_/gi, ' ');
	}

  findNextMonday(d) {
		let date = new Date(d);
		let weeklength = 6;
		let day = (weeklength - date.getDay()) + 2;
		return new Date(date.setDate(date.getDate() + day));
	}

  getIntervalRange(start,end,type) {
    let result;
		if (type == 'Weekly') {
			result = this.getDateWeekRange(start,end);
		} else if (type == 'Monthly') {
			this.getDateMonthRange();
		} else if (type == 'Quarterly') {
			this.getDateQuarterRange();
		} else {
			this.getDateYearlyRange();
		}
    return result;
	}

	getDateWeekRange(start,end) {
		let weekList = [];
		let IntervalWeekNumbers = [];
    let IntervalLastDates = []
    start = new Date(start);
		end = new Date(end);
		let firstweek = this.findNextMonday(start);
		for (let a = firstweek; a <= end; a.setDate(a.getDate() + 7)) {
			weekList.push(a.toLocaleDateString(undefined, { day: '2-digit' }) + '-' + a.toLocaleDateString(undefined, { month: '2-digit' }) + '-' + a.toLocaleDateString(undefined, { year: 'numeric' }).slice(0, 10))
		}
		IntervalLastDates = weekList;
		IntervalLastDates.map((date)=>{
			date = date.split("-").reverse().join("-");
			date = new Date(date);
			let oneJan:any =  new Date(date.getFullYear(), 0, 1);
			let numberOfDays =  Math.floor((date - oneJan) / (24 * 60 * 60 * 1000));
			let result = Math.ceil(( date.getDay() + 1 + numberOfDays) / 7);
			IntervalWeekNumbers.push(result);
		})
    return IntervalWeekNumbers;
	}

	getDateMonthRange() {
		let start = new Date(this.effectiveStartDate);
		let end = new Date(this.effectiveEndDate);
		let monthList = [];
		for (let a = start; a <= end; a.setDate(a.getDate() + 30)) {
			monthList.push(a.toLocaleDateString(undefined, { day: '2-digit' }) + '-' + a.toLocaleDateString(undefined, { month: '2-digit' }) + '-' + a.toLocaleDateString(undefined, { year: 'numeric' }).slice(0, 10))
		}
		monthList.shift();
		this.IntervalLastDates = monthList;
	}

	getDateQuarterRange() {
		let start = new Date(this.effectiveStartDate);
		let end = new Date(this.effectiveEndDate);
		let quarterList = [];
		for (let a = start; a <= end; a.setDate(a.getDate() + 90)) {
			quarterList.push(a.toLocaleDateString(undefined, { day: '2-digit' }) + '-' + a.toLocaleDateString(undefined, { month: '2-digit' }) + '-' + a.toLocaleDateString(undefined, { year: 'numeric' }).slice(0, 10))
		}
		quarterList.shift();
		this.IntervalLastDates = quarterList;
	}

	getDateYearlyRange() {
		let start = new Date(this.effectiveStartDate);
		let end = new Date(this.effectiveEndDate);
		let yearList = [];
		for (let a = start; a <= end; a.setDate(a.getDate() + 90)) {
			yearList.push(a.toLocaleDateString(undefined, { day: '2-digit' }) + '-' + a.toLocaleDateString(undefined, { month: '2-digit' }) + '-' + a.toLocaleDateString(undefined, { year: 'numeric' }).slice(0, 10))
		}
		yearList.shift();
		this.IntervalLastDates = yearList;
  }
  
  async getSOPContainer(){
		let param = {
			sop_id: this.sop.sop_id
		}
		let result = await this.authService.getSOPContainer({param:this.reusable.encrypt(JSON.stringify(param))});
		if (result.success){
			let container = result.result.filter(x=>x.sop_container_id == undefined);
			let sopContainer = result.result.filter(x=>x.sop_container_id != undefined);
			this.containerColl = new MatTableDataSource<ClassSOPContainer>(container);
			this.fetchedSopContainerIds = [];
			sopContainer.map(container => {
				this.fetchedSopContainerIds.push(container.sop_container_id);
			});
			this.sopContainerColl = new MatTableDataSource<ClassSOPContainer>(sopContainer);
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
		}
	}

  async getSopPortFreeStorageDetails(){
		let param = {
			sop_id: this.sop.sop_id,
      reqType: 'Print'
		}
		let result = await this.authService.getSopPortFreeStorageDetails(param);
		if (result.success && result.rowCount > 0){
			this.portStorageColl = result.result; 
			this.portColumnNames = Object.keys(this.portStorageColl[0]);
		}
		else if (!result.success) {
			this.reusable.openAlertMsg(this.authService.invalidSession(result),"error")
		}
	}
  
  async getSOPCH(){
    let result = await this.authService.getCHGrp();
    if (result.success){
      this.chGrp = result.result;
      this.chGrp.map(ch=>{
        this.section4["Cargo Bookings"][ch.grp] = [];
        this.getSOPCHForGroupForPrint(ch);
      })
      this.section4["Cargo Bookings"]["LCL Consolidation Program Details"] = [];
      this.section4["Cargo Bookings"]["FCL Program Details"] = [];
      this.getSOPCommForPrint("LCL Consolidation","LCL Consolidation Program Details");
      this.getSOPCommForPrint("FCL Program","FCL Program Details");
    }
  }

  async getSOPStakeholdersForPrint(){
    let param = {
      sop_id : this.sop.sop_id,
    }
    let result = await this.authService.getSOPStakeholdersForPrint(param);
    if (result.success){
      this.stakeholders = result.result;
    }
  }

  async getSOPCommForPrint(instructionType, grpName){
    let param = {
      sop_id : this.sop.sop_id,
      instruction_type: instructionType
    }
    let result = await this.authService.getSOPCommunicationForPrint(param);
    if (result.success){
      this.section4["Cargo Bookings"][grpName] = result.result;
    }
  }

  async getSOPCHForGroupForPrint(ch){
    let param = {
      sop_id : this.sop.sop_id,
      grp: ch.grp
    }
    let result = await this.authService.getSOPCHForGroupForPrint(param);
    if (result.success){
      let resp = result.result;
			resp.map(ch => {
				if (ch.view_text != undefined){
					ch.disp_text = ch.view_text;
					ch.fields.map(fld =>{
						fld.fields.map(fldoffld=>{
							fld[fldoffld]["field"].map(actField=>{
								let val = actField.value;
								if (typeof val == 'boolean'){
									val = val ? 'Required': 'Not Required';
								}
								ch.disp_text = ch.disp_text.replace('$$'+actField.controlname+'$$',val==null?'':val);
							})
						})
					});
				}
				if (ch.ui_img_file_name != undefined){
					ch.img_url = "url('../../assets/image/"+ch.ui_img_file_name+"')";
					let split = ch.ui_img_file_name.split('.');
					ch.img_url_grey = "url('../../assets/image/"+split[0]+'_grey.'+split[1]+"')";
				}
			});
      this.section4["Cargo Bookings"][ch.grp] = resp;
    }
  }

  async getSOPPOB(){
    let result = await this.authService.getPOBGrp();
    if (result.success){
      this.pobGrp = result.result;
      result.result.map((pob)=>{
        this.getSOPPOBForGroupForPrint(pob);
      })
    }
  }

  async getSOPPOBForGroupForPrint(pob){
    let param = {
      sop_id : this.sop.sop_id,
      grp: pob.grp
    }
    let result = await this.authService.getSOPPOBForGroupForPrint(param);
    if (result.success){
      let resp = result.result;
			resp.map(pob => {
				if (pob.view_text != undefined){
					pob.disp_text = pob.view_text;
					pob.fields.map(fld =>{
						fld.fields.map(fldoffld=>{
							fld[fldoffld]["field"].map(actField=>{
								let val = actField.value;
								if (typeof val == 'boolean'){
									val = val ? 'Required': 'Not Required';
								}
								pob.disp_text = pob.disp_text.replace('$$'+actField.controlname+'$$',val==null?'':val);
							})
						})
					});
				}
				if (pob.ui_img_file_name != undefined){
					pob.img_url = "url('../../assets/image/"+pob.ui_img_file_name+"')";
					let split = pob.ui_img_file_name.split('.');
					pob.img_url_grey = "url('../../assets/image/"+split[0]+'_grey.'+split[1]+"')";
				}
			});
      this.section4["PO & Booking"][pob.grp] = resp;
    }
  }

  async getDocGrp() {
		let result = await this.authService.getDocGrp();
		if (result.success) {
			this.docGrpColl = result.result;
      result.result.map((doc)=>{
        this.getSOPDOCForGroupForPrint(doc);
      })
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
  }

  async getSOPDOCForGroupForPrint(doc){
    let param = {
      sop_id : this.sop.sop_id,
      grp: doc.grp
    }
    let result = await this.authService.getSOPDOCForGroupForPrint(param);
    if (result.success){
      let resp = result.result;
			resp.map(doc => {
				if (doc.view_text != undefined){
					doc.disp_text = doc.view_text;
					doc.fields.map(fld =>{
						fld.fields.map(fldoffld=>{
							fld[fldoffld]["field"].map(actField=>{
								let val = actField.value;
								if (typeof val == 'boolean'){
									val = val ? 'Required': 'Not Required';
								}
								doc.disp_text = doc.disp_text.replace('$$'+actField.controlname+'$$',val==null?'':val);
							})
						})
					});
				}
				if (doc.ui_img_file_name != undefined){
					doc.img_url = "url('../../assets/image/"+doc.ui_img_file_name+"')";
					let split = doc.ui_img_file_name.split('.');
					doc.img_url_grey = "url('../../assets/image/"+split[0]+'_grey.'+split[1]+"')";
				}
			});
      this.section4["Documents"][doc.grp] = resp;
    }
  }

  async getCMGrp() {
		this.cmGrpColl = [
			{
				"grp_seq": 1,
				"grp": "Carrier Requirements",
				"html_template": 'template2',
			},
			{
				"grp_seq": 2,
				"grp": "Carrier Allocation",
				"html_template": 'template2',
			},
			{
				"grp_seq": 3,
				"grp": "Carrier Preference",
				"html_template": 'template2',
			},
			{
				"grp_seq": 4,
				"grp": "TEU",
				"html_template": 'template2',
			},
		]
    this.cmGrpColl.map((cm)=>{
      this.getSOPCRForGroupForPrint(cm);
    })
  }

  async getSOPCRForGroupForPrint(cm){
    let param = {
      sop_id : this.sop.sop_id,
      grp: cm.grp
    }
    let result = await this.authService.getSOPCRForGroupForPrint(param);
    if (result.success){
      let resp = result.result;
			resp.map(cm => {
				if (cm.view_text != undefined){
					cm.disp_text = cm.view_text;
					cm.fields.map(fld =>{
						fld.fields.map(fldoffld=>{
							fld[fldoffld]["field"].map(actField=>{
								let val = actField.value;
								if (typeof val == 'boolean'){
									val = val ? 'Required': 'Not Required';
								}
								cm.disp_text = cm.disp_text.replace('$$'+actField.controlname+'$$',val==null?'':val);
							})
						})
					});
				}
				if (cm.ui_img_file_name != undefined){
					cm.img_url = "url('../../assets/image/"+cm.ui_img_file_name+"')";
					let split = cm.ui_img_file_name.split('.');
					cm.img_url_grey = "url('../../assets/image/"+split[0]+'_grey.'+split[1]+"')";
				}
			});
      this.section4["Carriers"][cm.grp] = resp;
    }
  }

  async getSOPCAForGroupForPrint(){
    let param = {
      sop_id : this.sop.sop_id,
    }
    let result = await this.authService.getSOPCarrierAlloc({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if (result.success){
      this.section4["Carriers"]['Carrier Allocation']['Custom'] = [];
      this.section4["Carriers"]['Carrier Allocation']['Uniform'] = [];
      result.result.map((ca)=>{
        if(ca.allocation_type == 'Custom Allocation'){
          if(ca.allocation_value.length > 0){
            ca['display_columns'] = Object.keys(ca.allocation_value[0]);
          }
          ca['interval_type'] = ca.allocation_interval == 1 ? 'Weekly' : ca.allocation_interval == 2 ? 'Monthly' : ca.allocation_interval == 3 ? 'Quarterly' : 'Yearly'
          if(ca.carrier != null){
            ca['carrier_ids_rows'] = [];
            ca['selected_carriers'] = [];
            ca.carrier.map((x)=>{
              ca['carrier_ids_rows'].push('value_' + x);
              this.carriers.map((y)=>{
                if(y.stakeholder_id == x){
                  y.carrier_value = 'value_' + y.stakeholder_id;
                  ca['selected_carriers'].push(y);
                }
              })
            })
          }
          ca['interval_week_numbers'] = this.getIntervalRange(ca.effective_start_date,ca.effective_end_date,ca.interval_type);
          this.section4["Carriers"]['Carrier Allocation']['Custom'].push(ca);
        } else {
          this.getSOPCarrierForSOPPrint(ca.sop_port_id,ca.allocation_type);
          this.section4["Carriers"]['Carrier Allocation']['Uniform'].push(ca);
        }
      })
      //this.section4["Carriers"]['Carrier Allocation']['Custom']= result.result;
    }
  }

  async getSOPCarrierListForPrint() {
		let param = {
			principal_id: this.sop.principal_id,
			sop_id: this.sop.sop_id
		}
		let result = await this.authService.getSOPCarrierList(param);
		if (result.success) {
			this.carriers = result.result;
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

  
  async getSOPCarrierAllocationForPrint(){
    let param = {
      sop_id : this.sop.sop_id,
    }
    let result = await this.authService.getSOPCarrierAlloc({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if (result.success){
      this.caColl = result.result;
      this.caColl.forEach((x)=>{
        this.getSOPCarrierForSOPPrint(x.sop_port_id, x.allocation_type);
        if (x.allocation_interval != null) {
          this.intervalType = x.allocation_interval == 1 ? 'Weekly' : x.allocation_interval == 2 ? 'Monthly' : x.allocation_interval == 3 ? 'Quarterly' : 'Yearly'
          this.effectiveEndDate = x.effective_end_date;
          this.effectiveStartDate = x.effective_start_date;
        }
      })
    }
  }

  async getSOPCarrierForSOPPrint(port_id, type:string) {
		let param = {
			principal_id: this.sop.principal_id,
			sop_id: this.sop.sop_id,
      sop_port_id: port_id
		}
		let result = await this.authService.getSOPCarrierForSOPPrint(param);
		if (result.success) {
      if ( type == 'Custom Allocation') {
        this.carriersCA = result.result;
        if(this.carriersCA[0].unit_of_allocation == 'Percentage (%)') {
          this.isPercentage = true;
        } else {
          this.isPercentage = false;
        }
        this.allocatedValuesColl = result.result[0].allocation_value;
        this.displayColumns = Object.keys(result.result[0].allocation_value[0]);
        //this.getIntervalRange();
      } else {
        // this.carriers = result.result;
        this.sopCarrierAllocationColl = new MatTableDataSource(result.result);
      }
		} else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

  async getSOPCommunicationForPrint(){
    let param = {
      sop_id : this.sop.sop_id,
      instruction_type: 'communication'
    }
    let result = await this.authService.getSOPCommunicationForPrint(param);
    if (result.success){
      this.section3["Communications"] = result.result;
    }
  }

  async getSopPortCountryWiseList() {
		let param = {
			sop_id: this.sop.sop_id
		}
		let result = await this.authService.getSopPortCountryWiseList({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
      this.section4["Documents"]['Country']= result.result;
    }
  }


  
  async getCountries(){
    let param = {
      sop_id: this.sop.sop_id
    }
    let result = await this.authService.getSOPCountries(param);
    if (result.success){
      this.section2["Territories"]["Origin Countries"] = result.result.filter(x=>x.origin_dest == 'origin');
      this.section2["Territories"]["Destination Countries"] = result.result.filter(x=>x.origin_dest == 'destination');
      this.getSOPServices()
    }
  }

  async getSOPServices(){
    let param = {
				sop_id : this.sop.sop_id
		}
		let result = await this.authService.getSOPServices(param);
    if (result.success){
      this.serviceTypes = [...new Set(result.result.map(({service_type})=>service_type))];
      this.serviceTypes.map(service=>{
        this.section2["Services"][service] = result.result.filter(x=>x.service_type == service);
      });
    }
  }
  
  async getContactsEmail(contact_id){
    let param = {
      contact_invite_id : contact_id,
    }
    let result = await this.authService.getContactsEmailForPrint(param);
    if (result.success){
      //return result.result;
    }
  }

  getCompany(){
    if (this.section1 == undefined) this.section1 = {};
    this.getSOPCompanies(this.sop.sop_id);
  }

  async getSOPCompanies(sopId){
    let param = {
      sop_id: sopId
    }
    let result = await this.authService.getSOPCompany({param:this.reusable.encrypt(JSON.stringify(param))});
    if (result.success){
      this.getPrincipalCompanyContacts(result.result[0].principal_company_id);
      this.getFFCompanyContacts(result.result[0].ff_company_id);
      // result.result.map(company=>{
      //   this.getAddressForCompanyId(company);
      // });
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
    }
  }

  
  async getPrincipalCompanyContacts(company_id){
    let param = {
      company_id: company_id
    }
    let result = await this.authService.getCompanyContacts({param:this.reusable.encrypt(JSON.stringify(param))});
    if (result.success){
      this.principalContacts = result.result;
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
    }
  }

  async getFFCompanyContacts(company_id){
    let param = {
      company_id: company_id
    }
    let result = await this.authService.getCompanyContacts({param:this.reusable.encrypt(JSON.stringify(param))});
    if (result.success){
      this.FFContacts = result.result;
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
    }
  }

  async getAddressForCompanyId(company){
    let param = {
      company_id: company.company_id
    }
    let result = await this.authService.getAddressForCompanyId({param:this.reusable.encrypt(JSON.stringify(param))});
    if (result.success){
      company["address"] = result.result[0];
      this.getCompanyContacts(company);
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
    }
  }

  async getCompanyContacts(company){
    let param = {
      company_id: company.company_id
    }
    let result = await this.authService.getCompanyContacts({param:this.reusable.encrypt(JSON.stringify(param))});
    if (result.success){
      company["contacts"] = new MatTableDataSource(result.result);
      if (this.section1[company.company_type] == undefined) this.section1[company.company_type] = [];
      this.section1[company.company_type].push(company);
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
    }
  }

  async getSopPortList() {
		let param = {
			sop_id: this.sop.sop_id,
		}
		let result = await this.authService.getSopPortList({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			this.sopPortColl = new MatTableDataSource(result.result);
      setTimeout(() => {
        this.getSOPSCHINVForGroupForPrint(this.sopPortColl.data[0]);
      }, 200);
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

  async getSOPSCHINVForGroupForPrint(inv){
    let param = {
      sop_id : this.sop.sop_id
    }
    let result = await this.authService.getSOPSCHINVForGroupForPrint(param);
    if (result.success){
      this.section4["Service Charges"]["Invoicing"] = result.result;
    }
  }
  
  async getSopContainerWeightForPrint() {
		let param = {
			sop_id: this.sop.sop_id,
		}
		let result = await this.authService.getSopContainerWeightForPrint({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
			this.sopContainerMaxWeightColl = new MatTableDataSource(result.result);
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}
}
