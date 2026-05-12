
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
}

export interface CartItem extends Product {
  quantity: number;
  observations?: string;
}

export interface RestaurantConfig {
  whatsappNumber: string;
  deliveryFee: number;
  isOpen: boolean;
  openingHours: string;
}
