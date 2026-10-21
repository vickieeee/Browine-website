export interface BrownieItem {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: string;
  image: string;
  badge?: string;
  cocoaPercentage: string;
  flavorNotes: string[];
}

export const SIGNATURE_BROWNIES: BrownieItem[] = [
  {
    id: 'classic-fudge',
    name: 'Artisan Double Fudge',
    subtitle: '70% Single-Origin Valrhona Cocoa',
    description: 'Our iconic signature square with a paper-thin crackly crust, rich dense fudgy center, and molten dark chocolate chunks.',
    price: '$4.50 / piece',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=1200&auto=format&fit=crop',
    badge: 'Bestseller',
    cocoaPercentage: '72% Dark',
    flavorNotes: ['Madagascar Vanilla', 'Roasted Cocoa', 'Flaky Sea Salt'],
  },
  {
    id: 'salted-caramel',
    name: 'Salted Caramel Pecan Swirl',
    subtitle: 'Slow-Cooked Amber Caramel',
    description: 'Buttery caramel ribbon folded into dark chocolate batter, crowned with toasted buttered pecans and Brittany fleur de sel.',
    price: '$5.00 / piece',
    image: 'https://images.unsplash.com/photo-1515037893149-de7f840978e2?q=80&w=1200&auto=format&fit=crop',
    badge: 'Chef Favorite',
    cocoaPercentage: '65% Dark',
    flavorNotes: ['Burnt Sugar', 'Buttery Pecan', 'Fleur de Sel'],
  },
  {
    id: 'raspberry-ganache',
    name: 'Wild Raspberry Ganache',
    subtitle: 'Fresh Berry Coulis & Cocoa',
    description: 'Tart mountain raspberry preserve layered inside a velvety dark chocolate ganache brownie for a luxurious fruity contrast.',
    price: '$5.25 / piece',
    image: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?q=80&w=1200&auto=format&fit=crop',
    badge: 'Seasonal',
    cocoaPercentage: '68% Dark',
    flavorNotes: ['Wild Raspberry', 'Bright Acid', 'Silky Ganache'],
  },
  {
    id: 'espresso-truffle',
    name: 'Midnight Espresso Truffle',
    subtitle: 'Infused with Ethiopian Arabica',
    description: 'Deep, bittersweet roasted espresso bean extract infused into dense cocoa batter, finished with dark espresso dusting.',
    price: '$5.00 / piece',
    image: 'https://images.unsplash.com/photo-1589218436045-ee320057f443?q=80&w=1200&auto=format&fit=crop',
    badge: 'Intense',
    cocoaPercentage: '80% Cocoa',
    flavorNotes: ['Dark Roast', 'Smoked Cocoa', 'Cacao Nibs'],
  },
  {
    id: 'hazelnut-praline',
    name: 'Piedmont Hazelnut Praline',
    subtitle: 'Slow-Roasted Hazelnut Crisp',
    description: 'Crunchy caramelized hazelnut crunch blended with milk chocolate chunks and our signature dark brownie foundation.',
    price: '$5.50 / piece',
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?q=80&w=1200&auto=format&fit=crop',
    badge: 'Award Winner',
    cocoaPercentage: '60% Blend',
    flavorNotes: ['Roasted Hazelnut', 'Caramel Crunch', 'Creamy Milk Chocolate'],
  },
];

export interface BakingClassInfo {
  id: string;
  title: string;
  level: string;
  duration: string;
  price: string;
  description: string;
  dates: string[];
}

export const BAKING_CLASSES: BakingClassInfo[] = [
  {
    id: 'brownie-mastery',
    title: 'The Ultimate Fudgy Brownie Masterclass',
    level: 'Beginner to Intermediate',
    duration: '3.5 Hours',
    price: '$85 / person',
    description: 'Master the delicate chemistry of melted chocolate emulsion, achieving the legendary shiny crackle crust, and dialing in fudge vs cake textures.',
    dates: ['Saturday, Oct 25 @ 10:00 AM', 'Sunday, Nov 2 @ 2:00 PM', 'Saturday, Nov 8 @ 10:00 AM'],
  },
  {
    id: 'artisan-caramels-swirls',
    title: 'Artisan Caramels & Gourmet Swirled Brownies',
    level: 'All Levels Welcome',
    duration: '3 Hours',
    price: '$95 / person',
    description: 'Craft handcrafted salted butter caramel from scratch, infuse ganaches, and bake restaurant-quality swirled brownie slabs to take home.',
    dates: ['Friday, Oct 31 @ 6:00 PM', 'Sunday, Nov 9 @ 1:00 PM', 'Saturday, Nov 15 @ 10:00 AM'],
  },
  {
    id: 'teen-baking-camp',
    title: 'Weekend Cocoa Explorer Baking Lab',
    level: 'Beginner Friendly (Ages 12+)',
    duration: '2.5 Hours',
    price: '$75 / person',
    description: 'A fun, welcoming hands-on workshop learning the essentials of mixing, baking temperatures, and chocolate garnishes with our head baker.',
    dates: ['Saturday, Nov 1 @ 11:00 AM', 'Saturday, Nov 22 @ 11:00 AM'],
  },
];
