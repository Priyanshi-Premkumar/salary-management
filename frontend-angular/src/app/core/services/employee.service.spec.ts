import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EmployeeService } from './employee.service';
import { environment } from '../../../environments/environment';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EmployeeService]
    });
    service = TestBed.inject(EmployeeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch employees with pagination and filters', () => {
    const mockPage = {
      content: [
        {
          id: 1,
          employeeCode: 'ACME-0001',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@acme.com',
          country: 'USA',
          department: 'Engineering',
          designation: 'Staff Engineer',
          employmentStatus: 'ACTIVE',
          joiningDate: '2023-01-15'
        }
      ],
      totalElements: 1,
      totalPages: 1,
      size: 20,
      number: 0,
      first: true,
      last: true
    };

    service.list({ page: 0, size: 20, country: 'USA' }).subscribe((res) => {
      expect(res.content.length).toBe(1);
      expect(res.content[0].employeeCode).toBe('ACME-0001');
    });

    const req = httpMock.expectOne((r) => r.url === `${environment.apiUrl}/employees` && r.params.get('country') === 'USA');
    expect(req.request.method).toBe('GET');
    req.flush(mockPage);
  });

  it('should fetch employee details by id', () => {
    const mockDetail = {
      id: 10,
      employeeCode: 'ACME-0010',
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@acme.com',
      country: 'India',
      department: 'Product',
      designation: 'Product Lead',
      employmentStatus: 'ACTIVE',
      joiningDate: '2022-03-01',
      phone: '+91 9876543210'
    };

    service.getById(10).subscribe((res) => {
      expect(res.id).toBe(10);
      expect(res.firstName).toBe('Alice');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/employees/10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockDetail);
  });
});
