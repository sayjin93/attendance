import ClientComponent from "./ClientComponent";

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  return <ClientComponent token={params.token} />;
}
