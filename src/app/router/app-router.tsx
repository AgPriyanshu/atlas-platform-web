import { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router";
import { App } from "src/app";
import { navigationService } from "shared/navigation/navigation-service";
import { ProtectedRoute } from "./protected-route";
import { RoutePath } from "./constants";
import {
  AppItemPlaceholder,
  DeadStockOwnerRoutes,
  HomePage,
  LevelUpPage,
  LoginPage,
  TodoPage,
  URLShortner,
  WebGIS,
} from "src/features";

export const AppRouter = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigationService.setNavigate(navigate);
  }, [navigate]);

  return (
    <Routes>
      {/* Protected routes - all children require authentication */}
      <Route
        element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path={RoutePath.Todo} element={<TodoPage />} />
        <Route path={RoutePath.Map} element={<WebGIS />} />
        <Route path={RoutePath.URLShortner} element={<URLShortner />} />
        <Route
          path={RoutePath.DeviceClassifier}
          element={<AppItemPlaceholder />}
        />
        <Route path={RoutePath.Store} element={<AppItemPlaceholder />} />
        <Route path={RoutePath.LevelUp} element={<LevelUpPage />} />
        <Route path={RoutePath.WhiteBoard} element={<AppItemPlaceholder />} />
        <Route path={RoutePath.Inventory} element={<AppItemPlaceholder />} />
      </Route>

      {/* Public routes - no authentication required */}
      <Route path={RoutePath.Login} element={<LoginPage />} />
      <Route
        path={`${RoutePath.DeadStock}/*`}
        element={<DeadStockOwnerRoutes />}
      />
    </Routes>
  );
};
