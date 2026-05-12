
import { Product, Category } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';

export const CATEGORIES: Category[] = [
  'Todos',
  'Promoções',
  'Regionais',
  'Grelhados',
  'Executivos',
  'Massas',
  'Bebidas',
  'Sobremesas'
];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Filé Marajoara',
    description: 'Filé grelhado com autêntico queijo do Marajó derretido.',
    longDescription: 'Nossa assinatura. Um corte premium de filé mignon, grelhado na brasa de madeira amazônica, coberto com uma generosa fatia de queijo de búfala artesanal do Marajó. Acompanha arroz de jambu e farofa de chicória.',
    price: 89.90,
    imageUrl: getImage('file-marajoara'),
    category: 'Grelhados',
    featured: true,
    ingredients: ['Filé Mignon', 'Queijo do Marajó', 'Jambu', 'Chicória'],
    emoji: '🥩'
  },
  {
    id: '2',
    name: 'Tacacá Amazônico',
    description: 'Caldo tradicional com jambu, tucupi e camarão seco.',
    longDescription: 'O sabor mais emblemático do Pará. Tucupi fervido com ervas, servido com goma de mandioca, folhas de jambu que tremem a boca e generosos camarões secos graúdos.',
    price: 34.90,
    imageUrl: getImage('tacaca'),
    category: 'Regionais',
    promotion: true,
    ingredients: ['Tucupi', 'Jambu', 'Goma de Mandioca', 'Camarão'],
    emoji: '🥣'
  },
  {
    id: '3',
    name: 'Tambaqui na Brasa',
    description: 'Costelas de Tambaqui suculentas com vinagrete regional.',
    longDescription: 'Costelas selecionadas de Tambaqui, o rei dos rios amazônicos, temperadas com ervas finas e grelhadas lentamente. Acompanha baião de dois cremoso e vinagrete de tucumã.',
    price: 74.00,
    imageUrl: getImage('fish-tambaqui'),
    category: 'Regionais',
    ingredients: ['Tambaqui', 'Tucumã', 'Ervas Amazônicas'],
    emoji: '🐟'
  },
  {
    id: '4',
    name: 'Mousse de Cupuaçu',
    description: 'Creme aveludado de cupuaçu com calda de chocolate amargo.',
    longDescription: 'A acidez perfeita do cupuaçu colhido na época, transformada em uma mousse leve e sofisticada. Finalizada com ganache de chocolate 70% cacau orgânico.',
    price: 22.00,
    imageUrl: getImage('dessert-cupuacu'),
    category: 'Sobremesas',
    ingredients: ['Cupuaçu', 'Chocolate Amargo', 'Creme de Leite'],
    emoji: '🍮'
  },
  {
    id: '5',
    name: 'Caipirinha de Jambu',
    description: 'A clássica caipirinha com o tremor especial do jambu.',
    longDescription: 'Cachaça artesanal envelhecida em tonéis de bálsamo, limão taiti, açúcar orgânico e flores de jambu para uma experiência sensorial única.',
    price: 24.00,
    imageUrl: getImage('drink-caipirinha'),
    category: 'Bebidas',
    ingredients: ['Cachaça', 'Jambu', 'Limão'],
    emoji: '🍹'
  }
];
