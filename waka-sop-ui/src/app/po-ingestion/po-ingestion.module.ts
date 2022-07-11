import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PoIngestionRoutingModule } from './po-ingestion-routing.module';
import { PoIngestionComponent, PoIngestionConfigComponent, ValidationConfirmDialogComponent, MappingViewDialogComponent, PoIngestionSchemaComponent, PoIngestionMasterComponent, PoIngestionStatusComponent, InviteCompanyAddDialogComponent } from './po-ingestion.component';
import { MaterialModule } from '../material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileDragNDropDirective } from '../_directives/file-drag-n-drop.directive';


@NgModule({
  declarations: [
    PoIngestionComponent, 
    PoIngestionConfigComponent, 
    FileDragNDropDirective, 
    ValidationConfirmDialogComponent,
    MappingViewDialogComponent, 
    PoIngestionSchemaComponent,
    PoIngestionMasterComponent, 
    PoIngestionStatusComponent,
    InviteCompanyAddDialogComponent
  ],
  imports: [
    CommonModule,
    PoIngestionRoutingModule,
    MaterialModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class PoIngestionModule { }
