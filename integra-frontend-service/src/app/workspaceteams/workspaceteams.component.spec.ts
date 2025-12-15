import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceteamsComponent } from './workspaceteams.component';

describe('WorkspaceteamsComponent', () => {
  let component: WorkspaceteamsComponent;
  let fixture: ComponentFixture<WorkspaceteamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkspaceteamsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkspaceteamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
