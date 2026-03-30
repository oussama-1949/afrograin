export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  image: string;
  countInStock: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}