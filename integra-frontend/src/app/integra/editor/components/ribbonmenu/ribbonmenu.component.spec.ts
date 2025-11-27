import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RibbonmenuComponent } from './ribbonmenu.component';

describe('RibbonmenuComponent', () => {
  let component: RibbonmenuComponent;
  let fixture: ComponentFixture<RibbonmenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RibbonmenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RibbonmenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
