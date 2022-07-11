import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../_services/index';
import { ReusableComponent } from '../../reusable/reusable.component';

@Component({
	selector: 'sop-landing',
	templateUrl: 'sop-landing.html',
	styleUrls: ['./sop-landing.component.css']
})
export class SopLandingComponent implements OnInit {
    isLoading = false;
	selTabIndex = 0;
    userDetails:any;
    sop:any;
    screen: { width: number; height: number; };
    pageStartTime: Date;
	pageCurrentUrl: string;

    constructor (
		private authService: AuthenticationService,
		private reusable: ReusableComponent,
		private router: Router,
	) {	}

	ngOnInit() {
        this.pageStartTime = new Date();
		this.pageCurrentUrl = this.router.url;
        this.userDetails = ReusableComponent.usr;
		if (sessionStorage.getItem("sop")) {
			this.sop = JSON.parse(this.reusable.decrypt(sessionStorage.getItem("sop")));
			this.sop["validFrom"] = new Date(this.sop.valid_from); 
			this.sop["validTo"] = new Date(this.sop.valid_to); 
		}
        if (this.sop == undefined) this.reusable.titleHeader.next("Standard Operating Procedure");
		else {
			this.reusable.titleHeader.next("Edit Standard Operating Procedure ("+	this.sop.sop_id+")");
		}
        this.reusable.curRoute.next("/nav/sop");
		this.reusable.headHt.next(60);
		this.reusable.screenChange.subscribe(res => {
			this.screen = { width: res.width-112, height: res.height-140};
		});
        this.selectTab(this.router.url);
    }

    ngOnDestroy() {
		this.authService.savePageAccess(this.pageStartTime, new Date(), this.pageCurrentUrl, 'Sop-Landing');
	}

    selectTab(url){
        if(url.includes("sopstakeholder")){
            this.selTabIndex = 0;
        }
        else if(url.includes("sopservices")){
            this.selTabIndex = 1;
        }
        else if(url.includes("soppobooking")){
            this.selTabIndex = 2;
        }
        else if(url.includes("sopdocs")){
            this.selTabIndex = 3;
        }
        else if(url.includes("sopch")){
            this.selTabIndex = 4;
        }
        else if(url.includes("sopcarrier")){
            this.selTabIndex = 5;
        }
        else if(url.includes("ssc")){
            this.selTabIndex = 6;
        }
        else if(url.includes("lc")){
            this.selTabIndex = 7;
        }
    }

    changeTab(tabIdx){
		this.selTabIndex = tabIdx;
        if (tabIdx == 0){
            this.router.navigate(['/nav/soplanding/sopstakeholder']);
        }
        else if (tabIdx == 1){
            this.router.navigate(['/nav/soplanding/sopservices']);
        }
        else if(tabIdx == 2){
            this.router.navigate(['/nav/soplanding/soppobooking']);
        }
        else if(tabIdx == 3){
            this.router.navigate(['/nav/soplanding/sopdocs']);
        }
        else if(tabIdx == 4){
            this.router.navigate(['/nav/soplanding/sopch']);
        }
        else if(tabIdx == 5){
            this.router.navigate(['/nav/soplanding/sopcarrier']);
        }
        else if(tabIdx == 6){
            this.router.navigate(['/nav/soplanding/ssc']);
        }
        else if(tabIdx == 7){
            this.router.navigate(['/nav/soplanding/lc']);
        }
	}

}