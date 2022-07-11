import { NgModule, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RoleRoutingModule } from './role-routing.module';
import { RoleComponent, AddEditRoleComponent, ViewEventDialog } from './role.component';
import { LoginHeaderModule } from '../login-header/login-header.module';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';

@NgModule({
    imports: [
      CommonModule,
      FlexLayoutModule,
      MaterialModule,
      RoleRoutingModule,
      LoginHeaderModule,
      FormsModule,
      ReactiveFormsModule
    ],
    declarations: [
        RoleComponent,
        AddEditRoleComponent,
        ViewEventDialog
    ],
    providers: [
    ],
})

export class RoleModule { }
  
  