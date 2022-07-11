import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModuleRoutingModule } from './module-routing.module';
import { ModuleComponent, AddEditModuleComponent, ModuleDetails } from './module.component';
import { MaterialModule } from '../material';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginHeaderModule } from '../login-header/login-header.module';

@NgModule({
  declarations: [ModuleComponent, AddEditModuleComponent, ModuleDetails],
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    FlexLayoutModule,
    LoginHeaderModule,
    FormsModule, 
    ReactiveFormsModule,
    ModuleRoutingModule
  ]
})
export class ModuleModule { }
