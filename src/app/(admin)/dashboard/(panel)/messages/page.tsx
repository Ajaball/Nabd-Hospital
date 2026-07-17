import { prisma } from "@/lib/db";
import { MessagesManager } from "@/components/nabd/dashboard/MessagesManager";

export default async function MessagesAdminPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
  });

  return (
    <MessagesManager
      messages={messages.map((m) => ({
        id: m.id,
        fullName: m.fullName,
        email: m.email,
        phone: m.phone,
        subjectAr: m.subjectAr,
        bodyAr: m.bodyAr,
        isRead: m.isRead,
        createdAt: m.createdAt.toISOString(),
      }))}
    />
  );
}
