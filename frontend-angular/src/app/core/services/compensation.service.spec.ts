import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CompensationService } from './compensation.service';
import { environment } from '../../../environments/environment';

describe('CompensationService', () => {
  let service: CompensationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CompensationService]
    });
    service = TestBed.inject(CompensationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch compensation history for an employee', () => {
    const mockHistory = [
      {
        id: 1,
        employeeId: 5,
        baseSalary: 120000,
        bonus: 10000,
        currency: 'USD',
        effectiveFrom: '2024-01-01',
        effectiveTo: null,
        status: 'CURRENT'
      }
    ];

    service.getHistory(5).subscribe((res) => {
      expect(res.length).toBe(1);
      expect(res[0].baseSalary).toBe(120000);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/employees/5/salary-history`);
    expect(req.request.method).toBe('GET');
    req.flush(mockHistory);
  });

  it('should submit compensation revision', () => {
    const input = {
      newBaseSalary: 135000,
      newBonus: 15000,
      currency: 'USD',
      changeReason: 'Merit promotion',
      effectiveDate: '2025-01-01'
    };

    const expectedBody = {
      newBaseSalary: 135000,
      newBonus: 15000,
      currency: 'USD',
      reason: 'Merit promotion',
      effectiveFrom: '2025-01-01'
    };

    service.reviseCompensation(5, input).subscribe((res) => {
      expect(res.baseSalary).toBe(135000);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/employees/5/compensation`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(expectedBody);
    req.flush({ id: 2, employeeId: 5, ...expectedBody, baseSalary: 135000, bonus: 15000 });
  });
});
