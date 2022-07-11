import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapServicesRoutingModule } from './map-services-routing.module';
import { MapServicesComponent, ServicesMapping, ViewMappedServicesDialog } from './map-services.component';
import { MaterialModule } from '../material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    MapServicesComponent,
    ServicesMapping,
    ViewMappedServicesDialog
  ],
  imports: [
    CommonModule,
    MapServicesRoutingModule,
    MaterialModule,
    FlexLayoutModule,
    FormsModule, 
    ReactiveFormsModule 
  ]
})
export class MapServicesModule { }
