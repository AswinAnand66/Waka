import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LookupRoutingModule } from './lookup-routing.module';
import { LookupComponent, AddEditLookupComponent } from './lookup.component';
import { MaterialModule } from '../material';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginHeaderModule } from '../login-header/login-header.module';

@NgModule({
  declarations: [LookupComponent, AddEditLookupComponent],
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    FlexLayoutModule,
    LoginHeaderModule,
    FormsModule, 
    ReactiveFormsModule,
    LookupRoutingModule
  ]
})
export class LookupModule { }
