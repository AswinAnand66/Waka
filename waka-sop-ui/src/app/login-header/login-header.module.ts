import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LoginHeaderComponent } from './login-header.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    FlexLayoutModule,
  ],
  declarations: [LoginHeaderComponent],
  exports: [LoginHeaderComponent]
})
export class LoginHeaderModule { }

