export const handleLogout = async () => {
    try {
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        window.location.href = "/login"; // Redirect to login page after logout
    } catch (error) {
        console.error("Logout failed:", error);
    }
};
