import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';  // Optional: to redirect after login
import { AuthService } from 'src/app/api/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  form: UntypedFormGroup;
  errorMessage: string = '';  // To display error messages

  constructor(
    private fb: UntypedFormBuilder,
    private authService: AuthService,  // Inject AuthService
    private router: Router  // Optional: Inject Router for navigation

  ) {
    // Form initialization
    this.form = this.fb.group({
      email: new UntypedFormControl('', [Validators.required, Validators.email]),
      password: new UntypedFormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.form.valid) {
      // Get form values
      const credentials = {
        id: 0,
        username: "",
        email: this.form.value.email,
        password: this.form.value.password,
        role: ""
      };
  
      // Call AuthService login function
      this.authService.login(credentials).subscribe(
        response => {
          const token = response.token;  // Assuming the backend returns token as 'token'
          this.authService.storeToken(token);  // Store the token in localStorage
  
          // Decode the token to extract username and role
          const decodedToken = this.authService.decodeToken(token);
          if (decodedToken) {
            console.log('Decoded Token:', decodedToken);
            credentials.username = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']; // Extract username
            credentials.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];  // Extract role
          }
  
          // Now store the credentials in localStorage after decoding the token
          this.authService.storeUserData(credentials);
  
          console.log('Login successful, token stored:', token, 'Credentials:', credentials);
  
          // Redirect to another page after successful login
          this.router.navigate(['/dashboard']); 
        },
        error => {
          this.errorMessage = 'Invalid login credentials';
          console.error('Login failed:', error);
        }
      );
    } else {
      this.errorMessage = 'Please enter valid login details.';
    }
  }
  
}
