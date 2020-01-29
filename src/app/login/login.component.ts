import { Component, OnInit } from '@angular/core';
import {FormControl, FormBuilder, Validators, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {CredentialsService} from './credentials-service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  hideRequiredMarker: boolean;
  credentials: FormGroup;
  titleAlert: String = 'This field is required';
  credentialsService: CredentialsService;


  constructor(credentialsService: CredentialsService) {
    this.credentialsService = credentialsService;
  }

  ngOnInit() {
    this.createForm();
    // this.setChangeValidate();
  }

  createForm() {
    this.credentials = new FormGroup({
      email: new FormControl('', [Validators.email, Validators.required]),
      password: new FormControl('', [Validators.required])});
  }

  setChangeValidate() {
    this.credentials.get('validate').valueChanges.subscribe(
      (validate) => {
        if (validate === '1') {
          this.credentials.get('name').setValidators([Validators.required, Validators.minLength(3)]);
          this.titleAlert = 'You need to specify at least 3 characters';
        } else {
          this.credentials.get('name').setValidators(Validators.required);
        }
        this.credentials.get('name').updateValueAndValidity();
      }
    );
  }

  getErrorEmail() {
    return this.credentials.get('email').hasError('required') ? 'Field is required' :
      this.credentials.get('email').hasError('pattern') ? 'Not a valid emailaddress' :
        this.credentials.get('email').hasError('alreadyInUse') ? 'This emailaddress is already in use' : '';
  }

  login() {
    this.credentialsService.login(this.credentials.value.email, this.credentials.value.password);
  }

  sendCredentials(): void {
    // send message to subscribers via observable subject
    this.credentialsService.sendCredentials({email: this.credentials.value.email, pwd: this.credentials.value.password});
  }

  clearCredentials(): void {
    // clear messages
    this.credentialsService.clearCredentials();
  }
}
