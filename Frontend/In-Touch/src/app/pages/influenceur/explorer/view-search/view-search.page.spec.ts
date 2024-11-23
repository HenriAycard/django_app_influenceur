import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewSearchPage } from './view-search.page';

describe('ViewSearchPage', () => {
  let component: ViewSearchPage;
  let fixture: ComponentFixture<ViewSearchPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewSearchPage ],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewSearchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
