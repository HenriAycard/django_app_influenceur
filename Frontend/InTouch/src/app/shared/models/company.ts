import { Address, AddressDto } from "./address"
import { OpeningDate } from "./opening-date"
import { User } from "./users"

export interface typeCompanyDto {
    id: number
    name: string
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
    isTakeaway: boolean;
    isOnsit: boolean;
    description: string;
    user: User;
    typeCompany: typeCompanyDto;
    imgCompany: Array<ImgCompanyDto>;
}

export interface CompanyBooking {
    id: number
    nameCompany: string
    isTakeaway: boolean
    isOnsit: boolean
    description: string
    address: number
    typeCompany: typeCompanyDto
    imgCompany: Array<ImgCompanyDto>
}

export interface Company {
    id: number
    nameCompany: string
    isTakeaway: boolean
    isOnsit: boolean
    description: string
    instagram: string | null
    youtube: string | null
    tiktok: string | null
    facebook: string | null
    twitter: string | null
    address: Address
    typeCompany: typeCompanyDto
    openings: OpeningDate[]
    imgCompany: ImgCompanyDto[]
}

export interface CompanyCreateDto {
    id?: number
    nameCompany: string;
    isTakeaway: boolean;
    isOnsit: boolean;
    description: string;
    address: number;
    typeCompany: number;
    instagram: string | null
    youtube: string | null
    tiktok: string | null
    facebook: string | null
    twitter: string | null
}

export interface CompanyUpdateDto {
    id: number
    nameCompany: string;
    isTakeaway: boolean;
    isOnsit: boolean;
    description: string;
    addressId?: number;
    typeCompanyId: number;
    instagram: string | null
    youtube: string | null
    tiktok: string | null
    facebook: string | null
    twitter: string | null
}

export interface CompanyMainDto {
    id: number;
    nameCompany: string;
    isTakeaway: boolean;
    isOnsit: boolean;
    typeCompany: typeCompanyDto | null;
}

export interface CompanyQueryParams {
    id: number;
    nameCompany: string;
    refresh?: number;
}

export interface SocialMedia {
    instagram: string | null
    youtube: string | null
    tiktok: string | null
    facebook: string | null
    twitter: string | null
}