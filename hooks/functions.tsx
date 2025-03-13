export const handleLogout = async () => {
    try {
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        window.location.href = "/login"; // Redirect to login page after logout
    } catch (error) {
        console.error("Logout failed:", error);
    }
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Get month (0-based)
    const day = date.getUTCDate().toString().padStart(2, '0'); // Get day
    const year = date.getUTCFullYear(); // Get full year

    return `${month}/${day}/${year}`;
}

export const classNames = (...classes: (string | false | null | undefined)[]): string => {
    return classes.filter(Boolean).join(" ");
}
