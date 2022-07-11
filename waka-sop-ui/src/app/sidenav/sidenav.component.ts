import { Component, OnInit } from '@angular/core';
import { ReusableComponent } from '../reusable/reusable.component';
import { environment } from '../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../_services/authentication.service'
import { MatTableDataSource } from '@angular/material/table';


@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css'],
})
export class SidenavComponent implements OnInit {

  ht;
  cusLogo: string = environment.customer_small_logo;
  userDetails;
  mode = 'side';
  fxAlign = "start center";
  snAlign = "space-between center";
  togAdmin = false;
  headHt = 0;
  moduleColl = [];
  adminModules = [];
  isPendInvite = false;
  pendingInviteColl = new MatTableDataSource([]);
  pendingContactInviteColl = new MatTableDataSource([]);
  displayPending = ["company_name", "invitee_company_name", "invitee_company_type", "status"];
  displayContactPending = ["company_name", "contact_name", "status"];
  statusColl = ["accept", "deny", "pending"];
  selStatus = "pending";
  isPendContactInvite: boolean;
  width: number = 0;
  isMobileView:boolean = false;
  
  constructor(
    private reusable: ReusableComponent,
    private router: Router,
    private authService: AuthenticationService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.reusable.screenChange.subscribe(res => {
      this.ht = res['height'];
    });
    this.reusable.headHt.next(0);
    this.reusable.headHt.subscribe(h => {
      setTimeout(() => {
        this.headHt = h;
      }, 1000);
      if (screen.width < 900){
        this.isMobileView = true;
      }
      else {
        this.isMobileView = false;
      }
    });
    this.userDetails = ReusableComponent.usr;
    this.getEventId();
    this.reusable.refreshModules.next(true);
    this.reusable.refreshModules.subscribe(res => {
      if(res){
        if(this.userDetails.company_admin_cnt > 0 && !this.userDetails.is_admin){
          this.getModulesList(true);
        } else if (this.userDetails.company_admin_cnt == 0 && !this.userDetails.is_admin){
          this.getModulesList(false);
        } else {
          this.getAdminModules();
        };
      }
    });
    this.getPendingInviteForEmail();
  }

  sidenavMousein(){
    this.mode = "over";
  }
  sidenavMouseout(){
    this.mode = "side";
  }

  hoveredout() {
    let ele = document.getElementById("sidenav");
    if (ele != undefined) {
      if (ele.clientWidth <= 48) {
        this.mode = "side";
        this.width = 0
      }
      else {
        this.mode = "over";
        this.width = 48;
      }
    }
  }

