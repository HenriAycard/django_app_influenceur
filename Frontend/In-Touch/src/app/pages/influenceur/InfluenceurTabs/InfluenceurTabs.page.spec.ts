import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InfluenceurTabs } from './InfluenceurTabs.page';

describe('InfluenceurTabs', () => {
  let component: InfluenceurTabs;
  let fixture: ComponentFixture<InfluenceurTabs>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InfluenceurTabs ],
    }).compileComponents();

    fixture = TestBed.createComponent(InfluenceurTabs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
