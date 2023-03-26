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

export class AddressDto {
  id: number = -1;
  address1: string = '';
  address2: string = '';
  address3: string = '';
  city: string = '';
  state: string = '';
  country: string = '';
  postalCode: string = '';
}


export class NewCompanyDto {
  id: number;
  nameCompany: string;
  isTakeAway: boolean;
  isOnSit: boolean;
  description: string;
  address: number;
  company: number;
  typeCompany: number;
  user: number;
}

export class typeCompanyDto {
  id: number
  nameTypeCompany: string

  constructor(init: typeCompanyDto) {
    this.id = init.id
    this.nameTypeCompany = init.nameTypeCompany
  }
}

export class ImgCompanyDto {
  id: number
  file: string
  isPrincipal: boolean
  company: number

  constructor(init: ImgCompanyDto) {
    this.id = init.id
    this.file = init.file
    this.isPrincipal = init.isPrincipal
    this.company = init.company
  }
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

  constructor(init: CompanyDto) {
    this.id = init.id
    this.nameCompany = init.nameCompany
    this.isTakeAway = init.isTakeAway
    this.isOnSit = init.isOnSit
    this.description = init.description
    this.address = init.address
    this.typeCompany = init.typeCompany
    this.openings = init.openings
    this.imgCompany = init.imgCompany
  }

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

  constructor(init: CompanyResaDto) {
    this.id = init.id
    this.nameCompany = init.nameCompany
    this.isTakeAway = init.isTakeAway
    this.isOnSit = init.isOnSit
    this.description = init.description
    this.address = init.address
    this.typeCompany = new typeCompanyDto(init.typeCompany)
    this.imgCompany = init.imgCompany
  }

}

export class OfferResaDto {
  id: number;
  company: CompanyResaDto;
  nameOffer: string;
  descriptionOffer: string;
  descriptionCondition: string;

  constructor(init: OfferResaDto) {
    this.id = init.id
    this.company = new CompanyResaDto(init.company)
    this.nameOffer = init.nameOffer
    this.descriptionOffer = init.descriptionOffer
    this.descriptionCondition = init.descriptionCondition
  }
}

export class ResaByStatusDto {
  id: number;
  offer: OfferResaDto;
  status: number;
  dateReservation: Date;

  constructor(init: ResaByStatusDto) {
    this.id = init.id;
    this.offer = new OfferResaDto(init.offer)
    this.status = init.status
    this.dateReservation = parseDate(init.dateReservation)
  }
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