  async getPendingInviteForEmail() {
    let param = {
      email: this.userDetails.email
    }
    let result = await this.authService.getPendingInviteForEmail({ param: this.reusable.encrypt(JSON.stringify(param)) });
    let result1 = await this.authService.getPendingContactInviteForEmail({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if (result.success && result.rowCount > 0) {
      this.isPendInvite = true;
      sessionStorage.setItem("pendingInviteColl", JSON.stringify(result.result));
    }
    if (result1.success && result1.rowCount > 0) {
      this.isPendContactInvite = true;
      sessionStorage.setItem("pendingContactInviteColl", JSON.stringify(result1.result));
    }
    if (result1.rowCount > 0 || result.rowCount > 0) {
      this.reusable.titleHeader.next("My Pending List");
    }
    else if (!result.success) {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
    else if (!result1.success) {
      this.reusable.openAlertMsg(this.authService.invalidSession(result1), "error");
    }
    if (!this.isPendInvite && !this.isPendContactInvite) {
      if (this.activatedRoute.snapshot["_routerState"]["url"].includes("home") || this.activatedRoute.snapshot["_routerState"]["url"] == '/nav') {
        let mod = this.moduleColl.find(x => x.module_name == 'Home');
        if (mod != undefined) mod["is_selected"] = true;
      }
      else if (this.activatedRoute.snapshot["_routerState"]["url"].includes("company") || this.activatedRoute.snapshot["_routerState"]["url"] == '/nav') {
        let mod = this.moduleColl.find(x => x.module_name == 'Company');
        if (mod != undefined) mod["is_selected"] = true;
      }
      else if (this.activatedRoute.snapshot["_routerState"]["url"].includes("sop") || this.activatedRoute.snapshot["_routerState"]["url"].includes("soplanding")) {
        let mod = this.moduleColl.find(x => x.module_name == 'SOP');
        if (mod != undefined) mod["is_selected"] = true;
      }
      else if (this.activatedRoute.snapshot["_routerState"]["url"].includes("admin") || this.activatedRoute.snapshot["_routerState"]["url"].includes("roles") || this.activatedRoute.snapshot["_routerState"]["url"].includes("lookup") || this.activatedRoute.snapshot["_routerState"]["url"].includes("license")) {
        let mod = this.moduleColl.find(x => x.module_name == 'Admin');
        if (mod != undefined) mod["is_selected"] = true;
      }
      this.activatedRoute.snapshot["_routerState"]["url"] == '/nav' ? this.router.navigate(['/nav/home']) : '';
    } else {
      this.router.navigate(['/nav/acceptdeny']);
    }
  }
  
  async getModulesList(licensed) {
    let param = {
      is_licensed: licensed
    }
    let result = await this.authService.getModulesList({ param: this.reusable.encrypt(JSON.stringify(param)) });
    if (result.success) {
      this.moduleColl = result.result;
      this.moduleColl.map(module => {
        module["subModules"] = [];
        module["is_selected"] = false;
      });
      if(this.router.url == '/nav') {
        this.moduleColl[0].is_selected = true;
      }
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }
  
  async getAdminModules() {
    let result = await this.authService.getAdminModules();
    if (result.success) {
      this.moduleColl = result.result;
      this.moduleColl.map(module => {
        module["subModules"] = [];
        module["is_selected"] = false;
      });
      this.moduleColl[0].is_selected = true;
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }
  
  async logout() {
    let userDet = ReusableComponent.usr;
    if (userDet.user_id > 0) {
      let data = { id: userDet.user_id };
      let result = await this.authService.logoutUser(data);
      if (!result.success) {
        this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
      }
    }
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  async getSubModule(mod) {
    this.moduleColl.map(md => {
      if (mod.module_name != md.module_name) {
        md["is_selected"] = false;
      }
      else {
        md["is_selected"] = true;
      }
    })
    this.navigate(mod);
  }

  async getEventId(){
    let result = await this.authService.getEventId();
    if (result.success) {
      sessionStorage.setItem('events', this.reusable.encrypt(JSON.stringify(result.result)));
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    } 
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
    else if (mod.module_name == 'Home') {
      this.router.navigate(['/nav/home']);
    }
    else if (mod.module_name == 'Admin') {
      this.router.navigate(['/nav/admin']);
    }
    else if (mod.module_name == 'PO Ingestion') {
      this.router.navigate(['/nav/po_ingestion']);
    }
    else if (mod.module_name == 'Contracts') {
      await this.getAccessProvidedUsers(mod);
      this.router.navigate(['/nav/contracts']);
    }
    else if (mod.module_name == 'Manage Orders') {
      this.router.navigate(['/nav/orderpo']);
    }
    else if (mod.module_name == 'Shipment Booking') {
      this.router.navigate(['/nav/shipment_booking']);
    }
    else {
      if (this.userDetails.is_admin) {
        if (mod["subModules"].length > 0) {
          this.togAdmin = !this.togAdmin;
          return;
        }
        let param = {
          module_id: mod.module_id
        }
        let result = await this.authService.getSubModules({ param: this.reusable.encrypt(JSON.stringify(param)) });
        if (result.success) {
          this.togAdmin = true;
          mod["subModules"] = result.result.filter(x => x.module_name == 'Admin');
        }
        else {
          this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
        }
      } else {
        let param = {
          module_id: mod.module_id
        }
        let result = await this.authService.getSubModules({ param: this.reusable.encrypt(JSON.stringify(param)) });
        if (result.success) {
          this.togAdmin = true;
          mod["subModules"] = result.result.filter(x => x.is_admin_owned == false && x.module_name == 'Admin');
        }
        else {
          this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
        }
      }
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
        provided_users: result.rows.event_provided_users,
        accessible_companies: result.rows.accessible_companies,
      }
      console.log('sd', module_access)
      sessionStorage.setItem('provided_users', this.reusable.encrypt(JSON.stringify(module_access)));
    }
    else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  navigateSubModule(module) {
    this.togAdmin = false;
    this.reusable.titleHeader.next(module.sub_module_name);
    this.router.navigate(['/nav/' + (module.sub_module_name.toLowerCase())])
  }

}
