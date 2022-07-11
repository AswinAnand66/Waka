import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SchedulerStatusComponent, SchedulerStatusLogComponent } from './scheduler-status.component'
const routes: Routes = [
  {
    path: '',
    component: SchedulerStatusComponent
  },
  {
    path: 'log',
    component: SchedulerStatusLogComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchedulerStatusRoutingModule { }
