import { Address, AddressDto } from "./address"
import { OpeningDate } from "./opening-date"
import { User } from "./users"

export interface typeVenueDto {
    id: number
    name: string
}

export interface ImgVenueDto {
    id: number
    file: string
    isPrincipal: boolean
    venue: number
}

export interface VenueSortDto {
    id: number;
    nameVenue: string;
    isTakeaway: boolean;
    isOnsit: boolean;
    description: string;
    user: User;
    typeVenue: typeVenueDto;
    imgVenue: Array<ImgVenueDto>;
    averageRating: number | null;
    reviewCount: number;
}

export interface VenueBooking {
    id: number
    nameVenue: string
    isTakeaway: boolean
    isOnsit: boolean
    description: string
    address: number
    typeVenue: typeVenueDto
    imgVenue: Array<ImgVenueDto>
}

export interface Venue {
    id: number
    nameVenue: string
    isTakeaway: boolean
    isOnsit: boolean
    description: string
    instagram: string | null
    youtube: string | null
    tiktok: string | null
    facebook: string | null
    twitter: string | null
    address: Address
    typeVenue: typeVenueDto
    openings: OpeningDate[]
    imgVenue: ImgVenueDto[]
    averageRating: number | null
    reviewCount: number
}

export interface VenueCreateDto {
    id?: number
    nameVenue: string;
    isTakeaway: boolean;
    isOnsit: boolean;
    description: string;
    address: number;
    typeVenue: number;
    instagram: string | null
    youtube: string | null
    tiktok: string | null
    facebook: string | null
    twitter: string | null
}

export interface VenueUpdateDto {
    id: number
    nameVenue: string;
    isTakeaway: boolean;
    isOnsit: boolean;
    description: string;
    addressId?: number;
    typeVenueId: number;
    instagram: string | null
    youtube: string | null
    tiktok: string | null
    facebook: string | null
    twitter: string | null
}

export interface VenueMainDto {
    id: number;
    nameVenue: string;
    isTakeaway: boolean;
    isOnsit: boolean;
    typeVenue: typeVenueDto | null;
}

export interface VenueQueryParams {
    id: number;
    nameVenue: string;
    refresh?: number;
}

export interface SocialMedia {
    instagram: string | null
    youtube: string | null
    tiktok: string | null
    facebook: string | null
    twitter: string | null
}