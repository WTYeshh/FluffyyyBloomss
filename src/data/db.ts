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
import productsData from './products.json';
const INITIAL_PRODUCTS: Product[] = productsData as Product[];

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
