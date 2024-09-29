import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SignupComponent } from './auth/signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FileUpdateComponent } from './file-update/file-update.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './api/auth/auth.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NavbarComponent } from './navbar/navbar.component';
import { ViewPageSubnetsComponent } from './view-page/subnet/view-page-subnets/view-page-subnets.component';
import { LoginComponent } from './auth/login/login.component';
import { ViewPageIpsComponent } from './view-page/ip/view-page-ips/view-page-ips.component';
import { ViewPageSubnetsUserComponent } from './view-page/subnet/view-page-subnets-user/view-page-subnets-user.component';
import { EditPageSubnetComponent } from './view-page/subnet/edit-page-subnet/edit-page-subnet.component';
import { EditPageIpComponent } from './view-page/ip/edit-page-ip/edit-page-ip.component';
import { ViewPageIpsUserComponent } from './view-page/ip/view-page-ips-user/view-page-ips-user.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    NavbarComponent,
    DashboardComponent,
    FileUpdateComponent,
    ViewPageSubnetsComponent,
    ViewPageIpsComponent,
    ViewPageSubnetsUserComponent,
    EditPageSubnetComponent,
    EditPageIpComponent,
    ViewPageIpsUserComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    FormsModule
    
],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
