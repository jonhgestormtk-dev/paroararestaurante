
export type RestaurantSlug = 'paroara' | 'egua-na-panela';

export type Category = 'Todos' | 'Promoções' | 'Executivos' | 'Grelhados' | 'Massas' | 'Bebidas' | 'Regionais' | 'Sobremesas' | 'Peixes' | 'Carnes';

export interface Product {
  id: string;
  restaurantId: RestaurantSlug;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  imageUrl: string;
  category: string;
  promotion?: boolean;
  featured?: boolean;
  active?: boolean;
  ingredients?: string[];
  emoji?: string;
  stock?: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface CartItem extends Product {
  quantity: number;
  observations?: string;
}

export type OrderStatus = 'Pendente' | 'Em Preparo' | 'Saiu para Entrega' | 'Finalizado';
export type PaymentMethod = 'Pix' | 'Dinheiro' | 'Débito' | 'Crédito';

export interface Order {
  id: string;
  restaurantId: RestaurantSlug;
  orderNumber?: string;
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
    observations?: string;
  }[];
  total: number;
  status: OrderStatus;
  payment: {
    method: PaymentMethod;
    changeFor?: number;
  };
  createdAt: any;
}
