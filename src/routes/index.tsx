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
import DashboardOverview from "@/pages/Dashboard/Overview";
import DashboardPlaceholder from "@/pages/Dashboard/Placeholder";
import ForgotPassword from "@/pages/ForgotPassword";
import Home from "@/pages/Home.jsx";
import Login from "@/pages/Login";
import Marketplace from "@/pages/Marketplace.jsx";
import NotFound from "@/pages/NotFound";
import Register from "@/pages/Register";
import Services from "@/pages/Services.jsx";
import Verify from "@/pages/Verify";

export const appRoutes: RouteObject[] = [
  /* Client auth — no UserLayout */
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/verify", element: <Verify /> },

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
      { path: "profile", element: <DashboardPlaceholder /> },
      { path: "orders", element: <DashboardPlaceholder /> },
      { path: "wallet", element: <DashboardPlaceholder /> },
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
