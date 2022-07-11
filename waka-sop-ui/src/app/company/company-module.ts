import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { CompanyRoutingModule } from './company-routing.module';
import { LoginHeaderModule } from '../login-header/login-header.module';
import { MatStepperModule } from '@angular/material/stepper';
import { CompanyComponent, CompanyAddEdit, CompanyManageLicenseComponent, InviteCompanyComponent, AddContactCompanyComponent, AddContactCompanyDialogComponent, InviteCompanyAddDialogComponent, CompanyAddEditUploadLogoComponent, CompanyCardViewComponent,AssociatedCompanyCardViewComponent } from './company.component';

@NgModule({
    imports: [
      CommonModule,
      FlexLayoutModule,
      MaterialModule,
      CompanyRoutingModule,
      FormsModule,
      LoginHeaderModule,
      ReactiveFormsModule,
      MatStepperModule,
    ],
    declarations: [
        CompanyComponent,
        CompanyAddEdit,
        InviteCompanyComponent, 
        AddContactCompanyComponent,
        AddContactCompanyDialogComponent, 
        InviteCompanyAddDialogComponent,
        CompanyManageLicenseComponent,
        CompanyAddEditUploadLogoComponent,
        CompanyCardViewComponent,
        AssociatedCompanyCardViewComponent
    ],
    providers: [
    ],
})

export class CompanyModule { }
  
  