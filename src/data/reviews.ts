import { ProductReview } from '../types';

export const INITIAL_REVIEWS: ProductReview[] = [
  {
    id: 'rev_1',
    productId: 'chopper_main_prod',
    authorName: 'Priyanka Sen',
    location: 'Indiranagar, Bengaluru',
    rating: 5,
    title: 'Mincing garlic & chilies in 6 seconds! No more smelly hands or tears.',
    comment:
      'The build quality is outstanding. The matte black motor top feels solid, and the 3-tier 304 stainless steel blades minced 12 garlic cloves and 4 green chilies evenly without turning them into mush. Total lifesaver for daily tadka!',
    createdAt: '2 days ago',
    verifiedBuyer: true,
  },
  {
    id: 'rev_2',
    productId: 'chopper_main_prod',
    authorName: 'Sneha Kapur',
    location: 'Bandra West, Mumbai',
    rating: 5,
    title: 'Worth every rupee. 10/10 cordless kitchen innovation.',
    comment:
      'Shipped via Blue Dart and delivered in 36 hours. I love that it is completely wireless—I can prep onions right at my dining table. The USB-C charge lasts well over a week with daily cooking.',
    createdAt: '4 days ago',
    verifiedBuyer: true,
  },
  {
    id: 'rev_3',
    productId: 'chopper_main_prod',
    authorName: 'Devrat Sharma',
    location: 'Cyber City, Gurugram',
    rating: 5,
    title: 'Flawless for ginger-garlic paste and fine diced onions.',
    comment:
      'I was tired of cleaning a bulky 750W mixer-grinder just for a handful of onions or ginger. This mini chopper cleans under running tap water in 5 seconds flat. Motor is surprisingly quiet yet very torquey.',
    createdAt: '1 week ago',
    verifiedBuyer: true,
  },
  {
    id: 'rev_4',
    productId: 'chopper_main_prod',
    authorName: 'Ananya Pillai',
    location: 'Anna Nagar, Chennai',
    rating: 5,
    title: 'Perfect for infant baby purees and dry fruits mincing.',
    comment:
      'Made steamed apple and carrot puree for my 8-month-old infant. The food-grade BPA-free bowl gave me complete peace of mind. Also chops cashews and almonds for kheer in 10 seconds.',
    createdAt: '1 week ago',
    verifiedBuyer: true,
  },
  {
    id: 'rev_5',
    productId: 'chopper_main_prod',
    authorName: 'Rohan Mehra',
    location: 'Hitec City, Hyderabad',
    rating: 5,
    title: 'One-touch pulse gives exact texture control.',
    comment:
      'Pulse 3 times for chunky salsa or salad dressing; hold for 8 seconds for fine paste. The anti-slip silicone base keeps it firm on the kitchen counter.',
    createdAt: '2 weeks ago',
    verifiedBuyer: true,
  },
];
