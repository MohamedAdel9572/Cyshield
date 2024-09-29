import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPageSubnetComponent } from './edit-page-subnet.component';

describe('EditPageSubnetComponent', () => {
  let component: EditPageSubnetComponent;
  let fixture: ComponentFixture<EditPageSubnetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditPageSubnetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPageSubnetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
