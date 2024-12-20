import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AgendaPage } from './agenda.page';

describe('AgendaPage', () => {
  let component: AgendaPage;
  let fixture: ComponentFixture<AgendaPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AgendaPage ],
    }).compileComponents();

    fixture = TestBed.createComponent(AgendaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
