import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TranscodingProfileSelectComponent } from './transcoding-profile-select.component';

describe('TranscodingProfileSelectComponent', () => {
  let component: TranscodingProfileSelectComponent;
  let fixture: ComponentFixture<TranscodingProfileSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TranscodingProfileSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TranscodingProfileSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
