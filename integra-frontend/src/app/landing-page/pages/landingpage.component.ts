import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-landingpage',
  standalone: true,
  imports: [RouterModule, SharedModule],
  templateUrl: './landingpage.component.html',
  styleUrl: './landingpage.component.scss'
})
export class LandingpageComponent implements OnInit {

  testimonials = [
    {
      image: 'https://via.placeholder.com/100',
      text: 'This platform helped me grow my business by 300% in just 3 months!',
      name: 'John Doe',
      role: 'Entrepreneur'
    },
    {
      image: 'https://via.placeholder.com/100',
      text: 'PrimeBlocks offers incredible customization and ease of use.',
      name: 'Jane Smith',
      role: 'Marketing Specialist'
    },
    {
      image: 'https://via.placeholder.com/100',
      text: 'Amazing tools for developers and designers alike!',
      name: 'Mark Wilson',
      role: 'Developer'
    }
  ];

  ngOnInit(): void {

  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
