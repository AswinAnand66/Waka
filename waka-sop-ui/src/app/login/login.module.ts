import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
// import { MaterialModule } from '../material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { SplashComponent } from '../splash/splash.component';
import { SplashHeaderModule } from '../splash-header/splash-header.module';
import { PrintLayoutComponent } from '../print-layout/print-layout.component';
import { SopTemplateComponent } from '../sop-template/sop-template.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    FlexLayoutModule,
    MatDividerModule,
    LoginRoutingModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatIconModule,
    MatTableModule,
    SplashHeaderModule
  ],
  declarations: [
    LoginComponent,
    SplashComponent,
    PrintLayoutComponent,
    SopTemplateComponent
  ],
  providers: [
  ]
})
export class LoginModule { }

