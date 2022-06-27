import type { NextPage } from 'next'
import { FormEventHandler, useContext, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import styles from '../styles/Home.module.css'
import { withSSRGuest } from '../utils/withSSRGuest'

const Home: NextPage = () => {
  const [email, setEmail] = useState('matan@matandriola.com')
  const [password, setPassword] = useState('123456')

  const { signIn } = useContext(AuthContext)

  const handleSubmit: FormEventHandler = async (e) => {
    e.preventDefault();
    await signIn({ email, password })
  }

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">logar</button>
    </form>

  )
}

export default Home

export const getServerSideProps = withSSRGuest(async () => {
  return {
    props: {}
  }
})