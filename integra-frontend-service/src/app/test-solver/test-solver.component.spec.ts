import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestSolverComponent } from './test-solver.component';

describe('TestSolverComponent', () => {
  let component: TestSolverComponent;
  let fixture: ComponentFixture<TestSolverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestSolverComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestSolverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
