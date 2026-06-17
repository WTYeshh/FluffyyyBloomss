export interface Product {
  id: string;
  title: string;
  description: string;
  category: 'flowers' | 'keychains' | 'art';
  price: number;
  originalPrice: number;
  image: string;
  isAvailable: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  email: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: 'Pending' | 'Shipped' | 'Delivered';
  date: string;
}

// Initial products mapping using the uploaded WhatsApp images
const INITIAL_PRODUCTS: Product[] = [
  // Handcrafted Flowers
  {
    id: 'flower-1',
    title: 'Blushing Pink Tulip Crochet',
    description: 'Beautifully hand-stitched pink tulip crochet, perfect for home decor or gifting. Created with premium cotton yarn.',
    category: 'flowers',
    price: 399,
    originalPrice: 699,
    image: '/images/WhatsApp Image 2026-06-17 at 6.28.42 PM.jpeg',
    isAvailable: true,
  },
  {
    id: 'flower-2',
    title: 'Sunny Yellow Daisy Crochet',
    description: 'Cheerful hand-knit yellow daisy with flexible stem. Bring a touch of warm sunshine indoors all year round.',
    category: 'flowers',
    price: 299,
    originalPrice: 599,
    image: '/images/WhatsApp Image 2026-06-17 at 6.28.43 PM.jpeg',
    isAvailable: true,
  },
  {
    id: 'flower-3',
    title: 'Enchanted Rose Handcrafted',
    description: 'An elegant red rose crocheted by hand. Packaged beautifully to represent eternal love and craftsmanship.',
    category: 'flowers',
    price: 499,
    originalPrice: 999,
    image: '/images/WhatsApp Image 2026-06-17 6.28.44 PM.jpeg',
    isAvailable: true,
  },
  {
    id: 'flower-4',
    title: 'Lavish Lavender Bouquet',
    description: 'A calming bouquet of hand-crocheted lavender stems wrapped in artisan paper. Feels soft and looks stunning.',
    category: 'flowers',
    price: 799,
    originalPrice: 1299,
    image: '/images/WhatsApp Image 2026-06gf17 at 6.28.44 PM.jpeg',
    isAvailable: true,
  },
  {
    id: 'flower-5',
    title: 'Elegant Lilac Blossom Crochet',
    description: 'Soft lilac crochet flower bunch with green leaves. Handwoven with fine thread for intricate, realistic detail.',
    category: 'flowers',
    price: 499,
    originalPrice: 899,
    image: '/images/WhatsApp Image 2026-06-17 at 6.28.45 PM.jpeg',
    isAvailable: true,
  },
  {
    id: 'flower-6',
    title: 'White Lily Flower Pot',
    description: 'A charming handmade white lily potted flower. Add elegance to your work desk or bedside table.',
    category: 'flowers',
    price: 699,
    originalPrice: 1199,
    image: '/images/WhatsApp Image 2026-07 at 6.28.45 PM.jpeg',
    isAvailable: true,
  },
  {
    id: 'flower-7',
    title: 'Ocean Blue Forget-Me-Not Bouquet',
    description: 'A lovely bundle of tiny forget-me-not blossoms crocheted in shades of sky blue. Comes with a decorative bow.',
    category: 'flowers',
    price: 449,
    originalPrice: 799,
    image: '/images/WhatsApp Image 2026-06-17 at 6.28.46 PM.jpeg',
    isAvailable: true,
  },
  {
    id: 'flower-8',
    title: 'Sunny Meadow Sunflower Set',
    description: 'A premium pair of large crocheted sunflowers with custom wood stands. Adds instant warmth and hand-crafted joy.',
    category: 'flowers',
    price: 899,
    originalPrice: 1499,
    image: '/images/WhatsApp Image 2026-weat 6.28.46 PM.jpeg',
    isAvailable: true,
  },

  // Keychains
  {
    id: 'keychain-1',
    title: 'Chubby Kitty Crochet Keychain',
    description: 'Super soft, stuffed little kitty keychain with a gold ring clasp. Made from milk cotton yarn.',
    category: 'keychains',
    price: 199,
    originalPrice: 399,
    image: '/images/WhatsApp Image 2026-06-17 at 6.28.47 PM.jpeg',
    isAvailable: true,
  },
  {
    id: 'keychain-2',
    title: 'Cute Octopus Crochet Keychain',
    description: 'Adorable pastel-colored octopus keychain with 8 tiny curly tentacles. Includes key ring and chain.',
    category: 'keychains',
    price: 179,
    originalPrice: 349,
    image: '/images/WhatsApp Image 2026-06-gt 6.28.47 PM.jpeg',
    isAvailable: true,
  },
  {
    id: 'keychain-3',
    title: 'Mini Dinosaur Crochet Keychain',
    description: 'A sweet little green T-Rex keychain handwoven with love. Safe metal keyring attached.',
    category: 'keychains',
    price: 249,
    originalPrice: 499,
    image: '/images/WhatsApp][ge 2026-06-17 at 6.28.47 PM.jpeg',
    isAvailable: true,
  },
  {
    id: 'keychain-4',
    title: 'Kawaii Frog Crochet Keychain',
    description: 'Chubby round frog keychain with rosy cheeks. The perfect accessory for backpacks, handbags, or keys.',
    category: 'keychains',
    price: 199,
    originalPrice: 399,
    image: '/images/WhatsApp Image 2026-06-17 at 6.28.47thuuu (1).jpeg',
    isAvailable: true,
  },
  {
    id: 'keychain-5',
    title: 'Pink Piggy Amigurumi Keychain',
    description: 'Lovely pink pig amigurumi keychain. Handcrafted with high quality stuffing for a plush feel.',
    category: 'keychains',
    price: 189,
    originalPrice: 349,
    image: '/images/WhatsApp Image 2026-06-17 qwawset 6.28.48 PM.jpeg',
    isAvailable: true,
  },
  {
    id: 'keychain-6',
    title: 'Spooky Ghost Crochet Keychain',
    description: 'A tiny, friendly ghost keychain that glows under blacklight. Soft, squishy, and not spooky at all!',
    category: 'keychains',
    price: 149,
    originalPrice: 299,
    image: '/images/WhatsApp Image 2026-06-17 at 6.28.49 PM.jpeg',
    isAvailable: true,
  },
  {
    id: 'keychain-7',
    title: 'Magical Unicorn Keychain',
    description: 'Handwoven white unicorn with a pastel rainbow mane and a small gold horn. Extremely detailed amigurumi work.',
    category: 'keychains',
    price: 299,
    originalPrice: 599,
    image: '/images/WhatsApp-7 at 6.28.49 PM.jpeg',
    isAvailable: true,
  },
  {
    id: 'keychain-8',
    title: 'Happy Bee Crochet Keychain',
    description: 'Buzzy bumblebee keychain with tiny white wings and stripes. Guaranteed to bring a smile to your face.',
    category: 'keychains',
    price: 199,
    originalPrice: 399,
    image: '/images/WhatsApp Image 2026-06-17 at =-28.49 PM.jpeg',
    isAvailable: true,
  },

  // One Piece Art
  {
    id: 'art-1',
    title: 'Monkey D. Luffy Gear 5 Canvas',
    description: 'Stunning handcrafted wall canvas depicting Luffy in his mythical Sun God Nika form. Vibrant acrylic work.',
    category: 'art',
    price: 999,
    originalPrice: 1999,
    image: '/images/WhatsApp Image 2026-06-17 agfds48 PM.jpeg',
    isAvailable: true,
  },
  {
    id: 'art-2',
    title: 'Roronoa Zoro Three-Sword Style Frame',
    description: 'Hand-inked portrait of Roronoa Zoro wielding Wado Ichimonji, Sandai Kitetsu, and Shusui. Premium wood frame.',
    category: 'art',
    price: 1299,
    originalPrice: 2499,
    image: '/images/WhatsApp Image 2026-06-17 at  PM.jpeg',
    isAvailable: true,
  },
  {
    id: 'art-3',
    title: 'Portgas D. Ace Fire Fist Wooden Poster',
    description: 'Custom wooden engraving featuring Ace engulfed in flame. Handmade wood burned art with matte finish.',
    category: 'art',
    price: 899,
    originalPrice: 1799,
    image: '/images/WhatsApp Image 2026-06-17 at 6.285 PM.jpeg',
    isAvailable: true,
  },
  {
    id: 'art-4',
    title: 'Trafalgar Law Room Neon Painting',
    description: 'Fluorescent acrylic art of Trafalgar Law activating his ROOM sphere. Glows beautifully under UV light.',
    category: 'art',
    price: 1499,
    originalPrice: 2999,
    image: '/images/WhatsApp Image 2026-06-17 at hg44 PM.jpeg',
    isAvailable: true,
  },
  {
    id: 'art-5',
    title: 'Shanks Red Hair Emperor Poster',
    description: 'Detailed hand-sketched and watercolor poster of Red Hair Shanks. Printed on textured heavyweight art card.',
    category: 'art',
    price: 999,
    originalPrice: 1999,
    image: '/images/WhatsApp Image 2026-06-17 at ytrPM.jpeg',
    isAvailable: true,
  },
  {
    id: 'art-6',
    title: 'Straw Hat Crew Going Merry Silhouette',
    description: 'Minimalistic black papercraft silhouette of the Going Merry sailing into the sunset. Handcut frame art.',
    category: 'art',
    price: 799,
    originalPrice: 1599,
    image: '/images/WhatsApp Image 2sdvb at 6.28.46 PM.jpeg',
    isAvailable: true,
  },
  {
    id: 'art-7',
    title: 'Tony Tony Chopper Cherry Blossom Art',
    description: 'Lovely pastel colored canvas painting of Chopper surrounded by falling Sakura petals. Very sweet and vibrant.',
    category: 'art',
    price: 699,
    originalPrice: 1499,
    image: '/images/WhatsApp Ima[pojhg 2026-06-17 at 6.28.46 PM.jpeg',
    isAvailable: true,
  }
];

