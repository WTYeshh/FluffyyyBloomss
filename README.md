# 🌸 FluffyyyBloomss Storefront

A premium, cozy, and minimal e-commerce storefront designed specifically for **FluffyyyBloomss**—specializing in handcrafted crochet flowers, amigurumi keychains, and custom One Piece art. 

This single-page application is built using a modern **React + TypeScript + Vite** stack, featuring a responsive, micro-animated frosted glass UI, dynamic page layouts tailored to each product category's specific theme, and a flexible database sync architecture.

---

## 👑 Business & Ownership
* **Owner / Business Head:** Vinod Jangir
* **Purpose:** A clean, minimal, premium e-commerce presence displaying and selling handcrafted goods.

---

## 🌟 Core Features

### 1. Unified Cozy Storefront & Catalog
* **Home Page:** Trims out unnecessary clutter to focus on hero highlights, category transitions, and bestseller showcases.
* **Smart Catalog:** Features real-time search, sorting options (by price, title, category), and HSL-blended theme adaptations matching category aesthetics (dusty rose for Flowers, lavender for Keychains, warm sand for Art).
* **Responsive Layout:** Designed from the ground up for both laptop screens (with inline navigations) and mobile phones (using a responsive frosted-glass sliding drawer menu).
* **Intro Loading Bar:** Animated preloader displaying the site brand name and pulsing heart logo.

### 2. checkout & 14-Digit Tracking
* **Checkout Flow:** Customer contact collection (name, phone, email) and delivery address details.
* **14-Digit Secure Tracking Code:** On order checkout, the system automatically generates a unique 14-character alphanumeric code (e.g. `FB3D9E8F7A6C5B`).
* **Order Tracker View:** Customers can enter their tracking code or phone number to see a visual progress stepper (Ordered ➔ Dispatched ➔ Delivered) and their shipment details.

### 3. Active Email Notifications
* Powered by `formsubmit.co` endpoints to deliver instant order placement summaries to the store inbox.
* **Encouragement Mail Trigger:** Admin dashboard features an **"Encourage Patience Mail"** button for delayed handcrafted orders (more than 1 week) to send positive, warm thank-you messages to customers.

### 4. Direct Google Sheets Database Integration
* Syncs product catalog listings from a private spreadsheet.
* **Mobile-Friendly CMS:** The business owner can manage listings directly from their phone's **Google Sheets app**. The website fetches data from the spreadsheet and updates the storefront instantly!
* **Write-Back Capabilities:** Updates, additions, or deletes made from the web Admin Dashboard are automatically posted back to the Google Sheets rows in the background using Google Apps Script triggers.

### 5. Suspense Chunk-Splitting Security
* Code-splitting is implemented using `React.lazy()` to dynamically import the Admin Panel.
* **Inspect Source Protection:** The code for the secret admin dashboard is compiled into a separate file chunk. When a standard visitor opens Chrome DevTools Inspect, the admin code is completely hidden from the script tree and is never requested over the network until they log in as an administrator.

---

## 🛠️ Technical Stack
* **Framework:** React 19 + TypeScript
* **Tooling:** Vite + npm
* **Styling:** Custom Vanilla CSS (HSL variables, glassmorphic filters, slide and pulse keyframe animations)
* **Icons:** Lucide React
* **Data Storage:** Google Sheets Sync (Primary) + local fallback cache

---

## 🚀 Getting Started

### Local Setup
1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Launch Development Server:**
   ```bash
   npm run dev
   ```
3. **Build Production Bundle:**
   ```bash
   npm run build
   ```

### Google Sheets Sync Setup
Detailed instructions on configuring your Google Sheets Web App endpoint are available under the **Overview & Stats** tab inside the website's Admin Dashboard. A copy of the Google Apps Script integration code can also be retrieved directly from the dashboard settings modal.

---

## 📐 Developer's Corner
This website was designed and built with care for FluffyyyBloomss.

* **Developer & Architect:** Yeshwanth
* **Personal Site:** [itsyesh.in](https://itsyesh.in)
* **GitHub Profile:** [@WTYeshh](https://github.com/WTYeshh)
