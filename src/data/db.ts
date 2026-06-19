export interface Product {
  id: string;
  title: string;
  description: string;
  category: 'single' | 'bouquet' | 'keychains' | 'accessories';
  price: number;
  originalPrice: number;
  image: string;
  isAvailable: boolean;
  isFeatured?: boolean;
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
  paymentMethod?: 'UPI' | 'COD';
  paymentStatus?: 'Pending' | 'Paid' | 'Failed';
}

// Initial products mapping using the uploaded WhatsApp images
import productsData from './products.json';
const INITIAL_PRODUCTS: Product[] = productsData as Product[];

// LocalStorage keys
const STORAGE_KEYS = {
  PRODUCTS: 'fluffy_bloom_products',
  ORDERS: 'fluffy_bloom_orders',
  USERS: 'fluffy_bloom_users',
  LOGGED_IN_USER: 'fluffy_bloom_logged_in_user',
  GOOGLE_SHEET_URL: 'fluffy_bloom_sheets_url',
  USER_SHEET_URL: 'fluffy_bloom_user_sheets_url',
  PASSWORD_RESETS: 'fluffy_bloom_password_resets',
  ORDERS_SHEET_URL: 'fluffy_bloom_orders_sheets_url'
};

// Initialize DB if empty
export const initDB = () => {
  if (!localStorage.getItem('fluffy_bloom_clean_sheet_v2')) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
    localStorage.setItem('fluffy_bloom_clean_sheet_v2', 'true');
  }

  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }

  
  const defaultAdmin = {
    id: 'admin-1',
    name: 'Admin',
    email: 'FluffyyyBloomss@gmail.com',
    password: '', // Password verified by hash dynamically
    isAdmin: true
  };

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const defaultUsers = [
      defaultAdmin,
      {
        id: 'user-1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446', // SHA-256 for user123
        isAdmin: false
      }
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  } else {
    // Keep admin credentials synchronized
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

const DEFAULT_GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzTay58wSeIN9w26bruA87EiUIG9fV-2Yd8s38dHKAlKlmWVamftxHmZqhxwhFFz8f0A/exec';
const DEFAULT_USER_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwgQ6c_10-qO0h5qC1fK9CA6z5niwR_3w7CuusAawwgA8yN35uaoBoPSAvJDa-wb0sB/exec';

export const getGoogleSheetUrl = (): string => {
  const saved = localStorage.getItem(STORAGE_KEYS.GOOGLE_SHEET_URL);
  if (saved === null) {
    return DEFAULT_GOOGLE_SHEET_URL;
  }
  return saved;
};

export const setGoogleSheetUrl = (url: string): void => {
  localStorage.setItem(STORAGE_KEYS.GOOGLE_SHEET_URL, url);
};

export const getUserSheetUrl = (): string => {
  const saved = localStorage.getItem(STORAGE_KEYS.USER_SHEET_URL);
  if (saved === null) {
    return DEFAULT_USER_SHEET_URL;
  }
  return saved;
};

export const setUserSheetUrl = (url: string): void => {
  localStorage.setItem(STORAGE_KEYS.USER_SHEET_URL, url);
};

export const getOrdersSheetUrl = (): string => {
  const saved = localStorage.getItem(STORAGE_KEYS.ORDERS_SHEET_URL);
  if (saved === null) {
    return '';
  }
  return saved;
};

export const setOrdersSheetUrl = (url: string): void => {
  localStorage.setItem(STORAGE_KEYS.ORDERS_SHEET_URL, url);
};

export const getShippingFee = (): number => {
  const fee = localStorage.getItem('fluffy_bloom_shipping_fee');
  return fee !== null ? Number(fee) : 50;
};

export const setShippingFee = (fee: number): void => {
  localStorage.setItem('fluffy_bloom_shipping_fee', String(fee));
};

export const getShippingThreshold = (): number => {
  const threshold = localStorage.getItem('fluffy_bloom_shipping_threshold');
  return threshold !== null ? Number(threshold) : 1000;
};

export const setShippingThreshold = (threshold: number): void => {
  localStorage.setItem('fluffy_bloom_shipping_threshold', String(threshold));
};

// Push a user record to the customer data Google Sheet
const pushUserToSheet = async (user: { id: string; name: string; email: string; registeredAt?: string }) => {
  const url = getUserSheetUrl();
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'saveUser',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          registeredAt: user.registeredAt || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        }
      })
    });
  } catch (e) {
    console.error('Failed to push user to Google Sheets:', e);
  }
};

