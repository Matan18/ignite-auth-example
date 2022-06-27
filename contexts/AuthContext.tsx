import Router from "next/router";
import { destroyCookie, parseCookies, setCookie } from "nookies";
import React, { createContext, useEffect, useState } from "react"
import { api } from "../services/apiClient";

type User = {
  email: string;
  permissions: string[];
  roles: string[];
}

type SignInCredentials = {
  email: string;
  password: string;
}

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>
  signOut: () => void;
  isAuthenticated: boolean
  user: User
}

export const AuthContext = createContext({} as AuthContextData)

let authChannel: BroadcastChannel;

export function signOut(fromChange?: true) {
  destroyCookie(undefined, 'nextauth.token')
  destroyCookie(undefined, 'nextauth.refreshToken')
  console.log(authChannel);

  if (!fromChange) authChannel.postMessage('signOut');
  Router.push('/')
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>()
  const isAuthenticated = !!user;

  useEffect(() => {
    authChannel = new BroadcastChannel('auth')
    authChannel.onmessage = (message) => {
      console.log({ message });

      switch (message.data) {
        case 'signOut':
          signOut(true)
          break;

        default:
          break;
      }
    }
  }, [])

  useEffect(() => {
    const { 'nextauth.token': token } = parseCookies()
    if (token)
      api.get('/me').then(response => {
        const { email, permissions, roles } = response.data;

        setUser({ email, permissions, roles })
      })
  }, [])

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const { data } = await api.post('/sessions', { email, password });

      const { permissions, roles, token, refreshToken } = data;

      setUser({ email, permissions, roles });

      setCookie(undefined, 'nextauth.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 dias
        path: '/'
      });

      setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/'
      });
      Router.push('/dashboard')
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}