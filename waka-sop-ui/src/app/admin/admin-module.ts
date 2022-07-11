import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';

@NgModule({
    imports: [
      CommonModule,
      FlexLayoutModule,
      MaterialModule,
      AdminRoutingModule
    ],
    declarations: [
        AdminComponent
    ],
    providers: [
    ],
})

export class AdminModule { }
  
  