export const syncProducts = async (): Promise<Product[]> => {
  const url = getGoogleSheetUrl();
  if (!url) return getProducts();
  
  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const parsedProducts: Product[] = data.map((item: any) => {
        // Normalize keys to lowercase to be safe against case sensitivity in column headers
        const normalizedItem: any = {};
        Object.keys(item).forEach(key => {
          normalizedItem[key.toLowerCase().trim()] = item[key];
        });

        let cat = String(normalizedItem.category || 'single').toLowerCase().trim();
        // Map old spreadsheet categories to the new ones
        if (cat === 'flowers') {
          const title = String(normalizedItem.title || '').toLowerCase();
          if (title.includes('bouquet') || title.includes('set') || title.includes('bunch') || title.includes('pack')) {
            cat = 'bouquet';
          } else {
            cat = 'single';
          }
        } else if (cat === 'art') {
          cat = 'accessories';
        } else if (cat !== 'single' && cat !== 'bouquet' && cat !== 'keychains' && cat !== 'accessories') {
          cat = 'single'; // default fallback
        }

        return {
          id: String(normalizedItem.id || ''),
          title: String(normalizedItem.title || ''),
          description: String(normalizedItem.description || ''),
          category: cat as any,
          price: Number(normalizedItem.price || 0),
          originalPrice: Number(normalizedItem.originalprice || normalizedItem.originalPrice || 0),
          image: String(normalizedItem.image || ''),
          isAvailable: normalizedItem.isavailable === true || normalizedItem.isavailable === 'true' || normalizedItem.isavailable === 1 || normalizedItem.isavailable === '1',
          isFeatured: normalizedItem.isfeatured === true || normalizedItem.isfeatured === 'true' || normalizedItem.isfeatured === 1 || normalizedItem.isfeatured === '1'
        };
      });
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(parsedProducts));
      return parsedProducts;
    }
  } catch (e) {
    console.error("Failed to sync products from Google Sheet:", e);
  }
  return getProducts();
};

export const saveProduct = async (product: Product): Promise<{ sheetSynced: boolean }> => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === product.id);
  
  if (index >= 0) {
    products[index] = product;
  } else {
    products.push(product);
  }
  
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

  const url = getGoogleSheetUrl();
  if (url) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'save', product: product })
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.success) {
          // Verify by fetching from sheet (up to 2 attempts with a short delay if not found immediately)
          let found = false;
          for (let attempt = 0; attempt < 2; attempt++) {
            const syncedProducts = await syncProducts();
            found = syncedProducts.some(p => p.id === product.id);
            if (found) break;
            if (attempt === 0) {
              await new Promise(resolve => setTimeout(resolve, 1500)); // wait 1.5 seconds before retrying
            }
          }
          if (found) {
            return { sheetSynced: true };
          }
        }
      }
    } catch (e) {
      console.error("Failed to post product to Google Sheets and verify:", e);
    }
    return { sheetSynced: false };
  }

  // No sheet connected — saved locally only
  return { sheetSynced: false };
};


export const deleteProduct = async (id: string): Promise<void> => {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));

  const url = getGoogleSheetUrl();
  if (url) {
    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify({
          action: 'delete',
          id: id
        })
      });
    } catch (e) {
      console.error("Failed to delete product from Google Sheets:", e);
    }
  }
};

// Helper to hash a string with SHA-256
const sha256 = async (message: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  const emailHash = await sha256(email.toLowerCase().trim());
  const passHash = await sha256(password);

  // Secure admin comparison using SHA-256 hashes
  if (emailHash === '59f239fc6ed731b28a586870699687fcb39658553fc75c2e2bd0cc42486aec32' && 
      passHash === '7019dd2b07418604e5ec705ac3ec4a60dbb763da07f8f038909c183f42d06225') {
    const loggedIn = { id: 'admin-1', name: 'Admin', email: 'FluffyyyBloomss@gmail.com', isAdmin: true };
    localStorage.setItem(STORAGE_KEYS.LOGGED_IN_USER, JSON.stringify(loggedIn));
    return loggedIn;
  }

  const users = getUsers();
  const found = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === passHash);
  if (found) {
    const loggedIn = { id: found.id, name: found.name, email: found.email, isAdmin: found.isAdmin };
    localStorage.setItem(STORAGE_KEYS.LOGGED_IN_USER, JSON.stringify(loggedIn));
    return loggedIn;
  }
  return null;
};

export const registerUser = async (name: string, email: string, password: string): Promise<User | null> => {
  const users = getUsers();
  const exists = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) return null;
  
  const passHash = await sha256(password);
  const registeredAt = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const newUser = {
    id: 'user-' + Date.now(),
    name,
    email,
    password: passHash,
    isAdmin: false,
    registeredAt
  };
  
  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  
  // Push to Customer Data Google Sheet if connected
  pushUserToSheet({ id: newUser.id, name: newUser.name, email: newUser.email, registeredAt });

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

  // Sync order to sheet
  pushOrderToSheet(newOrder);

  return newOrder;
};

