import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ForgotPasswordRoutingModule } from './forgot-password-routing.module';
import { ForgotPasswordComponent } from './forgot-password.component';
import { MaterialModule } from '../material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SplashHeaderModule } from '../splash-header/splash-header.module';

@NgModule({
  imports: [
    CommonModule,
    ForgotPasswordRoutingModule,
    FormsModule, 
    ReactiveFormsModule,
    MaterialModule,
    FlexLayoutModule,
    SplashHeaderModule
  ],
  declarations: [
    ForgotPasswordComponent,
  ],
})

export class ForgotPasswordModule { }