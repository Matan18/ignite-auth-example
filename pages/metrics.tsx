import { useContext, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Metrics() {
  const { isAuthenticated } = useContext(AuthContext)

  useEffect(() => {
    api.get(`/me`)
      .then(response => console.log(response))
      .catch(err => console.log(err))
  }, [])

  return (
    <h1>Metrics: {isAuthenticated}</h1>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx)

  return {
    props: {}
  }
}, {
  permissions: [`metrics.list`],
  roles: [`administrator`]
})