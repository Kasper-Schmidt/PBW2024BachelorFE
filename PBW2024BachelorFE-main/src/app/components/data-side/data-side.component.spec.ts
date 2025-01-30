import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSideComponent } from './data-side.component';

describe('DataSideComponent', () => {
  let component: DataSideComponent;
  let fixture: ComponentFixture<DataSideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataSideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataSideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
