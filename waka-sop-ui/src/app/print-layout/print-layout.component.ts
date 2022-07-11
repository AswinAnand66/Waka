import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../_services/index';
import { ReusableComponent } from '../reusable/reusable.component';

@Component({
  selector: 'app-print-layout',
  templateUrl: './print-layout.component.html',
  styleUrls: ['./print-layout.component.scss']
})
export class PrintLayoutComponent implements OnInit {
  sop:any;
  date = new Date();
  p_logo:any;
  constructor(
    private authService: AuthenticationService,
    private reusable: ReusableComponent
  ) { }

  ngOnInit(): void {
    if (sessionStorage.getItem("sop")) {
			this.sop = JSON.parse(this.reusable.decrypt(sessionStorage.getItem("sop")));
      this.getLogo(this.sop.p_logo_path);
    }
  }

  async getLogo(path) {
		let img1Path = { filePath: path };
		this.authService.getCompanyLogo(img1Path).subscribe(img => {
			this.createImageFromBlob(img);
		});
	}

  createImageFromBlob(image: Blob) {
		let reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = (_event) => {
			this.p_logo = reader.result;
		}
	}

}
