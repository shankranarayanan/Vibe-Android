export interface MockCategory {
  id: string;
  name: string;
  icon: string;
}

export interface MockCatalog {
  image: string;
  page: number;
}

export interface MockBusiness {
  id: string;
  categoryId: string;
  name: string;
  tagline: string;
  rating: number;
  address: string;
  phoneNumber: string;
  whatsappNumber: string;
  thumbnail: string;
  catalogs: MockCatalog[];
}

export const mockCategories: MockCategory[] = [
  {
    id: "cat_baker",
    name: "Home Bakers & Desserts",
    icon: "🎂"
  },
  {
    id: "cat_kitchen",
    name: "Cloud Kitchens & Caterers",
    icon: "🍳"
  },
  {
    id: "cat_services",
    name: "Plumbers, Electricians & ACs",
    icon: "🔧"
  }
];

export const mockBusinesses: MockBusiness[] = [
  {
    id: "b_adambakkam_baker",
    categoryId: "cat_baker",
    name: "Adambakkam Sweet Alchemy",
    tagline: "Custom Tier Premium Cakes & High Tea Delights!",
    rating: 4.8,
    address: "No 42, Brindavan Street, Adambakkam, Chennai - 600088",
    phoneNumber: "+919840123456",
    whatsappNumber: "919840123456",
    thumbnail: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop&q=80",
    catalogs: [
      {
        image: "https://images.unsplash.com/photo-1605697040924-852290f67f41?w=800&auto=format&fit=crop&q=80",
        page: 1
      },
      {
        image: "https://images.unsplash.com/photo-1614088685112-0a760b71a3c8?w=800&auto=format&fit=crop&q=80",
        page: 2
      }
    ]
  },
  {
    id: "b_amma_kitchen",
    categoryId: "cat_kitchen",
    name: "Amma's Madurai Parotta House",
    tagline: "Traditional South Indian Cloud Kitchen. Daily Menus Available!",
    rating: 4.9,
    address: "No 15, New Colony Main Rd, Adambakkam, Chennai - 600088",
    phoneNumber: "+919840987654",
    whatsappNumber: "919840987654",
    thumbnail: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&auto=format&fit=crop&q=80",
    catalogs: [
      {
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80",
        page: 1
      },
      {
        image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop&q=80",
        page: 2
      }
    ]
  },
  {
    id: "b_balaji_plumbing",
    categoryId: "cat_services",
    name: "Balaji Electrical & AC Repairs",
    tagline: "Plumbing, wiring, and inverter repair specialists.",
    rating: 4.6,
    address: "Served across Adambakkam, Thillaiganga Nagar & Nanganallur",
    phoneNumber: "+919840004321",
    whatsappNumber: "919840004321",
    thumbnail: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80",
    catalogs: [
      {
        image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&auto=format&fit=crop&q=80",
        page: 1
      }
    ]
  },
  {
    id: "b_sri_ganesh_caterers",
    categoryId: "cat_kitchen",
    name: "Sri Ganesh Traditional Catering",
    tagline: "Pure Vegetarian Wedding & Party Catering. Handcrafted Sweets!",
    rating: 4.7,
    address: "No 29, Ram Nagar 2nd Street, Adambakkam, Chennai - 600088",
    phoneNumber: "+919840222111",
    whatsappNumber: "919840222111",
    thumbnail: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=80",
    catalogs: [
      {
        image: "https://images.unsplash.com/photo-1588123136416-844cd3662ab1?w=800&auto=format&fit=crop&q=80",
        page: 1
      }
    ]
  }
];
