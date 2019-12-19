import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BimPropertyListComponent } from './bim-property-list.component';

describe('BimPropertyListComponent', () => {
  let component: BimPropertyListComponent;
  let fixture: ComponentFixture<BimPropertyListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BimPropertyListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BimPropertyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
