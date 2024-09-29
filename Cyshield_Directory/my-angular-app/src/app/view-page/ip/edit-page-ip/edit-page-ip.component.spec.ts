import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPageIpComponent } from './edit-page-ip.component';

describe('EditPageIpComponent', () => {
  let component: EditPageIpComponent;
  let fixture: ComponentFixture<EditPageIpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditPageIpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPageIpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
