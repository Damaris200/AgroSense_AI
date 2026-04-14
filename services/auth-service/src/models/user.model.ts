export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  locale?: 'en' | 'fr';
}

export interface LoginDto {
  email: string;
  password: string;
}
