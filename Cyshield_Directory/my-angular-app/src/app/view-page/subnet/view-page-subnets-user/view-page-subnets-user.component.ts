import { Component } from '@angular/core';
import { FetchDataService, IP, Subnet } from '../../../api/fetch_data/fetch-data.service';
import { AuthService } from '../../../api/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-page-subnets-user',
  templateUrl: './view-page-subnets-user.component.html',
  styleUrls: ['./view-page-subnets-user.component.css']
})
export class ViewPageSubnetsUserComponent {
  subnets: Subnet[] = [];
  token: string | null = null;
  user: { username: string, email: string, password: string, role: string } | null = null;

  username=""

  constructor(private fetchDataService: FetchDataService,private authService: AuthService,private router: Router) { }

  ngOnInit(): void {

    this.user = this.authService.getUserData();
    this.token=this.authService.getToken();

    this.fetchDataService.getSubnetsByUsername().subscribe(
      (subnets) => {
        this.subnets = subnets;
      },
      (error) => {
        console.error('Error fetching subnets:', error);
      }
    );
    
  }

  editSubnet(subnet: Subnet): void {
    // Navigate to the edit page and pass the SubnetId
    this.router.navigate(['/edit-page-subnet', subnet.SubnetId]);
  }


  deleteSubnet(subnetId: number): void {
    console.log('Deleting subnet with ID:', subnetId);
    this.fetchDataService.deleteSubnet(subnetId).subscribe(
        () => {
            // Filter out the deleted subnet from the local array
            this.subnets = this.subnets.filter(subnet => subnet.SubnetId !== subnetId);
            console.log(`Subnet with ID ${subnetId} deleted successfully.`);
        },
        (error) => {
            console.error('Error deleting subnet:', error);
        }
    );
}

  

}
