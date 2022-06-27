import { GetServerSideProps } from "next";
import { useContext, useEffect } from "react";
import { Can } from "../components/Can";
import { AuthContext } from "../contexts/AuthContext";
import { useCan } from "../hooks/useCan";
import { setupAPIClient } from "../services/api";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
  const { user, signOut } = useContext(AuthContext)

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>
      <button onClick={signOut}>Deslogar</button>
      <Can permissions={['metrics.list']}>
        <h2>Metrics</h2>
      </Can>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = withSSRAuth(async (ctx) => {
  return {
    props: {}
  }
})