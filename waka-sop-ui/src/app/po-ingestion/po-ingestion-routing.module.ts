import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PoIngestionComponent, PoIngestionConfigComponent, PoIngestionSchemaComponent, PoIngestionMasterComponent, PoIngestionStatusComponent } from './po-ingestion.component';

const routes: Routes = [
  {
    path: '',
    component: PoIngestionComponent
  },
  {
    path: 'config',
    component: PoIngestionConfigComponent
  },
  {
    path: 'schema_validation',
    component: PoIngestionSchemaComponent
  },
  {
    path: 'master_validation',
    component: PoIngestionMasterComponent
  },
  {
    path: 'running_status',
    component: PoIngestionStatusComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PoIngestionRoutingModule { }