export const updateOrderStatus = (orderId: string, status: 'Pending' | 'Shipped' | 'Delivered'): void => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index >= 0) {
    orders[index].status = status;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    // Update in Google Sheet
    pushOrderToSheet(orders[index]);
  }
};

export const pushOrderToSheet = async (order: Order) => {
  const url = getOrdersSheetUrl();
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'saveOrder',
        order: {
          id: order.id,
          userId: order.userId,
          userName: order.userName,
          email: order.email,
          phone: order.phone,
          address: order.address,
          items: order.items,
          total: order.total,
          status: order.status,
          date: order.date,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus
        }
      })
    });
  } catch (e) {
    console.error('Failed to push order to Google Sheets:', e);
  }
};

export const syncOrders = async (): Promise<Order[]> => {
  const url = getOrdersSheetUrl();
  if (!url) return getOrders();

  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const parsedOrders: Order[] = data.map((item: any) => {
        // Normalize keys to lowercase to be safe against case sensitivity in column headers
        const normalizedItem: any = {};
        Object.keys(item).forEach(key => {
          normalizedItem[key.toLowerCase().trim()] = item[key];
        });

        let parsedItems: any[] = [];
        if (typeof normalizedItem.items === 'string') {
          try {
            parsedItems = JSON.parse(normalizedItem.items);
          } catch (e) {
            console.error("Failed to parse items from order sheet row:", e);
          }
        } else if (Array.isArray(normalizedItem.items)) {
          parsedItems = normalizedItem.items;
        }

        return {
          id: String(normalizedItem.id || ''),
          userId: String(normalizedItem.userid || normalizedItem.userId || ''),
          userName: String(normalizedItem.username || normalizedItem.userName || ''),
          email: String(normalizedItem.email || ''),
          phone: String(normalizedItem.phone || ''),
          address: String(normalizedItem.address || ''),
          items: parsedItems,
          total: Number(normalizedItem.total || 0),
          status: (normalizedItem.status || 'Pending') as 'Pending' | 'Shipped' | 'Delivered',
          date: String(normalizedItem.date || ''),
          paymentMethod: (normalizedItem.paymentmethod || normalizedItem.paymentMethod || 'COD') as 'UPI' | 'COD',
          paymentStatus: (normalizedItem.paymentstatus || normalizedItem.paymentStatus || 'Pending') as 'Pending' | 'Paid' | 'Failed'
        };
      });

      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(parsedOrders));
      return parsedOrders;
    }
  } catch (e) {
    console.error("Failed to sync orders from Google Sheet:", e);
  }
  return getOrders();
};

export const generatePasswordResetOTP = async (email: string): Promise<string | null> => {
  const users = getUsers();
  const exists = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (!exists) return null;

  // Generate 6-digit random code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

  const resetsStr = localStorage.getItem(STORAGE_KEYS.PASSWORD_RESETS);
  const resets: any[] = resetsStr ? JSON.parse(resetsStr) : [];
  
  // Remove existing resets for this email
  const filtered = resets.filter(r => r.email.toLowerCase() !== email.toLowerCase());
  filtered.push({ email: email.toLowerCase(), code, expiresAt });
  
  localStorage.setItem(STORAGE_KEYS.PASSWORD_RESETS, JSON.stringify(filtered));
  return code;
};

export const verifyPasswordResetOTP = (email: string, code: string): boolean => {
  const resetsStr = localStorage.getItem(STORAGE_KEYS.PASSWORD_RESETS);
  if (!resetsStr) return false;
  
  const resets: any[] = JSON.parse(resetsStr);
  const found = resets.find(r => r.email.toLowerCase() === email.toLowerCase() && r.code === code);
  if (!found) return false;
  
  // Verify expiry
  if (Date.now() > found.expiresAt) return false;
  
  return true;
};

export const resetUserPassword = async (email: string, newPassword: string): Promise<boolean> => {
  const users = getUsers();
  const index = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (index === -1) return false;

  const passHash = await sha256(newPassword);
  users[index].password = passHash;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

  // Clear consumed reset code
  const resetsStr = localStorage.getItem(STORAGE_KEYS.PASSWORD_RESETS);
  if (resetsStr) {
    const resets: any[] = JSON.parse(resetsStr);
    const filtered = resets.filter(r => r.email.toLowerCase() !== email.toLowerCase());
    localStorage.setItem(STORAGE_KEYS.PASSWORD_RESETS, JSON.stringify(filtered));
  }

  return true;
};
