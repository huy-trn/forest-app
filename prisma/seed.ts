import { PrismaClient, Role, ProjectStatus, TicketStatus, RequestStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.count();
  if (existing > 0) {
    // Reset tables to ensure a clean seed.
    await prisma.account.deleteMany();
    await prisma.session.deleteMany();
    await prisma.verificationToken.deleteMany();
    await prisma.ticketAttachment.deleteMany();
    await prisma.ticketComment.deleteMany();
    await prisma.ticketLog.deleteMany();
    await prisma.ticketAssignee.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.projectMember.deleteMany();
    await prisma.project.deleteMany();
    await prisma.investorRequest.deleteMany();
    await prisma.user.deleteMany();
  }

  // Create users
  const password = await hash("password123", 10);

  const [admin, partnerA, partnerB, investorA, investorB] = await Promise.all([
    prisma.user.create({
      data: { name: "Admin", email: "admin@example.com", phone: "+84 123 456 789", role: Role.admin, passwordHash: password },
    }),
    prisma.user.create({
      data: { name: "Nguyễn Văn A", email: "nguyenvana@example.com", phone: "+84 912 345 678", role: Role.partner, passwordHash: password },
    }),
    prisma.user.create({
      data: { name: "Trần Thị B", email: "tranthib@example.com", phone: "+84 923 456 789", role: Role.partner, passwordHash: password },
    }),
    prisma.user.create({
      data: { name: "Lê Văn C", email: "levanc@example.com", phone: "+84 934 567 890", role: Role.investor, passwordHash: password },
    }),
    prisma.user.create({
      data: { name: "Hoàng Văn E", email: "hoangvane@example.com", phone: "+84 956 789 012", role: Role.investor, status: "inactive", passwordHash: password },
    }),
  ]);

  // Projects with members
  const project1 = await prisma.project.create({
    data: {
      title: "Dự án Rừng Thông Miền Bắc",
      description: "Dự án trồng rừng thông quy mô lớn",
      status: ProjectStatus.active,
      country: "Việt Nam",
      province: "Lào Cai",
      area: "125 hecta",
      members: {
        create: [
          { role: Role.partner, userId: partnerA.id },
          { role: Role.investor, userId: investorA.id },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      title: "Phục hồi rừng Sồi",
      description: "Dự án phục hồi rừng sồi và phong",
      status: ProjectStatus.active,
      country: "Việt Nam",
      province: "Nghệ An",
      area: "87 hecta",
      members: {
        create: [{ role: Role.partner, userId: partnerB.id }],
      },
    },
  });

  // Tickets
  const ticket1 = await prisma.ticket.create({
    data: {
      title: "Trồng cây khu vực A-1",
      description: "Trồng 500 cây thông tại khu vực A-1",
      projectId: project1.id,
      status: TicketStatus.in_progress,
      assignees: { create: [{ userId: partnerA.id }] },
      logs: {
        create: [
          {
            message: "Đã trồng 200 cây thông",
            userId: partnerA.id,
          },
        ],
      },
      comments: {
        create: [
          {
            message: "Tiến độ tốt, tiếp tục theo dõi",
            userId: admin.id,
            userRole: Role.admin,
          },
        ],
      },
      attachments: {
        create: [{ name: "photo1.jpg", type: "image", url: "#" }],
      },
    },
  });

  await prisma.ticket.create({
    data: {
      title: "Kiểm tra và bảo dưỡng khu B-2",
      description: "Kiểm tra tình trạng cây và làm cỏ khu vực B-2",
      projectId: project2.id,
      status: TicketStatus.open,
      assignees: { create: [{ userId: partnerB.id }] },
    },
  });

  // Investor requests
  await prisma.investorRequest.createMany({
    data: [
      {
        content: "Quan tâm đầu tư dự án rừng thông.",
        status: RequestStatus.pending,
        fromName: investorA.name,
        fromEmail: investorA.email ?? "investor@example.com",
        projectId: project1.id,
        investorId: investorA.id,
      },
      {
        content: "Muốn xem báo cáo tiến độ dự án sồi.",
        status: RequestStatus.processing,
        fromName: investorB.name,
        fromEmail: investorB.email ?? "investor2@example.com",
        projectId: project2.id,
        investorId: investorB.id,
        response: "Đang chuẩn bị báo cáo.",
      },
    ],
  });

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
