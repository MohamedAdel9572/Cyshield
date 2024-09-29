import { Component } from '@angular/core';
import { FetchDataService, IP, Subnet } from '../../../api/fetch_data/fetch-data.service';

@Component({
  selector: 'app-view-page-ips',
  templateUrl: './view-page-ips.component.html',
  styleUrls: ['./view-page-ips.component.css']
})
export class ViewPageIpsComponent {
  subnets: Subnet[] = [];
  ips: IP[] = [];

  constructor(private fetchDataService: FetchDataService) { }

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
