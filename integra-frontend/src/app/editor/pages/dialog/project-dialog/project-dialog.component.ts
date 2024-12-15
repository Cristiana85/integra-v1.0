import { Component, OnInit } from '@angular/core';
import { DialogService } from 'src/app/editor/services/dialog.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'integra-project-dialog',
  standalone: true,
  imports: [SharedModule],
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
