import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewOffrePage } from './view-offre.page';

describe('ViewOffrePage', () => {
  let component: ViewOffrePage;
  let fixture: ComponentFixture<ViewOffrePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewOffrePage ],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewOffrePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
