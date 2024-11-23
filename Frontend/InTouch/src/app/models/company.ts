import { AddressDto } from "./address"
import { OpeningDate } from "./opening-date"
import { User } from "./users"

export interface typeCompanyDto {
    id: number
    nameTypeCompany: string
}

export interface ImgCompanyDto {
    id: number
    file: string
    isPrincipal: boolean
    company: number
}

export interface CompanySortDto {
    id: number;
    nameCompany: string;
    isTakeAway: boolean;
    isOnSit: boolean;
    description: string;
    user: User;
    typeCompany: typeCompanyDto;
    imgCompany: Array<ImgCompanyDto>;
}

export interface CompanyBooking {
    id: number
    nameCompany: string
    isTakeAway: boolean
    isOnSit: boolean
    description: string
    address: number
    typeCompany: typeCompanyDto
    imgCompany: Array<ImgCompanyDto>
}

export interface Company {
    id: number
    nameCompany: string
    isTakeAway: boolean
    isOnSit: boolean
    description: string
    address: AddressDto
    typeCompany: typeCompanyDto
    openings: OpeningDate[]
    imgCompany: ImgCompanyDto[]
  }