import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExperiencePage } from './experience.page';

describe('ExperiencePage', () => {
  let component: ExperiencePage;
  let fixture: ComponentFixture<ExperiencePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ExperiencePage ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExperiencePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
