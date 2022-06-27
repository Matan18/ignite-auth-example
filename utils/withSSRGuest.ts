import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";

export const withSSRGuest = <T>(fn: GetServerSideProps<T>) =>
  async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<T>> => {
    const cookies = parseCookies(ctx)

    if (cookies[`nextauth.token`]) {
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false
        }
      }
    }

    try {
      return await fn(ctx);
    } catch (err) {
      destroyCookie(ctx, 'nextauth.token')
      destroyCookie(ctx, 'nextauth.refreshToken')
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      }
    }
  }
