import { createBrowserRouter } from 'react-router-dom';
import { PublicLayout, AuthLayout, AccountLayout, MerchantLayout, AdminLayout } from '../layouts/layouts.js';
import { HomePage } from '../pages/HomePage.js';
import { SearchPage } from '../pages/SearchPage.js';
import { ProductDetailPage } from '../pages/ProductDetailPage.js';
import { StoreDetailPage } from '../pages/StoreDetailPage.js';
import { CategoryListPage } from '../pages/CategoryListPage.js';
import { LoginPage } from '../pages/LoginPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { ResetPasswordPage } from '../pages/ResetPasswordPage.js';
import { ProfilePage } from '../pages/ProfilePage.js';
import { CartPage } from '../pages/CartPage.js';
import { CheckoutPage } from '../pages/CheckoutPage.js';
import { CheckoutSuccessPage } from '../pages/CheckoutSuccessPage.js';
import { OrdersPage } from '../pages/OrdersPage.js';
import { OrderDetailPage } from '../pages/OrderDetailPage.js';
import { MerchantOrdersPage } from '../pages/MerchantOrdersPage.js';
import { BecomeMerchantPage } from '../pages/BecomeMerchantPage.js';
import { MerchantDashboardPage } from '../pages/MerchantDashboardPage.js';
import { MerchantProductsPage } from '../pages/MerchantProductsPage.js';
import { MerchantProductFormPage } from '../pages/MerchantProductFormPage.js';
import { StoreProfilePage } from '../pages/StoreProfilePage.js';
import { WishlistPage } from '../pages/WishlistPage.js';
import { ChatPage } from '../pages/ChatPage.js';
import { AdminDashboardPage } from '../pages/AdminDashboardPage.js';
import { AdminUsersPage } from '../pages/AdminUsersPage.js';
import { AdminCategoriesPage } from '../pages/AdminCategoriesPage.js';
import { AdminProductsPage } from '../pages/AdminProductsPage.js';
import { AdminOrdersPage } from '../pages/AdminOrdersPage.js';
import { AdminVouchersPage } from '../pages/AdminVouchersPage.js';
import { AdminAuditLogsPage } from '../pages/AdminAuditLogsPage.js';
import { NotFoundPage } from '../pages/NotFoundPage.js';
import { RequireAuth, RequireMerchant, RequireAdmin } from './guards.js';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/search', element: <SearchPage /> },
      { path: '/categories', element: <CategoryListPage /> },
      { path: '/products/:productId', element: <ProductDetailPage /> },
      { path: '/stores/:storeId', element: <StoreDetailPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },
  {
    element: <AccountLayout />,
    children: [
      { path: '/cart', element: <RequireAuth><CartPage /></RequireAuth> },
      { path: '/checkout', element: <RequireAuth><CheckoutPage /></RequireAuth> },
      { path: '/checkout/success/:checkoutId', element: <RequireAuth><CheckoutSuccessPage /></RequireAuth> },
      { path: '/orders', element: <RequireAuth><OrdersPage /></RequireAuth> },
      { path: '/orders/:orderId', element: <RequireAuth><OrderDetailPage /></RequireAuth> },
      { path: '/wishlist', element: <RequireAuth><WishlistPage /></RequireAuth> },
      { path: '/chat', element: <RequireAuth><ChatPage /></RequireAuth> },
      { path: '/me', element: <RequireAuth><ProfilePage /></RequireAuth> },
      { path: '/become-merchant', element: <RequireAuth><BecomeMerchantPage /></RequireAuth> },
    ],
  },
  {
    element: <MerchantLayout />,
    children: [
      { path: '/merchant', element: <RequireMerchant><MerchantDashboardPage /></RequireMerchant> },
      { path: '/merchant/store', element: <RequireMerchant><StoreProfilePage /></RequireMerchant> },
      { path: '/merchant/products', element: <RequireMerchant><MerchantProductsPage /></RequireMerchant> },
      { path: '/merchant/products/new', element: <RequireMerchant><MerchantProductFormPage /></RequireMerchant> },
      { path: '/merchant/products/:productId/edit', element: <RequireMerchant><MerchantProductFormPage /></RequireMerchant> },
      { path: '/merchant/orders', element: <RequireMerchant><MerchantOrdersPage /></RequireMerchant> },
      { path: '/merchant/orders/:orderId', element: <RequireMerchant><OrderDetailPage /></RequireMerchant> },
    ],
  },
  {
    element: <AdminLayout />,
    children: [
      { path: '/admin', element: <RequireAdmin><AdminDashboardPage /></RequireAdmin> },
      { path: '/admin/users', element: <RequireAdmin><AdminUsersPage /></RequireAdmin> },
      { path: '/admin/categories', element: <RequireAdmin><AdminCategoriesPage /></RequireAdmin> },
      { path: '/admin/products', element: <RequireAdmin><AdminProductsPage /></RequireAdmin> },
      { path: '/admin/orders', element: <RequireAdmin><AdminOrdersPage /></RequireAdmin> },
      { path: '/admin/vouchers', element: <RequireAdmin><AdminVouchersPage /></RequireAdmin> },
      { path: '/admin/audit-logs', element: <RequireAdmin><AdminAuditLogsPage /></RequireAdmin> },
    ],
  },
  {
    element: <PublicLayout />,
    children: [
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
