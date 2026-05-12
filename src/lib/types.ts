
export type Category = 'Todos' | 'Promoções' | 'Executivos' | 'Grelhados' | 'Massas' | 'Bebidas' | 'Regionais' | 'Sobremesas' | 'Peixes' | 'Carnes';

export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  imageUrl: string;
  category: Category;
  promotion?: boolean;
  featured?: boolean;
  ingredients?: string[];
  emoji?: string;
  stock?: number;
  createdAt?: any;
}

export interface CartItem extends Product {
  quantity: number;
  observations?: string;
}

export type OrderStatus = 'Pendente' | 'Em Preparo' | 'Saiu para Entrega' | 'Finalizado';

export interface Order {
  id: string;
  customer: {
    name: string;
    phone: string;
    address?: string;
  };
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  status: OrderStatus;
  createdAt: any;
}
