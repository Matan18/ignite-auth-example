type User = {
  permissions: string[]
  roles: string[]
}

type ValidateUserPermissionsParams = {
  user: User
  permissions?: string[]
  roles?: string[]
}

export function validateuserPermissions({ user, permissions = [], roles = [] }: ValidateUserPermissionsParams) {
  if (permissions.length > 0) {
    const hasAllPermissions = permissions?.every(permission =>
      user?.permissions.includes(permission))

    if (!hasAllPermissions) return false;
  }
  if (roles.length > 0) {
    const hasAllRole = roles?.some(role =>
      user?.roles.includes(role))

    if (!hasAllRole) return false;
  }

  return true;
}