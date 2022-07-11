import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { SidenavRoutingModule } from './sidenav-routing.module';
import { SidenavComponent } from './sidenav.component';
import { MaterialModule } from '../material'
import { FlexLayoutModule } from '@angular/flex-layout';
import { LoginHeaderModule } from '../login-header/login-header.module';
import { MobileNavModule } from '../mobile-nav/mobile-nav.module';

@NgModule({
  imports: [
    CommonModule,
    SidenavRoutingModule,
    FormsModule, 
    ReactiveFormsModule,
    MaterialModule,
    FlexLayoutModule,
    LoginHeaderModule,
    MobileNavModule
  ],
  declarations: [
    SidenavComponent,
  ],
})

export class SidenavModule { }

