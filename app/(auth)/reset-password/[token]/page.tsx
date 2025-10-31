import ClientComponent from "./ClientComponent";

export default async function ResetPasswordPage({ 
  params 
}: { 
  params: Promise<{ token: string }> 
}) {
  const { token } = await params;
  return <ClientComponent token={token} />;
}
