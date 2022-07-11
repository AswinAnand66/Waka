import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SplashHeaderComponent } from './splash-header.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    FlexLayoutModule,
  ],
  declarations: [SplashHeaderComponent],
  exports: [SplashHeaderComponent]
})
export class SplashHeaderModule { }

