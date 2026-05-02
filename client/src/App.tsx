import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import {
  AccountAddressesPage,
  AccountMessagesPage,
  AccountOrdersPage,
  AccountPage,
  AdminCategoriesPage,
  AdminChatsPage,
  AdminCustomersPage,
  AdminDiscountsPage,
  AdminOrdersPage,
  AdminOverviewPage,
  AdminProductsPage,
  AdminTeamPage,
  CartPage,
  CheckoutPage,
  ContactPage,
  HomePage,
  LoginPage,
  OrderConfirmationPage,
  ProductDetailPage,
  ShopPage,
  SignupPage,
} from "./pages/Storefront";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/shop" component={ShopPage} />
      <Route path="/products/:slug" component={ProductDetailPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/order-confirmation/:orderNumber" component={OrderConfirmationPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/account" component={AccountPage} />
      <Route path="/account/orders" component={AccountOrdersPage} />
      <Route path="/account/addresses" component={AccountAddressesPage} />
      <Route path="/account/messages" component={AccountMessagesPage} />
      <Route path="/admin" component={AdminOverviewPage} />
      <Route path="/admin/products" component={AdminProductsPage} />
      <Route path="/admin/categories" component={AdminCategoriesPage} />
      <Route path="/admin/orders" component={AdminOrdersPage} />
      <Route path="/admin/customers" component={AdminCustomersPage} />
      <Route path="/admin/team" component={AdminTeamPage} />
      <Route path="/admin/discounts" component={AdminDiscountsPage} />
      <Route path="/admin/chats" component={AdminChatsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster richColors closeButton />
            <Router />
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </ErrorBoundary>
  );
}
