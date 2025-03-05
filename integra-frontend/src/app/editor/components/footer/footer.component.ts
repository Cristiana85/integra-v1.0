import { Component } from '@angular/core';
import { SliderModule } from 'primeng/slider';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'integra-footer',
  standalone: true,
  imports: [SharedModule, SliderModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  public sliderValue: number = 8; // Initial percentage for the slider

  // Triggered when the slider value changes
  public onSliderChange(event: any): void {
    //console.log('Slider Value Changed:', event.value);
  }

  // Triggered when the user releases the slider handle
  public onSliderEnd(event: any): void {
    //console.log('Slider Value Change Finished:', event.value);
  }
}
