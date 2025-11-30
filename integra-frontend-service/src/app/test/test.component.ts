import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'integra-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
})
export class TestComponent {
  constructor(private router: Router) {}

  go(path: string) {
    this.router.navigate([path]);
  }
}
