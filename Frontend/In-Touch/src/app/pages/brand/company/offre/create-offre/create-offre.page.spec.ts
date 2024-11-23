import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateOffrePage } from './create-offre.page';

describe('CreateOffrePage', () => {
  let component: CreateOffrePage;
  let fixture: ComponentFixture<CreateOffrePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateOffrePage ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateOffrePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
