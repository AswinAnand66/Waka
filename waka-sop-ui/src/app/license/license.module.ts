import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LicenseRoutingModule } from './license-routing.module';
import { LicenseComponent,ManageLicenseComponent } from './license.component';
import { MaterialModule } from '../material';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginHeaderModule } from '../login-header/login-header.module';

@NgModule({
  declarations: [LicenseComponent,ManageLicenseComponent],
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    FlexLayoutModule,
    LoginHeaderModule,
    FormsModule, 
    ReactiveFormsModule,
    LicenseRoutingModule
  ]
})
export class LicenseModule { }
