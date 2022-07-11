import { Component, OnInit } from '@angular/core';
import { ReusableComponent } from '../reusable/reusable.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../_services/authentication.service'
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-accept-deny',
  templateUrl: './accept-deny.component.html',
  styleUrls: ['./accept-deny.component.css']
})
export class AcceptDenyComponent implements OnInit {
  ht;
  fxAlign = "start center";
  snAlign = "space-between center";
  togAdmin = false;
  headHt = 0;
  isMobile :boolean = false;
  isPendInvite :boolean = false;
  pendingInviteColl = new MatTableDataSource([]);
  pendingContactInviteColl = new MatTableDataSource([]);
  displayPending = ["company_name", "invitee_company_name", "invitee_company_type", "status"];
  displayContactPending = ["company_name", "contact_name", "status"];
  statusColl = ["accept", "deny", "pending"];
  selStatus = "pending";
  isPendContactInvite: boolean = false;
  width:number =0;
  pendingInviteContactData: any;
  pendingInviteCompanyData: any;
  invitedCompanyId:any;
  checkedInviteCompanyDetails:any;
  companyInviteId:any;

  constructor(
    private reusable: ReusableComponent,
    private router: Router,
    private authService: AuthenticationService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.reusable.screenChange.subscribe(res => {
			this.ht = res['height'] - 204;
			this.width = res["width"] - 64;
		});
		if(this.width < 500) {
			this.isMobile = true;
		} else {
			this.isMobile = false;
		}
    // this.reusable.headHt.subscribe(h => {
    //   setTimeout(() => {
    //     this.headHt = h;
    //   }, 1000);
    // });
    this.pendingInviteCompanyData = JSON.parse(sessionStorage.getItem("pendingInviteColl"));
    if (this.pendingInviteCompanyData != undefined){
      this.pendingInviteColl = new MatTableDataSource(JSON.parse(sessionStorage.getItem("pendingInviteColl")));
      this.isPendInvite = true;
    }
    
    this.pendingInviteContactData = JSON.parse(sessionStorage.getItem("pendingContactInviteColl"));
    if (this.pendingInviteContactData != undefined){
      this.pendingContactInviteColl = new MatTableDataSource(JSON.parse(sessionStorage.getItem("pendingContactInviteColl")));
      this.isPendContactInvite = true;
    }
  }

  async onChange(value, row) {
    if(value == 'accept'){
		  sessionStorage.setItem("NewCompanyToCreate", JSON.stringify(row));
    }
    this.invitedCompanyId =row.invited_company_id;
    this.companyInviteId =row.company_invite_id;
    const param = {
			company_id: this.invitedCompanyId,
    }
    const result = await this.authService.getInviteCompany(param);
    if(result.success){
      this.checkedInviteCompanyDetails = result.result.filter(x=>x.company_invite_id == this.companyInviteId);
    }
    const cond = this.checkedInviteCompanyDetails[0].is_revoked;
    if(cond){
      this.reusable.openAlertMsg("Your Invite has been Revoked", "warn");
      this.router.navigate(['nav/company']);
    }
    else{
      if (value == "accept") {
        this.isPendInvite = false;
        this.reusable.pageData.next(row);
        if(row.invitee_company_id != null) {
          row['type'] = "accept";
          this.authService.updCompanyInviteAccept({ param: this.reusable.encrypt(JSON.stringify(row)) });
          sessionStorage.removeItem("pendingInviteColl");
        }
        this.router.navigate(['/nav/company']);
      }
      else if (value == "deny") {
        sessionStorage.removeItem("pendingInviteColl");
        let conf = confirm("Are you sure, you like to deny this invitation? Please confirm");
        if (!conf) return;
        this.isPendInvite = false;
        row['type'] = "deny";
        this.authService.updCompanyInviteAccept({ param: this.reusable.encrypt(JSON.stringify(row)) });
        this.router.navigate(['/nav/company']);
      }
    }
  }

  onChangeContact(value, row) {
    if (value == "accept") {
      this.isPendContactInvite = false;
      this.reusable.pageData.next(row);
      row['type'] = "accept";
      this.authService.updContactInviteAccept({ param: this.reusable.encrypt(JSON.stringify(row)) });
      sessionStorage.removeItem("pendingContactInviteColl");
      this.router.navigate(['/nav/company']);
    }
    else if (value == "deny") {
      sessionStorage.removeItem("pendingContactInviteColl");
      let conf = confirm("Are you sure, you like to deny this invitation? Please confirm");
		  if (!conf) return;
      this.isPendContactInvite = false;
      this.reusable.pageData.next(row);
      row['type'] = "deny";
      this.authService.updContactInviteAccept({ param: this.reusable.encrypt(JSON.stringify(row)) });
      this.router.navigate(['/nav/company']);
    }
  }


}
