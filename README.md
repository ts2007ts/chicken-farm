# 🐔 Chicken Farm Management System

A comprehensive system for managing poultry farms, tracking investments, monitoring production, and handling financial accounts with precision and transparency.

## 🌟 Key Features

### 📊 Dashboard
- Comprehensive financial summary (Capital, Expenses, Contributions, Current Balance).
- Interactive charts for egg production analysis and expense distribution.
- Quick actions for frequent tasks.

### 👥 Investor Management
- Track investor shares and contribution ratios.
- Automated calculation of expected profits and losses for each investor.
- Complete record of settlements (payouts and contributions).

### 💰 Financial Management
- Record expenses by category (feed, medicine, electricity, etc.).
- Track capital contributions.
- Advanced filtering system for searching financial transactions.

### 🥚 Egg Production
- Daily recording of egg production.
- Distribution of egg shares to families or investors.
- Option to reject delivery and convert shares into monetary value added to the fund.

### 📋 Inventory & Warehouse
- Track chicken counts (starting cycle, purchases, mortality).
- Feed warehouse management (consumption, purchases, low-stock alerts).

### 🗄️ Archiving
- Ability to archive the entire current cycle to start a new one.
- Maintain a historical record of all previous cycles for future reference.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend/Database**: [Firebase (Firestore)](https://firebase.google.com/docs/firestore)
- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth)
- **Charts**: [Recharts](https://recharts.org/)
- **Testing**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **Language Support**: Dual language (Arabic/English) with full RTL support.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (Version 18 or later)
- Yarn or NPM

### Installation Steps
1. **Clone the repository**:
   ```bash
   git clone [repository-url]
   cd chicken-farm
   ```

2. **Install dependencies**:
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory and add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_INITIAL_SUPER_ADMIN_EMAIL=admin@example.com
   ```
   *Note: The email provided in `VITE_INITIAL_SUPER_ADMIN_EMAIL` will be automatically granted Super Admin privileges when they first log in.*


4. **Run the application**:
   ```bash
   yarn dev
   ```

5. **Run tests**:
   ```bash
   yarn test
   ```

---

## 🧪 Testing Suite
The project includes over **37 unit tests** covering:
- Financial calculation logic.
- Data and date processing.
- State management for filters and modals.
- Database security rules.

---

## 🔒 Security Rules
Strict rules have been implemented to ensure data privacy:
- **Investor**: Can only see their own data.
- **Admin**: Has full management and recording privileges.
- **Super Admin**: Has user and role management privileges.

---

## 📄 License
This project is private. Redistribution without prior permission is not allowed.
