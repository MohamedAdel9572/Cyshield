import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPageIpsComponent } from './view-page-ips.component';

describe('ViewPageIpsComponent', () => {
  let component: ViewPageIpsComponent;
  let fixture: ComponentFixture<ViewPageIpsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewPageIpsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewPageIpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
