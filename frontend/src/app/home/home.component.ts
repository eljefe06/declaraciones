import { Component, OnInit } from '@angular/core';
import { CredentialsService } from '@app/auth/credentials.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  username: string = null;
  nombre: string = null;
  primerApellido: string = null;
  constructor(credentialsService: CredentialsService) {
    this.username = credentialsService.credentials?.user.username;
    this.nombre = credentialsService.credentials?.user.nombre;
    this.primerApellido = credentialsService.credentials?.user.primerApellido;
  }
  ngOnInit() {}
}
