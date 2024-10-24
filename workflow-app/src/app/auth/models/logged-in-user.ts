// logged-in-user.ts

export interface Tokens {
    access_token: string;
    refresh_token: string;
  }
  
  export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER'
  }
  
  export interface UserProfile {
    id: number;
    username: string
    role: Role;
    exp: number;
  }
  
  export interface LoggedInUser {
    tokens: Tokens;
    userProfile: UserProfile;
  }
  
  