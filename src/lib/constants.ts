// Application constants
export const APP_NAME = "Wellness Manage";
export const APP_DESCRIPTION = "Wellness management application";

// API Configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Routes
export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  DASHBOARD: "/dashboard",
} as const;
