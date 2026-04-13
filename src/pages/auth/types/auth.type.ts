import type { IRole } from '@/shared/constants/ROLE'

export interface IUser {
  id:       string
  username: string
  fullName: string
  role:     IRole
  active:   boolean
}

export interface ILoginRequest  { 
  username: string; 
  password: string 
}

export interface ILoginResponse { 
  accessToken:  string
  refreshToken: string
  expiresIn:    number
  fullName:     string
  role:         IRole
  id?:          string
  username?:    string
}
