import { useRouter } from "next/navigation";

export default function useLogout() {
    const router = useRouter();

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("professorId");
        router.push("/login"); // Redirect to login page after logout
    };

    return logout;
}