// LocalStorage keys
const STORAGE_KEYS = {
  PRODUCTS: 'fluffy_bloom_products',
  ORDERS: 'fluffy_bloom_orders',
  USERS: 'fluffy_bloom_users',
  LOGGED_IN_USER: 'fluffy_bloom_logged_in_user'
};

// Initialize DB if empty
export const initDB = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }
  
  const defaultAdmin = {
    id: 'admin-1',
    name: 'Secret Admin',
    email: 'yeshwanthkg@gmail.com',
    password: 'Vinod Jangir',
    isAdmin: true
  };

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const defaultUsers = [
      defaultAdmin,
      {
        id: 'user-1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'user123',
        isAdmin: false
      }
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  } else {
    // Keep admin credentials synchronized to yeshwanthkg@gmail.com / Vinod Jangir
    try {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)!);
      const adminIdx = users.findIndex((u: any) => u.isAdmin === true);
      if (adminIdx >= 0) {
        users[adminIdx].email = defaultAdmin.email;
        users[adminIdx].password = defaultAdmin.password;
        users[adminIdx].name = defaultAdmin.name;
      } else {
        users.push(defaultAdmin);
      }
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
  }
};

// Product Functions
export const getProducts = (): Product[] => {
  initDB();
  const prods = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return prods ? JSON.parse(prods) : [];
};

