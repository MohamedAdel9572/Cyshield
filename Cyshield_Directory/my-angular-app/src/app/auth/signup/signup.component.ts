import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // Import Router
import { AuthService } from 'src/app/api/auth/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  // FormGroup: This helps to track the value and validation status of each input field.
  form: UntypedFormGroup;

  errorMessage: string = "";

  constructor(private fb: UntypedFormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      username: new UntypedFormControl('', [Validators.required, Validators.minLength(6)]),
      email: new UntypedFormControl('', [Validators.required, Validators.email]),
      password: new UntypedFormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  async onSubmit() {
    if (this.form.valid) {
      console.log(this.form.value);

      const user = {
        id: 0,
        username: this.form.value.username,
        email: this.form.value.email,
        password: this.form.value.password,
        role: "Default",
      };

      await this.authService.register(user).subscribe(
        response => {
          console.log('Response:', response);
          this.router.navigate(['/login']);
        },
        error => {
          this.errorMessage = error;
          console.error('Error:', error);
        }
      );
    }
    this.errorMessage="Fill the form correctly [email: example@domain.com, username and password: Min 6 characters]"
  }

  ngOnInit(): void {
  }
}