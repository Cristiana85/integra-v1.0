import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegraTopbarComponent } from './integra-topbar.component';

describe('IntegraTopbarComponent', () => {
  let component: IntegraTopbarComponent;
  let fixture: ComponentFixture<IntegraTopbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntegraTopbarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IntegraTopbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
