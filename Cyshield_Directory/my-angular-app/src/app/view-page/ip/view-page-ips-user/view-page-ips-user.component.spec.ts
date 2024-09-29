import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPageIpsUserComponent } from './view-page-ips-user.component';

describe('ViewPageIpsUserComponent', () => {
  let component: ViewPageIpsUserComponent;
  let fixture: ComponentFixture<ViewPageIpsUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewPageIpsUserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewPageIpsUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
