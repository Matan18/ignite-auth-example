import jwtDecode from "jwt-decode";
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/errors/AuthTokenError";
import { validateuserPermissions } from "./validateUserPermissions";

type WithSSRAuthOptions = {
  permissions?: string[]
  roles?: string[]
}

export function withSSRAuth<T>(fn: GetServerSideProps<T>, options?: WithSSRAuthOptions): GetServerSideProps<T> {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<T>> => {
    const cookies = parseCookies(ctx)
    const token = cookies[`nextauth.token`]

    if (!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      }
    }

    if (options) {
      const user = jwtDecode<{
        permissions: string[]
        roles: string[]
      }>(token);

      const { permissions, roles } = options;

      const userHasValidPermissions = validateuserPermissions({ user, permissions, roles })

      if (!userHasValidPermissions) {
        return {
          redirect: {
            destination: '/dashboard',
            permanent: false
          }
        }
      }
    }
    try {
      return await fn(ctx);
    } catch (err) {
      if (err instanceof AuthTokenError) {
        destroyCookie(ctx, 'nextauth.token')
        destroyCookie(ctx, 'nextauth.refreshToken')
        return {
          redirect: {
            destination: '/',
            permanent: false
          }
        }
      }
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      }
    }
  }
}