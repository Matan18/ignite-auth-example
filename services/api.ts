import axios, { AxiosError } from 'axios'
import { GetServerSidePropsContext, PreviewData } from 'next';
import Router from 'next/router';
import { destroyCookie, parseCookies, setCookie } from 'nookies'
import { ParsedUrlQuery } from 'querystring';
import { AuthTokenError } from './errors/AuthTokenError';

let isRefreshing = false;
let failedRequestQueue: {
  onSuccess: (token: string) => void;
  onFailure: (err: AxiosError) => void;
}[] = []


export function setupAPIClient(ctx?: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>) {
  let cookies = parseCookies(ctx);

  const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
      'Authorization': `Bearer ${cookies['nextauth.token']}`
    }
  })

  function signOut() {
    destroyCookie(ctx, 'nextauth.token')
    destroyCookie(ctx, 'nextauth.refreshToken')

    Router.push('/')
  }

  api.interceptors.response.use(response => response, (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (error.response.data?.code === `token.expired`) {
        cookies = parseCookies(ctx);

        const { 'nextauth.refreshToken': refreshToken } = cookies;
        const originalConfig = error.config;

        if (!isRefreshing) {
          isRefreshing = true;

          api.post('/refresh', {
            refreshToken,
          }).then(response => {
            console.log('refresh')
            const { token } = response.data;

            setCookie(ctx, 'nextauth.token', token, {
              maxAge: 60 * 60 * 24 * 30,
              path: '/'
            })

            setCookie(ctx, 'nextauth.refreshToken', response.data.refreshToken, {
              maxAge: 60 * 60 * 24 * 30,
              path: '/'
            })

            api.defaults.headers['Authorization'] = `Bearer ${token}`;
            failedRequestQueue.forEach(request => request.onSuccess(token));
            failedRequestQueue = []
          }).catch((err) => {
            failedRequestQueue.forEach(request => request.onFailure(err))
            failedRequestQueue = []

            if (process.browser)
              signOut()
            else
              return Promise.reject(new AuthTokenError())
          }).finally(() => {
            isRefreshing = false;
          })
        }

        return new Promise((resolve, reject) => {
          failedRequestQueue.push({
            onSuccess: (token: string) => {
              originalConfig.headers['Authorization'] = `Bearer ${token}`

              resolve(api(originalConfig))
            },
            onFailure: (err: AxiosError) => {
              reject(err)
            }
          })
        })
      } else {
        if (process.browser) signOut()
      }

    }

    return Promise.reject(error)
  })

  return api;
}