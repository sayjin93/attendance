/**
 * Shared utility functions.
 * For API calls, use the service layer in @/services instead.
 */
import { authService } from "@/services";

export const handleLogout = async () => {
    try {
        await authService.logout();
        window.location.href = "/login";
    } catch (error) {
        console.error("Logout failed:", error);
    }
};

export { getTodayDate, formatDate, cn as classNames } from "@/lib/utils";
