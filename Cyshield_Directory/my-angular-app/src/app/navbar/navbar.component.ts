import { Component, OnInit } from '@angular/core';
import { AuthService } from '../api/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isLoggedIn: boolean = false;
  user: { username: string, email: string, password: string } | null = null;

  constructor(private authService: AuthService, private router:Router) {}

  ngOnInit(): void {
    // Subscribe to the isLoggedIn$ observable
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      this.user = this.authService.getUserData();
    });
  }

  logout(): void {
    this.authService.logout();
    
  }
}