import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPageSubnetsUserComponent } from './view-page-subnets-user.component';

describe('ViewPageSubnetsUserComponent', () => {
  let component: ViewPageSubnetsUserComponent;
  let fixture: ComponentFixture<ViewPageSubnetsUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewPageSubnetsUserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewPageSubnetsUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
