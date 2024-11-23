export interface Address {
    id: number;
    address1: string;
    address2: string;
    address3: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  }
  
export interface AddressDto {
    address1: string;
    address2: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}