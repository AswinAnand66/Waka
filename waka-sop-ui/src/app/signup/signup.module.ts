import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { SignupRoutingModule } from './signup-routing.module';
import { SignupComponent } from './signup.component';
import { MaterialModule } from '../material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SplashHeaderModule } from '../splash-header/splash-header.module';

@NgModule({
  imports: [
    CommonModule,
    SignupRoutingModule,
    FormsModule, 
    ReactiveFormsModule,
    MaterialModule,
    FlexLayoutModule,
    SplashHeaderModule
  ],
  declarations: [
    SignupComponent
  ],
})

export class SignupModule { }