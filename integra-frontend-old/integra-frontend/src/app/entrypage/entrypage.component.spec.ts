import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntrypageComponent } from './entrypage.component';

describe('EntrypageComponent', () => {
  let component: EntrypageComponent;
  let fixture: ComponentFixture<EntrypageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntrypageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntrypageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
