import { Component, OnInit } from '@angular/core'; 
import { FetchDataService, IP, Subnet } from '../../../api/fetch_data/fetch-data.service';
import { AuthService } from 'src/app/api/auth/auth.service';

@Component({
  selector: 'app-view-page-subnets',
  templateUrl: './view-page-subnets.component.html',
  styleUrls: ['./view-page-subnets.component.css']
})
export class ViewPageSubnetsComponent implements OnInit {
  subnets: Subnet[] = [];
  ips: IP[] = [];
  token: string | null = null;

  constructor(private fetchDataService: FetchDataService, private authService: AuthService) {
    this.token=this.authService.getToken();
   }

  ngOnInit(): void {
    this.fetchDataService.getSubnets().subscribe(
      (subnets) => {
        this.subnets = subnets;
      },
      (error) => {
        console.error('Error fetching subnets:', error);
      }
    );

    this.fetchDataService.getIPs().subscribe(
      (ips) => {
        this.ips = ips;
      },
      (error) => {
        console.error('Error fetching IPs:', error);
      }
    );
  }
}
