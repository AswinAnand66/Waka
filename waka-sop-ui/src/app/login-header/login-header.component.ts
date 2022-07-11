import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { AuthenticationService} from '../_services/index';
import { ReusableComponent } from '../reusable/reusable.component';
import { Observable, Observer, fromEvent, merge, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-login-header',
  templateUrl: './login-header.component.html',
  styleUrls: ['./login-header.component.css'],
  // encapsulation: ViewEncapsulation.None,
})

export class LoginHeaderComponent {
  isLoading = false;
  showHeader = true;
  showProfile = false;
  userDetails:string ;
  cusName:string = environment.customer;
  cusLogo:string = environment.customer_small_logo;
  entSelVal:string;  entCollection=[]; myDashSelVal; myDashColl=[];
  appTitle:string = environment.browser_title.substr(0,1).toUpperCase()+environment.browser_title.substr(1);
  userDet; entObj;
  dispMenu = true;
  dispCalendar = false; dispOnRequest = false; dispEnt = true; dispMyChart = false;
  online$: any;
  amIOnline = true;
  modName:string ='';
  curRoute:string ='';
  isMobileView:boolean;
  mobileSearchFilter:boolean = false;
  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private reusable: ReusableComponent,
  ) { document.body.className = "welcome-box-custom";  }
  
  createOnline$() {
    return merge<boolean>(
      fromEvent(window, 'offline').pipe(map(() => false)),
      fromEvent(window, 'online').pipe(map(() => true)),
      new Observable((sub: Observer<boolean>) => {
        sub.next(navigator.onLine);
        sub.complete();
      }));
  }

  ngOnInit(){
    this.header();
    this.createOnline$().subscribe(isOnLine => {
      if(!isOnLine) console.log("i am offline");
      this.amIOnline = isOnLine;
    });
    this.reusable.titleHeader.subscribe(name=>{
      this.modName = name;
    });
    this.reusable.curRoute.subscribe(route=>{
      this.curRoute = route;
    });
    this.reusable.headHt.subscribe(h => {
      if (screen.width < 900){
        this.isMobileView = true;
      }
      else {
        this.isMobileView = false;
      }
    });
  }

  ngOnDestroy(){
    document.body.className="";
  }

  async header(mode?:boolean) {
    if (this.reusable.loggedIn()){
      this.showProfile = true;
      this.userDetails = ReusableComponent.usr
    }
  }

  async logout() {
    let userDet=ReusableComponent.usr;
    if (userDet.user_id > 0) {
      let data={id: userDet.user_id};
      let result = await this.authService.logoutUser(data);
      if (!result.success){
        this.reusable.openAlertMsg(this.authService.invalidSession(result),"error");
      }
    }
    //this.authService.logout();
    this.router.navigate(['/login']);
    setTimeout(()=>{this.authService.logout()},100);
  }

  hideHeader() {
    this.showHeader = this.showHeader ? false : true ;
  }
}
