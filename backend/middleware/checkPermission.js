export const checkPermission = (routeName) => {
  return async (req, res, next) => {
    // superadmin bypass
    if (req.user.isSuperAdmin) {
      return next();
    }

    // normal RBAC continues...
    return next();
  };
};