export const saveProduct = (product: Product): void => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === product.id);
  
  if (index >= 0) {
    products[index] = product;
  } else {
    products.push(product);
  }
  
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

export const deleteProduct = (id: string): void => {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
};

// User Functions
export const getUsers = () => {
  initDB();
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : [];
};

export const getLoggedInUser = (): User | null => {
  const user = localStorage.getItem(STORAGE_KEYS.LOGGED_IN_USER);
  return user ? JSON.parse(user) : null;
};

export const loginUser = (email: string, password: string): User | null => {
  const users = getUsers();
  const found = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (found) {
    const loggedIn = { id: found.id, name: found.name, email: found.email, isAdmin: found.isAdmin };
    localStorage.setItem(STORAGE_KEYS.LOGGED_IN_USER, JSON.stringify(loggedIn));
    return loggedIn;
  }
  return null;
};

export const registerUser = (name: string, email: string, password: string): User | null => {
  const users = getUsers();
  const exists = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) return null;
  
  const newUser = {
    id: 'user-' + Date.now(),
    name,
    email,
    password,
    isAdmin: false
  };
  
  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  
  const loggedIn = { id: newUser.id, name: newUser.name, email: newUser.email, isAdmin: newUser.isAdmin };
  localStorage.setItem(STORAGE_KEYS.LOGGED_IN_USER, JSON.stringify(loggedIn));
  return loggedIn;
};

export const logoutUser = (): void => {
  localStorage.removeItem(STORAGE_KEYS.LOGGED_IN_USER);
};

// Order Functions
export const getOrders = (): Order[] => {
  initDB();
  const ords = localStorage.getItem(STORAGE_KEYS.ORDERS);
  return ords ? JSON.parse(ords) : [];
};

const generateTrackingCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 14; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const createOrder = (orderData: Omit<Order, 'id' | 'date' | 'status'>): Order => {
  const orders = getOrders();
  const newOrder: Order = {
    ...orderData,
    id: generateTrackingCode(), // Unique 14-digit alphanumeric code
    date: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    status: 'Pending'
  };
  
  orders.unshift(newOrder); // Add to beginning of array
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  return newOrder;
};

export const updateOrderStatus = (orderId: string, status: 'Pending' | 'Shipped' | 'Delivered'): void => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index >= 0) {
    orders[index].status = status;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }
};
