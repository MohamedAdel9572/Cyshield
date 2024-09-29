import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ViewPageSubnetsComponent } from './view-page/subnet/view-page-subnets/view-page-subnets.component';
import { SignupComponent } from './auth/signup/signup.component';
import { FileUpdateComponent } from './file-update/file-update.component';
import { LoginComponent } from './auth/login/login.component';
import { ViewPageIpsComponent } from './view-page/ip/view-page-ips/view-page-ips.component';
import { ViewPageSubnetsUserComponent } from './view-page/subnet/view-page-subnets-user/view-page-subnets-user.component';
import { EditPageSubnetComponent } from './view-page/subnet/edit-page-subnet/edit-page-subnet.component';
import { ViewPageIpsUserComponent } from './view-page/ip/view-page-ips-user/view-page-ips-user.component';
import { EditPageIpComponent } from './view-page/ip/edit-page-ip/edit-page-ip.component';




const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'upload-page', component:  FileUpdateComponent},
  { path: 'view-page-subnets', component:  ViewPageSubnetsComponent},
  { path: 'edit-page-subnet/:subnetId', component:  EditPageSubnetComponent},
  { path: 'view-page-subnets-user', component:  ViewPageSubnetsUserComponent},
  { path: 'view-page-ips', component:  ViewPageIpsComponent},
  { path: 'view-page-your-ips', component:  ViewPageIpsUserComponent},
  { path: 'edit-page-ip/:ipId', component:  EditPageIpComponent},

  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
