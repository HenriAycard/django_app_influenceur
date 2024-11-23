import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BrandTabsPage } from './brand-tabs.page';

describe('BrandTabsPage', () => {
  let component: BrandTabsPage;
  let fixture: ComponentFixture<BrandTabsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BrandTabsPage ],
    }).compileComponents();

    fixture = TestBed.createComponent(BrandTabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
