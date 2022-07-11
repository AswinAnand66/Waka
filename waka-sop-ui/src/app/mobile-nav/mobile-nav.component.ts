import { ChangeDetectorRef, Component, HostListener, Inject, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { AuthenticationService} from '../_services/index';
import { ReusableComponent } from '../reusable/reusable.component';
import { Observable, Observer, fromEvent, merge, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
 
@Component({
  selector: 'app-mobile-nav',
  templateUrl: './mobile-nav.component.html',
  styleUrls: ['./mobile-nav.component.css'],
})

export class MobileNavComponent {
  isLoading = false;
  showHeader = true;
  showProfile = false;
  cusName:string = environment.customer;
  cusLogo:string = environment.customer_logo;
  cusLogoSmall:string = environment.customer_small_logo;
  myDashSelVal:any; 
  myDashColl=[];
  userDet:any; 
  entObj:any;
  online$: any;
  amIOnline:any = true;
  isMobile:boolean = false;
  fxLGap = "50px"
  enableMyAccount:boolean = false;
  userName:string | undefined;
  profile_photo:string | null;
  qrySearch:string = '';
  isFullScreen = false;
  selNav:string ;
  selBdr:string ;
  width: number = window.innerWidth;
  device: string = 'destop';
  orientation:string ='landscape';
  oldImage1path;
  selectedToolSubscription;
  height = 400;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private reusable: ReusableComponent,
    private cd: ChangeDetectorRef,
  ) { 
  }
  
  createOnline$() {
    return merge<unknown[]>(
      fromEvent(window, 'offline').pipe(map(() => false)),
      fromEvent(window, 'online').pipe(map(() => true)),
      new Observable((sub: Observer<boolean>) => {
        sub.next(navigator.onLine);
        sub.complete();
      }));
  }

  ngOnInit(){
    this.device = this.reusable.device;
    this.createOnline$().subscribe(isOnLine => {
      if(!isOnLine) console.log("i am offline");
      this.amIOnline = isOnLine;
    });
    this.reusable.screenChange.subscribe(screen =>{
      this.height = screen.height;
      this.width = screen.width;
      if (screen.width < 900){
        this.isMobile = true;
        this.fxLGap = '10px';
      }
      else {
        this.isMobile = false;
        this.fxLGap = '50px';
      }
    })
  }

  async navigate(mod) {
    if (mod == 'home') {
      this.router.navigate(['/nav/home']);
    }
    else if (mod == 'orders') {
      this.router.navigate(['/nav/orderpo']);
    }
    else if (mod == 'shipments') {
      this.router.navigate(['/nav/home']);
    }
    else if (mod == 'updates') {
      this.router.navigate(['/nav/home']);
    }
  }

}
