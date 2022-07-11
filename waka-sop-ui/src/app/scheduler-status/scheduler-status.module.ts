import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SchedulerStatusRoutingModule } from './scheduler-status-routing.module';
import { SchedulerStatusComponent, SchedulerStatusLogComponent } from './scheduler-status.component';
import { MaterialModule } from '../material';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [SchedulerStatusComponent, SchedulerStatusLogComponent],
  imports: [
    CommonModule,
    SchedulerStatusRoutingModule,
    MaterialModule,
    FlexLayoutModule
  ]
})
export class SchedulerStatusModule { }
