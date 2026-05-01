import { Navigate, Route, Routes } from "react-router";
import {
  getAccessToken,
  getDeadStockOwnerToken,
  setAccessToken,
} from "shared/local-storage/token";
import { DeadStockLoginPage } from "./components/auth/dead-stock-login-page";
import { LeadInbox } from "./components/owner/lead-inbox";
import { OnboardingFlow } from "./components/owner/onboarding-flow";
import { InventoryList } from "./components/owner/inventory-list";
import { OwnerLayout } from "./components/owner/owner-layout";
import { OwnerShop } from "./components/owner/owner-shop";
import { PrivacyPage } from "./components/legal/privacy";
import { TermsPage } from "./components/legal/terms";
import { SearchPage } from "./components/search/search-page";
import { ShopProfile } from "./components/shop/shop-profile";
import { DeadStockPage } from "./dead-stock";

const OwnerRoute = ({ children }: { children: React.ReactNode }) => {
  const ownerToken = getDeadStockOwnerToken();
  if (!ownerToken) {
    return <Navigate to="/dead-stock/login" replace />;
  }
  if (getAccessToken() !== ownerToken) {
    setAccessToken(ownerToken);
  }
  return <>{children}</>;
};

export const DeadStockOwnerRoutes = () => (
  <Routes>
    <Route element={<DeadStockPage />}>
      {/* Public routes — no auth required */}
      <Route index element={<SearchPage />} />
      <Route path="login" element={<DeadStockLoginPage />} />
      <Route path="shops/:id" element={<ShopProfile />} />
      <Route path="terms" element={<TermsPage />} />
      <Route path="privacy" element={<PrivacyPage />} />

      {/* Owner routes — require authentication, rendered inside OwnerLayout */}
      <Route
        path="owner/onboarding"
        element={
          <OwnerRoute>
            <OnboardingFlow />
          </OwnerRoute>
        }
      />
      <Route
        element={
          <OwnerRoute>
            <OwnerLayout />
          </OwnerRoute>
        }
      >
        <Route path="owner/inventory" element={<InventoryList />} />
        <Route path="owner/leads" element={<LeadInbox />} />
        <Route path="owner/shop" element={<OwnerShop />} />
      </Route>
    </Route>
  </Routes>
);
