import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../_services/index';
import { Router } from '@angular/router';
import { ReusableComponent } from '../reusable/reusable.component';
import { MatTableDataSource } from '@angular/material/table';
import { PrintService } from '../_services/print.service';

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
  tblContactDisp = ["contact_name", "designation", "email","mobile"];
  section2:any;
  serviceTypes = [];
  section3:any;
  section4:any;
  pobGrp = [];
  chGrp = [];

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
      console.log(this.sop);
      this.getCompany();
      this.section2 = {Territories:{"Origin Countries":[],"Destination Countries":[]},Services:{}}
      this.getCountries();
      this.section3 = {Communications:[]};
      this.getSOPCommunicationForPrint();
      this.section4 ={"PO & Booking":{},"Cargo Bookings":[]};
      this.getSOPPOB();
      this.getSOPCH();
    }
    else {
      this.router.navigate(['/nav/sop'])
    }
    this.printService.onDataReady();
    setTimeout(() => {
      this.isLoading = false;
      this.printContent();
    }, 6000);
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
      this.pobGrp.map(pob=>{
        this.section4["PO & Booking"][pob.grp] = [];
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
      let selServices = result.result.filter(x=>x.is_selected);
      this.serviceTypes = [...new Set(selServices.map(({service_type})=>service_type))];
      this.serviceTypes.map(service=>{
        this.section2["Services"][service] = selServices.filter(x=>x.service_type == service);
      });
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
      result.result.map(company=>{
        this.getAddressForCompanyId(company);
      });
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

  printContent(){
    setTimeout(() => {
      window.print();
      this.router.navigate(['/nav/sop']);
    }, 1000);
  }


}
