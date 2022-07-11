import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MaterialModule } from '../material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SopAddEditRoutingModule } from './sop-add-edit-routing.module';
import { SopAddEditComponent, ContactAddEditDialog,DocAddEditDialog, CompanyAddEditDialog, ChSopEditDialog,CarrierAddEditDialog, CopySopDialog, CarrierPrefAddEditDialog, ContainerPrefEditDialog, POBSopEditDialog } from './sop-add-edit.component';
import { LoginHeaderModule } from '../login-header/login-header.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    FlexLayoutModule,
    SopAddEditRoutingModule,
    MaterialModule,
    LoginHeaderModule,
  ],
  declarations: [
    SopAddEditComponent,
    ContactAddEditDialog,
    DocAddEditDialog,
    CompanyAddEditDialog,
    ChSopEditDialog,
    CarrierAddEditDialog,
    CopySopDialog,
    CarrierPrefAddEditDialog,
    ContainerPrefEditDialog,
    POBSopEditDialog
  ],
  providers: [
  ],
})
export class SopAddEditModule { }

