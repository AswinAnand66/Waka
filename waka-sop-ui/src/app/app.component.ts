import { Component, HostListener } from '@angular/core';
import { ReusableComponent } from './reusable/reusable.component';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
	constructor(
		private reusable: ReusableComponent,
    private deviceService: DeviceDetectorService
	) {	}

  resizeId: any;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
      clearTimeout(this.resizeId);
      this.resizeId = setTimeout(() => {
        this.reusable.screenChange.next({height:event.target.innerHeight, width:event.target.innerWidth});
      }, 2000);
      this.reusable.device = this.deviceService.isMobile() ? 'mobile' : this.deviceService.isTablet() ?'tablet' : 'desktop';
      this.reusable.orientation = this.deviceService.orientation;
      console.log(this.reusable.device, this.reusable.orientation);
  }
}
