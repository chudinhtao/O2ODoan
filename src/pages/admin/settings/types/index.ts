export interface IProfileData {
  id: string
  name: string
  slogan: string
  logoUrl: string
  bannerUrl: string
  address: string
  phone: string
  openTime?: string
  closeTime?: string
  localCultureNotes?: string
}

export interface IProfileRequest {
  name: string
  slogan: string
  logoUrl: string
  bannerUrl: string
  address: string
  phone: string
  openTime?: string
  closeTime?: string
  localCultureNotes?: string
}
