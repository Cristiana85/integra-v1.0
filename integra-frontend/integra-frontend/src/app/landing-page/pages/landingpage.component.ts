import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-landingpage',
  standalone: true,
  imports: [],
  templateUrl: './landingpage.component.html',
  styleUrl: './landingpage.component.scss'
})
export class LandingpageComponent implements OnInit {

  ngOnInit(): void {
    console.log('test');
  }

}
