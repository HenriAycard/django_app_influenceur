import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CompanyPage } from './company.page';

describe('CompanyPage', () => {
  let component: CompanyPage;
  let fixture: ComponentFixture<CompanyPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanyPage ],
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
