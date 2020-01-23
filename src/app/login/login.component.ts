import { Component, OnInit } from '@angular/core';
import {FormControl, FormBuilder, Validators, FormGroup} from '@angular/forms';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  hideRequiredMarker: boolean;
  options: FormGroup;
  email = new FormControl('', [Validators.required, Validators.email]);

  getErrorMessage() {
    return this.email.hasError('required') ? 'You must enter a value' :
      this.email.hasError('email') ? 'Not a valid email' :
        '';
  }
  constructor(fb: FormBuilder) { }

  ngOnInit() {
  }


}
