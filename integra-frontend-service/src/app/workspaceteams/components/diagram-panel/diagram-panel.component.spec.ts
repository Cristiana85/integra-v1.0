import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JointjsViewComponent } from './diagram-panel.component';

describe('JointjsViewComponent', () => {
  let component: JointjsViewComponent;
  let fixture: ComponentFixture<JointjsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JointjsViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(JointjsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
