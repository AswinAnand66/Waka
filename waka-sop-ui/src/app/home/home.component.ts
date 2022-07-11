import { SidenavComponent } from './../sidenav/sidenav.component';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../_services/index';
import { ReusableComponent } from '../reusable/reusable.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  screenParam:any;
  userDetails: any;
  moduleCardsColl: any;
  height:number;
  width:number;
  rowChartCnt:number = 3;
  cardDivWidth:number = 380;
  isMobile:boolean = false;
  paddingTop:number;

  constructor(
    private reusable: ReusableComponent,
    private authService: AuthenticationService,
    private router: Router,
    private sidenav: SidenavComponent,
  ) { }

  ngOnInit(): void {
    this.reusable.headHt.next(0);
    this.reusable.titleHeader.next("Home")
    this.reusable.screenChange.subscribe(screen => {
      screen.height=screen.height-0.1;
      if (screen.height < 600){
        this.height = screen.height;
      } else {
        this.height = screen.height;
      }
      this.width = screen.width - 140;
      if (screen.width < 600 ){
        this.rowChartCnt = 1
        this.height = screen.height - 50;
        this.paddingTop = 120;
        this.cardDivWidth = screen.width * (1 - 10/100) - 42;
      }
      else if (screen.width < 1200){
        this.rowChartCnt = 2
        this.isMobile = false;
        this.paddingTop = 60;
        this.cardDivWidth = (screen.width * (1 - 10/46) - 28)/this.rowChartCnt;
      }
      else if (screen.width < 1400) {
        this.rowChartCnt = 3;
        this.isMobile = false;
        this.paddingTop = 60;
        this.cardDivWidth = ((screen.width - 200 - 28*2)/this.rowChartCnt) - 5;
      }
      else {
        this.rowChartCnt = Math.floor(screen.width/400);
        this.isMobile = false;
        this.paddingTop = 60;
        this.cardDivWidth = ((screen.width - 212 - 28*(this.rowChartCnt-1))/this.rowChartCnt) - 5;
      }
    });
    this.userDetails = ReusableComponent.usr;
    if(this.userDetails.company_admin_cnt > 0 && !this.userDetails.is_admin){
      this.getModulesList(true);
    } else if (this.userDetails.company_admin_cnt == 0 && !this.userDetails.is_admin){
      this.getModulesList(false);
    } else {
      this.getAdminModules();
    }
  }
  
  async getModulesList(licensed) {
    let param = {
      is_licensed: licensed
    }
    let result = await this.authService.getModulesList({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if (result.success) {
      this.moduleCardsColl = result.result;
      this.moduleCardsColl.map(module => {
        this.getTotalCntByModule(module);
      });
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  async getAccessProvidedUsers(module: any) {
    let param = {
      module_id: module.module_id
    }
    let result = await this.authService.getAccessProvidedUsers({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if (result.success) {
      let module_access = {
        module_name: module.module_name,
        module_id: module.modulee_id,
        provided_users: result.rows
      }
      sessionStorage.setItem('provided_users', this.reusable.encrypt(JSON.stringify(module_access)));
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  async getAdminModules() {
    let result = await this.authService.getAdminModules();
    if (result.success) {
      this.moduleCardsColl = result.result;
      this.moduleCardsColl.map(module => {
        this.getTotalCntByModule(module);
      });
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  async getTotalCntByModule(cards){
    let param = { table_name: cards.table_reference }
    let rowCount = await this.authService.getTotalCntByModule(param);
    if (rowCount.success){
      let res = rowCount.result;
      if (res.length > 0){
        cards.count = res.find(x=>x.table_name == cards.table_reference).count;
      }
      else {
        cards.count = "0";
      }
    } else {
      this.authService.invalidSession(rowCount);
    }
  }

  
  async getSubModule(mod) {
    this.sidenav.moduleColl.map((md)=> {
      if (md.module_name != mod.module_name) {
        md["is_selected"] = false;
      }
      else {
        md["is_selected"] = true;
      }
    })
    this.navigate(mod);
  }

  async navigate(mod) {
    if (mod.module_name == 'Company') {
      this.router.navigate(['/nav/company']);
    }
    else if (mod.module_name == 'SOP') {
      this.router.navigate(['/nav/sop']);
    }
    else if (mod.module_name == 'Order Confirmation') {
      this.router.navigate(['/nav/orderpo']);
    }
    else if (mod.module_name == 'Lookup') {
      this.router.navigate(['/nav/lookup']);
    }
    else if (mod.module_name == 'Roles') {
      this.router.navigate(['/nav/roles']);
    }
    else if (mod.module_name == 'PO Ingestion') {
      this.router.navigate(['/nav/po_ingestion']);
    }
    else if (mod.module_name == 'Contracts') {
      await this.getAccessProvidedUsers(mod);
      this.router.navigate(['/nav/contracts']);
    }
    else if (mod.module_name == 'Admin') {
      this.router.navigate(['/nav/admin']);
    }
    else if (mod.module_name == 'Manage Orders') {
      this.router.navigate(['/nav/orderpo']);
    }
    else if (mod.module_name == 'Shipment Booking') {
      this.router.navigate(['/nav/shipment_booking']);
    }
  }
}
