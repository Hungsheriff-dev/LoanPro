import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanApplicationDetailComponent } from './loan-application-detail.component';

describe('LoanApplicationDetailComponent', () => {
  let component: LoanApplicationDetailComponent;
  let fixture: ComponentFixture<LoanApplicationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanApplicationDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanApplicationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
