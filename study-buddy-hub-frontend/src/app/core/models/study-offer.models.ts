export type Level = 'Beginner' | 'Intermediate' | 'Advanced';
export type SessionType = 'Online' | 'OnSite' | 'Hybrid';

export interface StudyOfferList {
  id: number;
  title: string;
  level: Level;
  sessionType: SessionType;
  price: number;
  location?: string;
  subjectName: string;
  ownerName: string;
}

export interface StudyOfferDetails {
  id: number;
  title: string;
  description: string;
  level: Level;
  sessionType: SessionType;
  price: number;
  location?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  subjectName: string;
  ownerId: string;
  ownerName: string;
  ownerEmail?: string;
}

export interface StudyOfferCreate {
  title: string;
  description: string;
  level: number;
  sessionType: number;
  price: number;
  location?: string;
  subjectId: number;
}

export interface StudyOfferUpdate {
  title?: string;
  description?: string;
  level?: number;
  sessionType?: number;
  price?: number;
  location?: string;
  isActive?: boolean;
  subjectId?: number;
}

export interface OfferFilters {
  subjectId?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
}
