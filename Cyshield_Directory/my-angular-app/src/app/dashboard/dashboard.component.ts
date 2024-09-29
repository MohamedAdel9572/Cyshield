import { Component, OnInit } from '@angular/core';
import { AuthService } from '../api/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  token: string | null = null;
  user: { username: string, email: string, password: string, role: string } | null = null;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    // Retrieve the token and user data from AuthService
    this.token = this.authService.getToken();
    this.user = this.authService.getUserData();

    // Debugging: Log the user data to the console
    console.log('User Data:', this.user);
  }
  ViewYourIPs():void{
    
  }

  logout(): void {
    this.authService.logout();
  }
}
