import { useCan } from "../hooks/useCan";

interface CanProps {
  children: React.ReactNode;
  permissions?: string[]
  roles?: string[]
}

export function Can({ children, permissions, roles }: CanProps) {
  const userCanSeComponent = useCan({ permissions, roles })

  if (!userCanSeComponent) return null

  return (
    <>
      {children}
    </>
  )

}