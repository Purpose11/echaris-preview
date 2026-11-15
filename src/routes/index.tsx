import { Navigate, type RouteObject } from "react-router-dom";

import AdminLayout from "@/layouts/AdminLayout";
import MainLayout from "@/layouts/MainLayout";
import UserLayout from "@/layouts/UserLayout";
import About from "@/pages/About.jsx";
import AdminAdminDetail from "@/pages/Admin/AdminDetail";
import AdminAdmins from "@/pages/Admin/Admins";
import AdminCategories from "@/pages/Admin/Categories";
import AdminCommitments from "@/pages/Admin/Commitments";
import AdminCreateAdmin from "@/pages/Admin/CreateAdmin";
import AdminCreateCategory from "@/pages/Admin/CreateCategory";
import AdminCreatePickupAddress from "@/pages/Admin/CreatePickupAddress";
import AdminCreateProduct from "@/pages/Admin/CreateProduct";
import AdminCustomerDetail from "@/pages/Admin/CustomerDetail";
import AdminCustomers from "@/pages/Admin/Customers";
import AdminEditCategory from "@/pages/Admin/EditCategory";
import AdminEditProduct from "@/pages/Admin/EditProduct";
import AdminForgotPassword from "@/pages/Admin/ForgotPassword";
import AdminLogin from "@/pages/Admin/Login";
import AdminMarketplace from "@/pages/Admin/Marketplace";
import AdminMarketplaceFinancingDetail from "@/pages/Admin/MarketplaceFinancingDetail";
import AdminOverview from "@/pages/Admin/Overview";
import AdminPaymentDetail from "@/pages/Admin/PaymentDetail";
import AdminPayments from "@/pages/Admin/Payments";
import AdminPayouts from "@/pages/Admin/Payouts";
import AdminPickupAddresses from "@/pages/Admin/PickupAddresses";
import AdminProductDetail from "@/pages/Admin/ProductDetail";
import AdminProducts from "@/pages/Admin/Products";
import AdminRecordPayout from "@/pages/Admin/RecordPayout";
import AdminReturnPercentage from "@/pages/Admin/ReturnPercentage";
import AdminSettings from "@/pages/Admin/Settings";
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
      { path: "customers", element: <AdminCustomers /> },
      { path: "customers/:customerId", element: <AdminCustomerDetail /> },
      { path: "kyc", element: <Navigate to="/admin/customers" replace /> },
      { path: "products", element: <AdminProducts /> },
      { path: "products/new", element: <AdminCreateProduct /> },
      { path: "products/:productId/edit", element: <AdminEditProduct /> },
      { path: "products/:productId", element: <AdminProductDetail /> },
      { path: "categories", element: <AdminCategories /> },
      { path: "categories/new", element: <AdminCreateCategory /> },
      { path: "categories/:categoryId/edit", element: <AdminEditCategory /> },
      { path: "commitments", element: <AdminCommitments /> },
      { path: "return-percentage", element: <AdminReturnPercentage /> },
      { path: "payments", element: <AdminPayments /> },
      { path: "payments/:paymentId", element: <AdminPaymentDetail /> },
      { path: "payouts", element: <AdminPayouts /> },
      { path: "payouts/new", element: <AdminRecordPayout /> },
      { path: "marketplace", element: <AdminMarketplace /> },
      {
        path: "marketplace/:financingId",
        element: <AdminMarketplaceFinancingDetail />,
      },
      { path: "pickup-addresses", element: <AdminPickupAddresses /> },
      { path: "pickup-addresses/new", element: <AdminCreatePickupAddress /> },
      { path: "admins", element: <AdminAdmins /> },
      { path: "admins/new", element: <AdminCreateAdmin /> },
      { path: "admins/:adminId", element: <AdminAdminDetail /> },
      { path: "settings", element: <AdminSettings /> },
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
