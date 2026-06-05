export interface Address {
    id: number;
    addressPrincipal: string;
    addressSecondary: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  }
  
export interface AddressDto {
    id?: number | undefined;
    addressPrincipal: string;
    addressSecondary: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
}