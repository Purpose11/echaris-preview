import type { RouteObject } from "react-router-dom";

import AdminLayout from "@/layouts/AdminLayout";
import MainLayout from "@/layouts/MainLayout";
import UserLayout from "@/layouts/UserLayout";
import About from "@/pages/About.jsx";
import AdminForgotPassword from "@/pages/Admin/ForgotPassword";
import AdminLogin from "@/pages/Admin/Login";
import AdminOverview from "@/pages/Admin/Overview";
import AdminPlaceholder from "@/pages/Admin/Placeholder";
import Contact from "@/pages/Contact.jsx";
import CommitmentDetails from "@/pages/Dashboard/CommitmentDetails";
import DashboardCommitments from "@/pages/Dashboard/Commitments";
import CreateCommitment from "@/pages/Dashboard/CreateCommitment";
import CreateMarketplaceFinancing from "@/pages/Dashboard/CreateMarketplaceFinancing";
import DashboardMarketplace from "@/pages/Dashboard/Marketplace";
import MarketplaceBrowse from "@/pages/Dashboard/MarketplaceBrowse";
import MarketplaceFinancingDetails from "@/pages/Dashboard/MarketplaceFinancingDetails";
import MarketplaceProductDetails from "@/pages/Dashboard/MarketplaceProductDetails";
import DashboardOverview from "@/pages/Dashboard/Overview";
import DashboardReferrals from "@/pages/Dashboard/Referrals";
import DashboardSettings from "@/pages/Dashboard/Settings";
import ForgotPassword from "@/pages/ForgotPassword";
import Home from "@/pages/Home.jsx";
import Login from "@/pages/Login";
import Marketplace from "@/pages/Marketplace.jsx";
import NotFound from "@/pages/NotFound";
import Register from "@/pages/Register";
import Services from "@/pages/Services.jsx";
import Terms from "@/pages/Terms";
import Verify from "@/pages/Verify";

export const appRoutes: RouteObject[] = [
  /* Client auth — no UserLayout */
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/verify", element: <Verify /> },
  { path: "/terms", element: <Terms /> },
  { path: "/privacy", element: <Terms /> },

  /* Admin auth — no AdminLayout */
  { path: "/admin/login", element: <AdminLogin /> },
  { path: "/admin/forgot-password", element: <AdminForgotPassword /> },

  /* Admin app */
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminOverview /> },
      { path: "users", element: <AdminPlaceholder /> },
      { path: "users/new", element: <AdminPlaceholder /> },
      { path: "users/:id/edit", element: <AdminPlaceholder /> },
      { path: "users/:id", element: <AdminPlaceholder /> },
      { path: "products", element: <AdminPlaceholder /> },
      { path: "products/new", element: <AdminPlaceholder /> },
      { path: "products/:id/edit", element: <AdminPlaceholder /> },
      { path: "products/:id", element: <AdminPlaceholder /> },
      { path: "orders", element: <AdminPlaceholder /> },
      { path: "orders/:id", element: <AdminPlaceholder /> },
      { path: "reports", element: <AdminPlaceholder /> },
      { path: "settings", element: <AdminPlaceholder /> },
      { path: "*", element: <NotFound variant="admin" /> },
    ],
  },

  /* User / client dashboard */
  {
    path: "/dashboard",
    element: <UserLayout />,
    children: [
      { index: true, element: <DashboardOverview /> },
      { path: "commitments", element: <DashboardCommitments /> },
      { path: "commitments/new", element: <CreateCommitment /> },
      { path: "commitments/:commitmentId", element: <CommitmentDetails /> },
      { path: "marketplace", element: <DashboardMarketplace /> },
      { path: "marketplace/browse", element: <MarketplaceBrowse /> },
      {
        path: "marketplace/products/:productId",
        element: <MarketplaceProductDetails />,
      },
      {
        path: "marketplace/finance/:productId",
        element: <CreateMarketplaceFinancing />,
      },
      {
        path: "marketplace/:financingId",
        element: <MarketplaceFinancingDetails />,
      },
      { path: "referrals", element: <DashboardReferrals /> },
      { path: "settings", element: <DashboardSettings /> },
      { path: "*", element: <NotFound variant="user" /> },
    ],
  },

  /* Public marketing site (catch-all last) */
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/about", element: <About /> },
      { path: "/services", element: <Services /> },
      { path: "/marketplace", element: <Marketplace /> },
      { path: "/contact", element: <Contact /> },
      { path: "*", element: <NotFound variant="public" /> },
    ],
  },
];
