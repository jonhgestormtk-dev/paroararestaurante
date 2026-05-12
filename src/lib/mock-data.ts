
import { Product, Category } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || `https://picsum.photos/seed/${id}/600/600`;

export const CATEGORIES: Category[] = [
  'Todos',
  'Promoções',
  'Regionais',
  'Peixes',
  'Grelhados',
  'Executivos',
  'Massas',
  'Bebidas',
  'Sobremesas'
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Filé Marajoara Premium',
    description: 'Filé mignon grelhado com autêntico queijo do Marajó.',
    longDescription: 'Nossa assinatura. Um corte premium de filé mignon, grelhado na brasa, coberto com uma generosa fatia de queijo de búfala artesanal do Marajó. Acompanha arroz de jambu e farofa regional.',
    price: 89.90,
    imageUrl: getImage('file-marajoara'),
    category: 'Grelhados',
    featured: true,
    active: true,
    ingredients: ['Filé Mignon', 'Queijo do Marajó', 'Jambu', 'Chicória'],
    emoji: '🥩',
    stock: 15
  },
  {
    id: 'p2',
    name: 'Tacacá da Ilha',
    description: 'Caldo tradicional com jambu, tucupi e camarão seco.',
    longDescription: 'O sabor mais emblemático do Pará. Tucupi fervido com ervas, servido com goma de mandioca, folhas de jambu que tremem a boca e camarões secos graúdos.',
    price: 34.90,
    imageUrl: getImage('tacaca'),
    category: 'Regionais',
    promotion: true,
    active: true,
    ingredients: ['Tucupi', 'Jambu', 'Goma de Mandioca', 'Camarão'],
    emoji: '🥣',
    stock: 50
  },
  {
    id: 'p3',
    name: 'Tambaqui na Brasa',
    description: 'Costelas de Tambaqui suculentas com vinagrete regional.',
    longDescription: 'Costelas selecionadas de Tambaqui grelhadas lentamente. Acompanha baião de dois cremoso e vinagrete de tucumã.',
    price: 74.00,
    imageUrl: getImage('fish-tambaqui'),
    category: 'Peixes',
    featured: true,
    active: true,
    ingredients: ['Tambaqui', 'Tucumã', 'Ervas Amazônicas'],
    emoji: '🐟',
    stock: 10
  },
  {
    id: 'p4',
    name: 'Mousse de Cupuaçu',
    description: 'Creme aveludado de cupuaçu com chocolate amargo.',
    price: 22.00,
    imageUrl: getImage('dessert-cupuacu'),
    category: 'Sobremesas',
    active: true,
    ingredients: ['Cupuaçu', 'Chocolate Amargo'],
    emoji: '🍮',
    stock: 20
  },
  {
    id: 'p5',
    name: 'Caipirinha de Jambu',
    description: 'Cachaça artesanal com o tremor especial do jambu.',
    price: 24.00,
    imageUrl: getImage('drink-caipirinha'),
    category: 'Bebidas',
    active: true,
    emoji: '🍹',
    stock: 100
  },
  {
    id: 'p6',
    name: 'Pirarucu de Casaca',
    description: 'Tradicional Pirarucu desfiado com banana da terra e farinha d\'água.',
    price: 68.00,
    imageUrl: getImage('pirarucu'),
    category: 'Regionais',
    active: true,
    emoji: '🍲',
    stock: 12
  },
  {
    id: 'p7',
    name: 'Vatapá Paraense',
    description: 'Vatapá cremoso com dendê, leite de coco e camarão.',
    price: 42.00,
    imageUrl: getImage('vatapa'),
    category: 'Regionais',
    active: true,
    emoji: '🍤',
    stock: 25
  },
  {
    id: 'p8',
    name: 'Maniçoba Paroara',
    description: 'A "feijoada" paraense feita com folha de maniva cozida.',
    price: 55.00,
    imageUrl: getImage('manicoba'),
    category: 'Regionais',
    featured: true,
    active: true,
    emoji: '🥘',
    stock: 15
  },
  {
    id: 'p9',
    name: 'Pato no Tucupi',
    description: 'Pato assado e cozido no tucupi com jambu.',
    price: 95.00,
    imageUrl: getImage('pato'),
    category: 'Regionais',
    active: true,
    emoji: '🦆',
    stock: 8
  },
  {
    id: 'p10',
    name: 'Risoto de Jambu com Camarão',
    description: 'Risoto cremoso com toque amazônico.',
    price: 72.00,
    imageUrl: getImage('risoto'),
    category: 'Massas',
    active: true,
    emoji: '🍚',
    stock: 18
  },
  {
    id: 'p11',
    name: 'Filé com Fritas Executivo',
    description: 'Prato rápido e saboroso para o dia a dia.',
    price: 45.00,
    imageUrl: getImage('executivo1'),
    category: 'Executivos',
    active: true,
    emoji: '🍱',
    stock: 30
  },
  {
    id: 'p12',
    name: 'Peixe Frito com Açaí',
    description: 'A combinação mais amada do paraense.',
    price: 48.00,
    imageUrl: getImage('acai-peixe'),
    category: 'Regionais',
    active: true,
    emoji: '🥣',
    stock: 40
  },
  {
    id: 'p13',
    name: 'Picanha na Chapa',
    description: 'Picanha fatiada com acompanhamentos tradicionais.',
    price: 110.00,
    imageUrl: getImage('picanha'),
    category: 'Grelhados',
    active: true,
    emoji: '🔥',
    stock: 10
  },
  {
    id: 'p14',
    name: 'Espaguete aos Frutos do Mar',
    description: 'Massa artesanal com mix de mariscos.',
    price: 78.00,
    imageUrl: getImage('massa-mar'),
    category: 'Massas',
    active: true,
    emoji: '🍝',
    stock: 15
  },
  {
    id: 'p15',
    name: 'Suco de Bacuri',
    description: 'Suco natural da fruta típica da região.',
    price: 12.00,
    imageUrl: getImage('bacuri'),
    category: 'Bebidas',
    active: true,
    emoji: '🥤',
    stock: 50
  },
  {
    id: 'p16',
    name: 'Cerveja Tijuca Cerpa',
    description: 'Cerveja premium paraense.',
    price: 14.00,
    imageUrl: getImage('cerveja'),
    category: 'Bebidas',
    active: true,
    emoji: '🍺',
    stock: 80
  },
  {
    id: 'p17',
    name: 'Pudim de Leite de Castanha',
    description: 'Pudim artesanal feito com leite de castanha-do-pará.',
    price: 18.00,
    imageUrl: getImage('pudim'),
    category: 'Sobremesas',
    active: true,
    emoji: '🍮',
    stock: 20
  },
  {
    id: 'p18',
    name: 'Iscas de Peixe Empanadas',
    description: 'Petisco de filé de peixe crocante.',
    price: 38.00,
    imageUrl: getImage('iscas'),
    category: 'Peixes',
    active: true,
    emoji: '🍟',
    stock: 25
  },
  {
    id: 'p19',
    name: 'Frango Grelhado Light',
    description: 'Peito de frango com legumes no vapor.',
    price: 36.00,
    imageUrl: getImage('frango'),
    category: 'Executivos',
    active: true,
    emoji: '🥗',
    stock: 20
  },
  {
    id: 'p20',
    name: 'Bombom de Cupuaçu',
    description: 'Unidade de chocolate recheado com cupuaçu.',
    price: 6.00,
    imageUrl: getImage('bombom'),
    category: 'Sobremesas',
    active: true,
    emoji: '🍬',
    stock: 100
  }
];
