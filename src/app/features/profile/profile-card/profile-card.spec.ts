import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileCard } from './profile-card';
import { provideHttpClient } from '@angular/common/http';

describe('ProfileCard', () => {
  let component: ProfileCard;
  let fixture: ComponentFixture<ProfileCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileCard],
      providers: [
        provideHttpClient() // 👈 mock HttpClient pour standalone
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
