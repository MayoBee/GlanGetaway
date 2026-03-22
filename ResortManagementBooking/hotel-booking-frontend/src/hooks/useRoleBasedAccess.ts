import useAppContext from "./useAppContext";

export const useRoleBasedAccess = () => {
  const { user, userRole, isLoggedIn, isLoading } = useAppContext();

  // Handle both "resort_owner" and "resort-owner" (hyphen or underscore)
  const isSuperAdmin = userRole === "admin";
  const isResortOwner = userRole === "resort_owner" || userRole === "resort-owner";
  const isAdmin = isSuperAdmin; // Only true for actual admin role
  const isFrontDesk = userRole === "front_desk";
  const isHousekeeping = userRole === "housekeeping";
  const isUser = userRole === "user" || isAdmin || isFrontDesk || isHousekeeping;

  const canCreateResort = isAdmin || isResortOwner; // Admin and Resort Owner can create resorts
  const canApproveResorts = isSuperAdmin; // Only Admin can approve resorts
  const canManageAllUsers = isSuperAdmin; // Only Admin can manage all users
  const canViewAllResorts = isSuperAdmin; // Only Admin can view all resorts
  const canManageOwnResorts = isAdmin || isResortOwner; // Admin and Resort Owner can manage their own resorts
  const canBookResorts = isLoggedIn; // Any logged in user can book resorts
  const canManageBookings = isAdmin || isResortOwner || isFrontDesk; // Admin, Resort Owner, and Front Desk can manage bookings
  const canViewDashboard = isAdmin || isResortOwner || isFrontDesk || isHousekeeping; // Admin, Resort Owner, Front Desk, and Housekeeping can view dashboard
  const canManageRooms = isAdmin || isResortOwner || isFrontDesk; // Admin, Resort Owner, and Front Desk can manage rooms
  const canManageHousekeeping = isAdmin || isResortOwner || isHousekeeping; // Admin, Resort Owner, and Housekeeping can manage housekeeping
  const canManagePricing = isAdmin || isResortOwner; // Only Admin and Resort Owner can manage pricing
  const canManageAmenities = isAdmin || isResortOwner; // Only Admin and Resort Owner can manage amenities
  const canManageActivities = isAdmin || isResortOwner || isFrontDesk; // Admin, Resort Owner, and Front Desk can manage activities
  const canViewReports = isAdmin || isResortOwner || isFrontDesk; // Admin, Resort Owner, and Front Desk can view reports
  const canManageBilling = isAdmin || isResortOwner || isFrontDesk; // Admin, Resort Owner, and Front Desk can manage billing
  const canManageMaintenance = isAdmin || isResortOwner; // Only Admin and Resort Owner can manage maintenance
  
  // Only log in development to reduce console noise
  if (process.env.NODE_ENV === 'development') {
    console.log("useRoleBasedAccess - Calculated permissions:", {
      canCreateResort,
      canApproveResorts,
      canManageAllUsers,
      canViewAllResorts,
      canManageOwnResorts,
      canBookResorts
    });
  }

  const getAccessibleRoutes = () => {
    if (!isLoggedIn) {
      return [
        "/",
        "/search",
        "/detail/:id",
        "/sign-in",
        "/register",
      ];
    }

    if (isSuperAdmin) {
      return [
        "/",
        "/search",
        "/detail/:id",
        "/my-bookings",
        "/my-hotels",
        "/admin/resort-approval",
        "/admin/management",
        "/admin/analytics",
        "/profile",
      ];
    }

    if (isResortOwner) {
      return [
        "/",
        "/search",
        "/detail/:id",
        "/my-bookings",
        "/my-hotels",
        "/resort/reports",
        "/profile",
      ];
    }

    // Regular user
    return [
      "/",
      "/search",
      "/detail/:id",
      "/my-bookings",
      "/profile",
    ];
  };

  const canAccessRoute = (route: string) => {
    const accessibleRoutes = getAccessibleRoutes();
    
    // Check exact match or pattern match
    return accessibleRoutes.some(accessibleRoute => {
      if (accessibleRoute.includes(":")) {
        // Handle dynamic routes like "/detail/:id"
        const routePattern = accessibleRoute.replace(/:[^/]+/g, "[^/]+");
        const regex = new RegExp(`^${routePattern}$`);
        return regex.test(route);
      }
      return accessibleRoute === route;
    });
  };

  return {
    user,
    userRole,
    isLoggedIn,
    isLoading,
    isSuperAdmin,
    isResortOwner,
    isAdmin,
    isFrontDesk,
    isHousekeeping,
    isUser,
    canCreateResort,
    canApproveResorts,
    canManageAllUsers,
    canViewAllResorts,
    canManageOwnResorts,
    canBookResorts,
    canManageBookings,
    canViewDashboard,
    canManageRooms,
    canManageHousekeeping,
    canManagePricing,
    canManageAmenities,
    canManageActivities,
    canViewReports,
    canManageBilling,
    canManageMaintenance,
    permissions: {
      canCreateResort,
      canApproveResorts,
      canManageAllUsers,
      canViewAllResorts,
      canManageOwnResorts,
      canBookResorts,
      canManageBookings,
      canViewDashboard,
      canManageRooms,
      canManageHousekeeping,
      canManagePricing,
      canManageAmenities,
      canManageActivities,
      canViewReports,
      canManageBilling,
      canManageMaintenance,
    },
    getAccessibleRoutes,
    canAccessRoute,
  };
};
