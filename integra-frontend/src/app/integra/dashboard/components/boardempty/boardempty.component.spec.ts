import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatemptyComponent } from './boardempty.component';

describe('ChatemptyComponent', () => {
  let component: ChatemptyComponent;
  let fixture: ComponentFixture<ChatemptyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatemptyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatemptyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
