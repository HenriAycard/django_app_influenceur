import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateCompanyPage } from './create-company.page';

describe('CreateCompanyPage', () => {
  let component: CreateCompanyPage;
  let fixture: ComponentFixture<CreateCompanyPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateCompanyPage ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateCompanyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
