// FIX: Import React to use React.ComponentType
import React from 'react';

export type PhotoCategory = 'equipment' | 'facilities' | 'scenery' | 'other';

export interface Photo {
  url: string;
  category: PhotoCategory;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  comment: string;
  photos: Photo[];
  helpfulCount: number;
  createdAt: string;
}

export interface Park {
  id: string;
  name: string;
  address: string;
  distance: string;
  latitude: number;
  longitude: number;
  mainImage: string;
  images: Photo[];
  reviews: Review[];
  tags: {
    age: string[];
    equipment: string[];
    facilities: string[];
  };
}

export interface FilterOptions {
  age: string[];
  equipment: string[];
  facilities: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface User {
    id: string;
    name: string;
    avatar: string;
    badges: Badge[];
}