export interface Plot {
  id: string;
  title: string;
  subTitle: string;
  location: string;
  area: number; // in m2
  soilType: string;
  lightCondition: string;
  waterPrice: number; // in yuan/ton
  annualRent: number; // in yuan/m2
  description: string;
  owner: {
    name: string;
    phone: string;
    avatar: string;
  };
  images: string[];
  tags: string[];
  status: 'available' | 'rented';
}

export interface GardenCenter {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
  plots: Plot[];
  thumb: string;
}

export interface AdministrativeRegion {
  id: string;
  name: string;
  level: 'province' | 'city' | 'district' | 'village';
  coordinates?: {
    lat: number;
    lng: number;
  };
  children?: AdministrativeRegion[];
  gardens?: GardenCenter[];
}

export interface User {
  id: string;
  phone: string;
  name: string;
  avatar: string;
  isLandlord: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderPhone: string;
  receiverId: string;
  receiverName: string;
  content: string;
  createdAt: string;
  read: boolean;
}
