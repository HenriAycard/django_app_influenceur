import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewActivityPage } from './view-activity.page';

describe('ViewActivityPage', () => {
  let component: ViewActivityPage;
  let fixture: ComponentFixture<ViewActivityPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewActivityPage ]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewActivityPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
