export class dataOpeningDate {
    lstDays: Array<number>;
    OpeningDays: Map<string, string>;
  }
  
  export class OpeningDate {
    id: number;
    fromDate: string;
    toDate: string;
    startDate: string;
    endDate: string;
    pauseStart: string;
    pauseEnd: string;
    isOpen: boolean;
    isOrderBy: number;
    activity: number;
  }
  
  export class AddressDto {
    id: number;
    address1: string;
    address2: string;
    address3: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  }
  
  
  export class ActivityCreatDto {
    id: number;
    nameActivity: string;
    isTakeAway: boolean;
    isOnSit: boolean;
    description: string;
    address: number;
    company: number;
    typeActivity: number;
  }

  export class typeActivityDto {
    id: number;
    nameTypeActivity: string;
  }

  export class companyDto {
    id: number;
    nameCompany: string;
  }

  export class ActivityDto {
    id: number;
    nameActivity: string;
    isTakeAway: boolean;
    isOnSit: boolean;
    description: string;
    address : AddressDto = new AddressDto();
    typeActivity: typeActivityDto = new typeActivityDto();
    company: companyDto = new companyDto();
    openings : Array<OpeningDate> = Array<OpeningDate>(new OpeningDate);
  }

  export class OfferDto {
    id: number;
    nameOffer: string;
    descriptionOffer: string;
    descriptionCondition: string;
    activity: number;
  }

  export class CreateOfferDto {
    nameOffer: string;
    descriptionOffer: string;
    descriptionCondition: string;
    activity: number;
  }

  export class CreateReservationDto {
    offer: number;
    dateReservation: Date;
  }