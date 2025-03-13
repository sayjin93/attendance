import { getAuthHeaders } from "./utils/getAuthHeaders";
import ClientLayout from "./ClientLayout";

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { professorId, isAdmin } = await getAuthHeaders();

    // 2) Return a client component, passing data as props
    return (
        <ClientLayout professorId={professorId} isAdmin={isAdmin}>
            {children}
        </ClientLayout>
    );
}