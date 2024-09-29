import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPageSubnetsComponent } from './view-page-subnets.component';

describe('ViewPageSubnetsComponent', () => {
  let component: ViewPageSubnetsComponent;
  let fixture: ComponentFixture<ViewPageSubnetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewPageSubnetsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewPageSubnetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
