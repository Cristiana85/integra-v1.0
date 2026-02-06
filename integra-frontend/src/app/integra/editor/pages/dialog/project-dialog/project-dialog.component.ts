import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DialogService } from 'src/app/integra/editor/services/dialog.service';

@Component({
  selector: 'integra-project-dialog',
 standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    InputTextModule,
    InputTextareaModule,
    RadioButtonModule,
    InputSwitchModule,
    ButtonModule,
  ],
  templateUrl: './project-dialog.component.html',
  styleUrl: './project-dialog.component.scss'
})
export class ProjectDialogComponent implements OnInit {
  displayDialog: boolean = false;
  projectName: string = 'Untitled Black Project';
  projectDescription: string = 'A brief description of my project';
  privacy: string = 'public';
  useTemplate: boolean = false;

  constructor(private dialogService: DialogService) {}

  ngOnInit() {
    this.dialogService.showDialog$.subscribe((show) => {
      this.displayDialog = show; // Update visibility based on service state
    });
  }

  // Save the changes
  closeDialog() {
    console.log({
      name: this.projectName,
      description: this.projectDescription,
      isPublic: this.privacy,
      useTemplate: this.useTemplate
    });
    this.dialogService.closeDialog();
  }

}
