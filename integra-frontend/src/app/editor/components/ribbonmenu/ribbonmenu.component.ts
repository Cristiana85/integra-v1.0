import { Component, Input, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'integra-ribbonmenu',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './ribbonmenu.component.html',
  styleUrl: './ribbonmenu.component.scss'
})
export class RibbonmenuComponent implements OnInit {

  width = 50; // Width of the button in pixels
  height = 70; // Height of the button in pixels


  // Data structure for the sections
  sections = [
    {
      title: 'EDITOR',
      buttons: [
        { label: 'Community', icon: 'pi pi-users', isDropdown: false },
        { label: 'Request Support', icon: 'pi pi-question', isDropdown: false },
        {
          label: 'Learn',
          icon: 'pi pi-book',
          isDropdown: true,
          menuItems: [
            { label: 'MATLAB', icon: 'pi pi-external-link', command: () => alert('Learn MATLAB') }
          ]
        },
        {
          label: 'Semilogx',
          isDropdown: true,
          menuItems: [
            { label: '', image: 'assets/line-plot.png' },
            { label: '', image: 'assets/bar-chart.png' },
            { label: '', image: 'assets/scatter-plot.png' }
          ]
        }
      ]
    },
    {
      title: 'Plots',
      buttons: [
        { label: 'Semilogx', icon: 'pi pi-chart-line', isDropdown: false }
      ]
    },
    {
      title: 'Apps',
      buttons: [
        { label: 'Class Diagram Viewer', icon: 'pi pi-desktop', isDropdown: false }
      ]
    }
  ];

  ngOnInit() {

  }

}
