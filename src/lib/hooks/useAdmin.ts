import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserDTO } from "@/types/auth";

/**
 * Hook to check if current user is an admin
 * Redirects to home if not authorized
 */
export function useAdminAccess() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserDTO | null>(null);

  useEffect(() => {
    const checkAdminStatus = () => {
      try {
        const storedUser = localStorage.getItem("user");
        
        if (!storedUser) {
          setIsAdmin(false);
          setIsLoading(false);
          router.push("/admin/login");
          return;
        }

        const userData = JSON.parse(storedUser) as UserDTO;
        setUser(userData);

        if (userData.roles.includes("ADMIN")) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          router.push("/");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        router.push("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [router]);

  return { isAdmin, isLoading, user };
}

/**
 * Hook to logout admin user
 */
export function useAdminLogout() {
  const router = useRouter();

  const logout = async () => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      sessionStorage.removeItem("admin_auth_verified");
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      sessionStorage.removeItem("admin_auth_verified");
      router.push("/admin/login");
    }
  };

  return { logout };
}
