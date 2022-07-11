import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServicesRoutingModule } from './services-routing.module';
import { ServicesComponent, AddEditServicesComponent } from './services.component';
import { MaterialModule } from '../material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ServicesComponent,
    AddEditServicesComponent
  ],
  imports: [
    CommonModule,
    ServicesRoutingModule,
    MaterialModule,
    FlexLayoutModule,
    FormsModule, 
    ReactiveFormsModule 
  ]
})
export class ServicesModule { }
