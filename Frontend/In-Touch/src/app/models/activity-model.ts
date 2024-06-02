import { User } from "../services/entities";

export class dataOpeningDate {
  lstDays: Array<number>;
  OpeningDays: Map<string, string>;
}

export class OpeningDate {
  id: number
  fromDate: string
  toDate: string
  startDate: string
  endDate: string
  pauseStart: string
  pauseEnd: string
  isOpen: boolean
  isOrderBy: number
  company: number

}

export class Address {
  id: number = -1;
  address1: string = '';
  address2: string = '';
  address3: string = '';
  city: string = '';
  state: string = '';
  country: string = '';
  postalCode: string = '';
}

export class AddressDto {
  address1: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}


export class NewCompanyDto {
  nameCompany: string;
  isTakeAway: boolean;
  isOnSit: boolean;
  description: string;
  address: number;
  typeCompany: number;
}

export class typeCompanyDto {
  id: number
  nameTypeCompany: string
}

export class ImgCompanyDto {
  id: number
  file: string
  isPrincipal: boolean
  company: number
}

export class MainCompanyDto {
  id: number;
  nameCompany: string;
  isTakeAway: boolean;
  isOnSit: boolean;
  description: string;
  user: User;
  typeCompany: typeCompanyDto;
  imgCompany: Array<ImgCompanyDto>;
}

export class CompanyDto {
  id: number
  nameCompany: string
  isTakeAway: boolean
  isOnSit: boolean
  description: string
  address: AddressDto
  typeCompany: typeCompanyDto
  openings: Array<OpeningDate>
  imgCompany: Array<ImgCompanyDto>
}

export class OfferDto {
  id: number;
  nameOffer: string;
  descriptionOffer: string;
  descriptionCondition: string;
  company: number;
}

export class CreateOfferDto {
  nameOffer: string;
  descriptionOffer: string;
  descriptionCondition: string;
  company: number;
}

export class CreateReservationDto {
  offer: number;
  dateReservation: Date;
}


export class CompanyResaDto {
  id: number
  nameCompany: string
  isTakeAway: boolean
  isOnSit: boolean
  description: string
  address: number
  typeCompany: typeCompanyDto
  imgCompany: Array<ImgCompanyDto>
}

export class OfferResaDto {
  id: number;
  company: CompanyResaDto;
  nameOffer: string;
  descriptionOffer: string;
  descriptionCondition: string;

}

export class ResaByStatusDto {
  id: number;
  offer: OfferResaDto;
  status: number;
  dateReservation: Date;

  
}

export class ResaByStatusBrandDto {
  id: number;
  offer: OfferResaDto;
  status: number;
  dateReservation: Date;
  user: User;

  constructor(init: ResaByStatusBrandDto) {
    this.id = init.id;
    this.offer = init.offer
    this.status = init.status
    this.dateReservation = parseDate(init.dateReservation)
    this.user = init.user
  }
}

export function parseDate(str: string | Date): Date {
  if (str !== undefined && str !== null) {
    return new Date(str);
  }
  return new Date();
}

export class django_pagination_ResaByStatusDto {
  count: number;
  next: any;
  previous: any;
  results: Array<ResaByStatusDto>
}