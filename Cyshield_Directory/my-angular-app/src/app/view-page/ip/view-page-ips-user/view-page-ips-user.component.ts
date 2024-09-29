import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/api/auth/auth.service';
import { FetchDataService, IP } from 'src/app/api/fetch_data/fetch-data.service';

@Component({
  selector: 'app-view-page-ips-user',
  templateUrl: './view-page-ips-user.component.html',
  styleUrls: ['./view-page-ips-user.component.css']
})
export class ViewPageIpsUserComponent {
  ips: IP[] = [];

  constructor(private fetchDataService: FetchDataService, private router: Router) { }

  ngOnInit(): void {

    this.fetchDataService.getIPs().subscribe(
      (ips) => {
        this.ips = ips;
      },
      (error) => {
        console.error('Error fetching IPs:', error);
      }
    );
  }

  editIp(ip: IP): void {
    // Navigate to the edit page and pass the IpId
    this.router.navigate(['/edit-page-ip', ip.IpId]);
  }


  deleteIp(ipId: number): void {
    console.log('Deleting IP with ID:', ipId);
    this.fetchDataService.deleteIp(ipId).subscribe(
        () => {
            // Filter out the deleted subnet from the local array
            this.ips = this.ips.filter(ip => ip.IpId !== ipId);
            console.log(`Subnet with ID ${ipId} deleted successfully.`);
        },
        (error) => {
            console.error('Error deleting subnet:', error);
        }
    );
}
}
