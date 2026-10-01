export interface LoginRequest {
    username: string;
    password: string;
  }
  
  export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    user: {
      id: string;
      username: string;
      fullName: string;
      role: string;
      email: string;
    };
  }
  
  export interface UserInfo {
    id: string;
    username: string;
    fullName: string;
    role: string;
    email: string;
  }