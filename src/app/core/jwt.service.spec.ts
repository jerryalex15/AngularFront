import { TestBed } from '@angular/core/testing';
import { JwtService } from './jwt.service';

describe('JwtService', () => {
    let service: JwtService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(JwtService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should decode a JWT token', () => {
        // Exemple de JWT encodé (header.payload.signature)
        // Payload : { "sub": "test@example.com", "iat": 1600000000 }
        const fakeToken = 
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        'eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNjAwMDAwMDAwfQ.' +
        's5K6i7lZI7d1aYQk4nQ2cZkWJkX6l1cd5XzQ7J7KjVU';

        const decoded = service.decode(fakeToken);

        expect(decoded).toBeDefined();
        expect(decoded.sub).toBe('test@example.com');
        expect(decoded.iat).toBe(1600000000);
    });
});