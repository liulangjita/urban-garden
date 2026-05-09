// 开发环境使用相对路径（Vite proxy），生产环境使用环境变量配置的完整地址
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface Plot {
  id: string;
  title: string;
  subTitle: string;
  location: string;
  area: number;
  soilType: string;
  lightCondition: string;
  waterPrice: number;
  annualRent: number;
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

export async function fetchRegions(): Promise<AdministrativeRegion[]> {
  const response = await fetch(`${API_BASE_URL}/regions`);
  if (!response.ok) {
    throw new Error('Failed to fetch regions');
  }
  return response.json();
}

export async function fetchGardens(): Promise<GardenCenter[]> {
  const response = await fetch(`${API_BASE_URL}/gardens`);
  if (!response.ok) {
    throw new Error('Failed to fetch gardens');
  }
  return response.json();
}

export async function fetchGarden(gardenId: string): Promise<GardenCenter> {
  const response = await fetch(`${API_BASE_URL}/gardens/${gardenId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch garden');
  }
  return response.json();
}

export async function fetchPlots(gardenId?: string): Promise<Plot[]> {
  const url = gardenId
    ? `${API_BASE_URL}/plots?garden_id=${gardenId}`
    : `${API_BASE_URL}/plots`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch plots');
  }
  return response.json();
}

export async function fetchPlot(plotId: string): Promise<Plot> {
  const response = await fetch(`${API_BASE_URL}/plots/${plotId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch plot');
  }
  return response.json();
}

export async function fetchMyPlots(phone: string): Promise<Plot[]> {
  const response = await fetch(`${API_BASE_URL}/plots?owner_phone=${phone}`);
  if (!response.ok) {
    throw new Error('Failed to fetch my plots');
  }
  return response.json();
}

export async function updatePlot(plotId: string, data: Partial<Plot>): Promise<Plot> {
  const response = await fetch(`${API_BASE_URL}/plots/${plotId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update plot');
  }
  return response.json();
}

export async function fetchStats(): Promise<{
  totalPlots: number;
  rentedCount: number;
  monthlyRevenue: number;
}> {
  const response = await fetch(`${API_BASE_URL}/stats`);
  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }
  return response.json();
}

// 用户相关API
export async function login(phone: string, password: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '登录失败');
  }
  return response.json();
}

export async function register(phone: string, name: string, password: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, name, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '注册失败');
  }
  return response.json();
}

export async function checkUser(phone: string): Promise<{ exists: boolean; isLandlord: boolean }> {
  const response = await fetch(`${API_BASE_URL}/auth/check?phone=${phone}`);
  if (!response.ok) {
    throw new Error('Failed to check user');
  }
  return response.json();
}

// 消息相关API
export async function fetchMessages(userId: string, userPhone?: string): Promise<Message[]> {
  const url = userPhone
    ? `${API_BASE_URL}/messages?user_id=${userId}&user_phone=${userPhone}`
    : `${API_BASE_URL}/messages?user_id=${userId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }
  return response.json();
}

export async function sendMessage(data: {
  senderId: string;
  senderPhone: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
}): Promise<Message> {
  const response = await fetch(`${API_BASE_URL}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  return response.json();
}

export async function markMessageRead(messageId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/messages/${messageId}/read`, {
    method: 'PUT',
  });
  if (!response.ok) {
    throw new Error('Failed to mark message read');
  }
}