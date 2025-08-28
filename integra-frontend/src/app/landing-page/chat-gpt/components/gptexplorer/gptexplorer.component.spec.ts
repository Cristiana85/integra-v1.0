import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GptexplorerComponent } from './gptexplorer.component';

describe('GptexplorerComponent', () => {
  let component: GptexplorerComponent;
  let fixture: ComponentFixture<GptexplorerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GptexplorerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GptexplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
