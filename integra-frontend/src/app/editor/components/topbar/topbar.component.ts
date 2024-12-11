import { Component, Input } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { VIEW_PANEL_SIZE } from '../../utilities/editor-constants';

@Component({
  selector: 'integra-topbar',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {

  public topbar_height: number = VIEW_PANEL_SIZE.TOPBAR_HEIGHT;

  @Input() projectName: string;

  isEditing: boolean = false; // Tracks if the input is open
  inputValue: string = 'test'; // Holds the input value

  toggleInput(): void {
    this.isEditing = true; // Show the input field
  }

  closeInput(): void {
    this.isEditing = false; // Hide the input field when focus is lost
  }

  submitInput(): void {
    this.isEditing = false; // Submit the input and hide the field
    console.log('Input submitted:', this.inputValue); // Add your logic here
  }

}
