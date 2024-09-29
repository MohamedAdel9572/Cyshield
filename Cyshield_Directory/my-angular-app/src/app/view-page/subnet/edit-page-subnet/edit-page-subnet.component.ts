import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FetchDataService, Subnet } from 'src/app/api/fetch_data/fetch-data.service';

@Component({
  selector: 'app-edit-page-subnet',
  templateUrl: './edit-page-subnet.component.html',
  styleUrls: ['./edit-page-subnet.component.css']
})
export class EditPageSubnetComponent implements OnInit {  // Implement OnInit
  subnetId: number | null = null;  // To hold the subnet ID
  subnet: Subnet = { 
    SubnetId: 0, 
    SubnetName: '', 
    SubnetAddress: '', 
    CreatedBy: 0,
    CreatedAt: new Date() 
  };

  constructor(
    private route: ActivatedRoute,  // Inject ActivatedRoute
    private fetchDataService: FetchDataService,  // Inject your data service
    private router: Router  // Inject Router for navigation
  ) {}

  ngOnInit(): void {
    // Get the subnetId from the URL
    this.subnetId = Number(this.route.snapshot.paramMap.get('subnetId')); // Capture subnetId as a number
  
    // Fetch the subnet details using the ID
    this.fetchDataService.getSubnetBySubnetId(this.subnetId).subscribe(
      (subnet) => {
        console.log('Fetched Subnet:', subnet);
        this.subnet = subnet; // Store the fetched subnet data
      },
      (error) => {
        console.error('Error fetching subnet:', error);
      }
    );
  }

  // Implement a save method to update the subnet if needed
  save(): void {
    this.fetchDataService.updateSubnet(this.subnet).subscribe(
      (response) => {
        console.log('Sdsd', response);
        // Optionally, navigate to another page or show a success message
        this.router.navigateByUrl("/view-page-subnets-user", { replaceUrl: true });
      },
      (error) => {
        console.error('Error updating subnet:', error);
        // Optionally, show an error message
      }
    );
  }

  cancel(): void{
    this.router.navigateByUrl("/view-page-subnets-user", { replaceUrl: true });
  }
}
