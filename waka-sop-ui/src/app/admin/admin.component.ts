import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../_services/index';
import { ReusableComponent } from '../reusable/reusable.component';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  screenParam:any;  varFxLayout:string ="row wrap"; 
  cardPadding:number;
  userDetails: any;
  subModuleCardsColl= [];
  height:number;
  width:number;
  rowChartCnt:number = 3;
  cardDivWidth:number = 380;
  isMobile:boolean = false;
  paddingTop:number;

  constructor(
    private reusable: ReusableComponent,
    private authSerice: AuthenticationService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.reusable.headHt.next(0);
    this.reusable.titleHeader.next("Admin");
    this.reusable.curRoute.next('home');
    this.reusable.screenChange.subscribe(screen => {
      if (screen.height < 600){
        this.height = screen.height
      } else {
        this.height = screen.height;
      }
      this.width = screen.width - 140;
      if (screen.width < 600 ){
        this.rowChartCnt = 1;
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
        this.cardDivWidth = (screen.width - 200 - 28*2)/this.rowChartCnt - 5;
      }
      else {
        this.rowChartCnt = Math.floor(screen.width/400);
        this.isMobile = false;
        this.paddingTop = 60;
        this.cardDivWidth = (screen.width - 212 - 28*(this.rowChartCnt-1))/this.rowChartCnt;
      }
    });
    this.userDetails = ReusableComponent.usr;
    this.getSubModules(1);
  }

  async getSubModules(moduleId) {
    if (this.userDetails.is_admin) {
      let param = {
        module_id: moduleId
      }
      let result = await this.authSerice.getSubModules({ param: this.reusable.encrypt(JSON.stringify(param)) });
      if (result.success) {
        result.result.map((x)=>{
            x.module_name = x.sub_module_name;
            this.subModuleCardsColl.push(x);
            this.getTotalCntByModule(x);
        });
      }
      else {
        this.reusable.openAlertMsg(this.authSerice.invalidSession(result), "error");
      }
    } else {
      let param = {
        module_id: moduleId
      }
      let result = await this.authSerice.getSubModules({ param: this.reusable.encrypt(JSON.stringify(param)) });
      if (result.success) {
        let res = result.result.filter(x => x.is_admin_owned == false && x.module_name == 'Admin');
        res.map((x)=>{
            x.module_name = x.sub_module_name;
            this.subModuleCardsColl.push(x);
            this.getTotalCntByModule(x);
        });
      }
      else {
        this.reusable.openAlertMsg(this.authSerice.invalidSession(result), "error");
      }
    }
  }

  async getTotalCntByModule(cards){
    let param = { table_name: cards.table_reference }
    let rowCount = await this.authSerice.getTotalCntByModule(param);
    if (rowCount.success){
      let res = rowCount.result;
      if (res.length > 0){
        cards.count = res.find(x=>x.table_name == cards.table_reference).count;
      }
      else {
        cards.count = "0";
      }
    } else {
      this.authSerice.invalidSession(rowCount);
    }
  }

  async navigate(mod) {
    if (mod.module_name == 'Company') {
      this.router.navigate(['/nav/company']);
    }
    else if (mod.module_name == 'Lookup') {
      this.router.navigate(['/nav/lookup']);
    }
    else if (mod.module_name == 'Roles') {
      this.router.navigate(['/nav/roles']);
    }
    else if (mod.module_name == 'Admin') {
      this.router.navigate(['/nav/admin']);
    }
    else if (mod.module_name == 'License') {
      this.router.navigate(['/nav/license']);
    }
    else if (mod.module_name == 'Services') {
      this.router.navigate(['/nav/admin/services']);
    }
    else if (mod.module_name == 'Map Enabled Services') {
      this.router.navigate(['/nav/admin/map-enabled-services']);
    }
    else if (mod.module_name == 'Schedulers Status') {
      this.router.navigate(['/nav/admin/scheduler-status']);
    }
  }

  // async getUserStatForCompAdmin(){
  //   let result = await this.authSerice.getUserStatForCompAdmin();
  //   if (result.success){
  //     this.userReg = {active: result.result[0].active, deleted:result.result[0].deleted, admin:result.result[0].admin}
  //   }
  //   else {
  //     this.reusable.openAlertMsg(this.authSerice.invalidSession(result),"error");
  //   }
  // }

  // async getUserStat(){
  //   let result = await this.authSerice.getUserStat();
  //   if (result.success){
  //     this.userReg = {active: result.result[0].active, deleted:result.result[0].deleted, admin:result.result[0].admin}
  //   }
  //   else {
  //     this.reusable.openAlertMsg(this.authSerice.invalidSession(result),"error");
  //   }
  // }

  // async getRoleStatForAdmin(){
  //   let result = await this.authSerice.getRoleStatForAdmin();
  //   if (result.success) {
  //     this.roleCnt = result.result[0].count;
  //     this.companyCnt = this.roleCnt>0 ? 1: 0;
  //   }
  //   else {
  //     this.reusable.openAlertMsg(this.authSerice.invalidSession(result),"error");
  //   }
  // }

}
  