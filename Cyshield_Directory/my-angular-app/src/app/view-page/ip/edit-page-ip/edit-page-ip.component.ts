import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FetchDataService, IP } from 'src/app/api/fetch_data/fetch-data.service';

@Component({
  selector: 'app-edit-page-ip',
  templateUrl: './edit-page-ip.component.html',
  styleUrls: ['./edit-page-ip.component.css']
})
export class EditPageIpComponent {
  ipId: number | null = null;  // To hold the subnet ID
  ip: IP = { 
    IpId: 0, 
    IpAddress: '', 
    SubnetId:0,
    CreatedBy: 0,
    CreatedAt: new Date() 
  };

  constructor(
    private route: ActivatedRoute,  // Inject ActivatedRoute
    private fetchDataService: FetchDataService,  // Inject your data service
    private router: Router  // Inject Router for navigation
  ) {}

  ngOnInit(): void {
    // Get the ipid from the URL
    this.ipId = Number(this.route.snapshot.paramMap.get('ipId')); // Capture ipid as a number
  
    // Fetch the subnet details using the ID
    this.fetchDataService.getIpByIpId(this.ipId).subscribe(
      (ip) => {
        console.log('Fetched Subnet:', ip);
        this.ip = ip; // Store the fetched subnet data
      },
      (error) => {
        console.error('Error fetching subnet:', error);
      }
    );
  }

  // Implement a save method to update the subnet if needed
  save(): void {
    this.fetchDataService.updateIp(this.ip).subscribe(
      (response) => {
        console.log('response:', response);
        // Optionally, navigate to another page or show a success message
        this.router.navigateByUrl("/view-page-your-ips", { replaceUrl: true });
      },
      (error) => {
        console.error('Error updating ip:', error);
        // Optionally, show an error message
      }
    );
  }

  cancel(): void{
    this.router.navigateByUrl("/view-page-your-ips", { replaceUrl: true });
  }
}

