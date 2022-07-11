import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../_services/index';
import { MatSort, Sort } from '@angular/material/sort';
import { ReusableComponent } from '../reusable/reusable.component';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-scheduler-status',
  templateUrl: './scheduler-status.component.html',
  styleUrls: ['./scheduler-status.component.css']
})
export class SchedulerStatusComponent implements OnInit {

  isLoading: boolean = false;
  isDataLoading: boolean = false;
  screenParam: any;
  isMobile: boolean = false;
  ht: number;
  width: number;
  schedulersColl = [];

  constructor(
    private reusable: ReusableComponent,
    private router: Router,
    private authService: AuthenticationService,
  ) { }

  ngOnInit(): void {
    this.reusable.screenChange.subscribe(res => {
      this.screenParam = { width: res.width, height: res.height };
      this.ht = res['height'] - 64;
      this.width = res["width"] - 64;
      if (this.screenParam.width < 600) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });
    this.reusable.headHt.next(0);
    this.reusable.titleHeader.next("Schedulers Status");
    this.reusable.curRoute.next('admin/');
    this.getRegisteredSchedulers();
    setTimeout(() => {
      this.getRegisteredSchedulers();
    }, 5 * 60000);
  }

  async getRegisteredSchedulers() {
    this.isLoading = true;
    let result = await this.authService.getRegisteredSchedulers();
    this.isLoading = false;
    if (result.success) {
      this.schedulersColl = result.result;
      console.log(this.schedulersColl);
    } else {
      this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
    }
  }

  availabilityChecker(lastAvailable: any){
    let currDate = new Date(new Date().getTime() - 5 * 60000).toLocaleString();
    let date = new Date(lastAvailable).toLocaleString();
    console.log("currDate", currDate, date);
    if(currDate <= date) {
      return true
    } else {
      return false
    }
  }

  viewLog(name: string) {
    sessionStorage.setItem("schedulerLogger", name);
    this.router.navigate(['/nav/admin/scheduler-status/log']);
  }
}

@Component({
  selector: 'app-scheduler-status-log',
  templateUrl: './scheduler-status-log.component.html',
  styleUrls: ['./scheduler-status.component.css']
})
export class SchedulerStatusLogComponent implements OnInit {
  isLoading: boolean = false;
  userDetails: any;
  screen: { width: number; height: number; };
  logType: string;
	runningStatusColl = new MatTableDataSource([]);
	dispcolumn = [];
  currentPage: number = 0;
  prevPage: number;
  spliceIndex = 0;
  pageSize: number = 0;
  contentLength: number;
  height: number;
	width: number;
	poiTableHeight: number;
  isMobileView:Boolean = false;
  offset = 0; limit = 40; isFetched = false;

  @ViewChild('TablePaginator', { static: true }) tablePaginator: MatPaginator;
  @ViewChild('TableSort', { static: true }) tableSort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('matTable', { static: false }) set table(matTable: MatTable<any>) {
    if (matTable) {
      this.ngZone.onMicrotaskEmpty
        .pipe(take(3))
        .subscribe(() => matTable.updateStickyColumnStyles())
    }
  }
  constructor(
    private reusable: ReusableComponent,
    private authService: AuthenticationService,
    private router: Router,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    if (sessionStorage.getItem("schedulerLogger")) {
      this.logType = sessionStorage.getItem("schedulerLogger");
    }
    if (this.logType == 'PO Ingestion') {
      this.dispcolumn = ["executed_on", "poi_id", "company_id", "response", "schema", "master"];
    } else if (this.logType == 'Shipment Booking') {
      this.dispcolumn = ["executed_on", "sop_id", "principal_id", "response", "schema", "master"];
    }
    this.reusable.headHt.next(60);
    this.reusable.titleHeader.next(this.logType +" Scheuler Running Status");
    this.reusable.curRoute.next('admin/scheduler-status');
    this.reusable.screenChange.subscribe(res => {
      this.screen = { width: res.width - 112, height: res.height - 70 };
    });
    this.reusable.screenChange.subscribe(screen => {
      if (screen.height < 600) {
			  this.height = screen.height
			} else {
			  this.height = screen.height-60;
			}
			if (screen.width < 900){
				this.isMobileView = true;
			} else {
				this.isMobileView = false;
			}
			this.width = screen.width - 80;
      this.poiTableHeight = this.height - 160;
    });
    this.getSchedulerLog(this.offset, this.limit);
  }

  handlePagination = (scrolled: boolean) => {
    if (scrolled) {
      this.offset += this.limit;
      this.getSchedulerLog(this.offset, this.limit);
    }
  }

  public getPaginatorData(event: PageEvent): PageEvent {
    if (!this.tablePaginator.hasNextPage()) {
      if(this.hasMore())
        this.handlePagination(true);
    }
    return event;
  }

  hasMore(){
    return this.isFetched;
  }

  async getSchedulerLog(offset?:number, limit?:number) {
    let reset = false;
    if (offset == undefined){offset = this.offset = 0; reset = true; } 
    if (limit == undefined) limit = 40;
		const param = {
			type: this.logType,
      offset,
      limit
		}
		let result = await this.authService.getSchedulerLog({ param: this.reusable.encrypt(JSON.stringify(param)) });
		if (result.success) {
      this.isFetched = true;
      if(this.runningStatusColl.data.length == 0 || reset){
			this.runningStatusColl = new MatTableDataSource(result.result);
      } else {
        let newData = this.runningStatusColl.data.concat(result.result);
			this.runningStatusColl = new MatTableDataSource(newData);
      }
			this.runningStatusColl.sort = this.tableSort;
      this.runningStatusColl.paginator = this.paginator;
      this.pageSize = Math.round( this.poiTableHeight / 50);
      this.paginator._changePageSize(this.pageSize);
      this.contentLength = this.runningStatusColl.data.length;
		}
		else {
			this.reusable.openAlertMsg(this.authService.invalidSession(result), "error");
		}
	}

  sortData(sort: Sort) {
    this.runningStatusColl.data = this.runningStatusColl.data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'executed_on':
          return this.compare(a.received_on, b.received_on, isAsc);
        case 'response':
          return this.compare(a.response, b.response, isAsc);
        default:
          return 0;
      }
    });
  }
  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  changePage(event) {
    this.currentPage = event.pageIndex;
    this.prevPage = event.previousPageIndex;
    this.getPaginatorData(event)
  }

  goBack() {
    this.router.navigate(['/nav/admin/scheduler-status']);
  }
}