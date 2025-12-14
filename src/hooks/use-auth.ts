import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export interface User {
    id: string
    name: string
    email: string
    role: string
    image: string | null
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const fetchUser = async () => {
        try {
            const response = await fetch("/api/auth/me")
            if (response.ok) {
                const data = await response.json()
                setUser(data.user)
            } else {
                setUser(null)
            }
        } catch (error) {
            console.error("Failed to fetch user:", error)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" })
            setUser(null)
            router.push("/login")
            router.refresh()
        } catch (error) {
            console.error("Logout failed:", error)
        }
    }

    return { user, loading, logout, mutate: fetchUser }
}
