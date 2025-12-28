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

  const [admin, partnerA, partnerB, partnerC, partnerD, investorA, investorB, investorC] = await Promise.all([
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
      data: { name: "Phạm Thị D", email: "phamthid@example.com", phone: "+84 977 654 321", role: Role.partner, status: "inactive", passwordHash: password },
    }),
    prisma.user.create({
      data: { name: "Đặng Minh H", email: "dangminhh@example.com", phone: "+84 955 333 444", role: Role.partner, passwordHash: password },
    }),
    prisma.user.create({
      data: { name: "Lê Văn C", email: "levanc@example.com", phone: "+84 934 567 890", role: Role.investor, passwordHash: password },
    }),
    prisma.user.create({
      data: { name: "Hoàng Văn E", email: "hoangvane@example.com", phone: "+84 956 789 012", role: Role.investor, status: "inactive", passwordHash: password },
    }),
    prisma.user.create({
      data: { name: "Bùi Văn F", email: "buivanf@example.com", phone: "+84 988 111 222", role: Role.investor, passwordHash: password },
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

  const [project2, project3, project4] = await Promise.all([
    prisma.project.create({
      data: {
        title: "Phục hồi rừng Sồi",
        description: "Dự án phục hồi rừng sồi và phong",
        status: ProjectStatus.active,
        country: "Việt Nam",
        province: "Nghệ An",
        area: "87 hecta",
        members: {
          create: [
            { role: Role.partner, userId: partnerB.id },
            { role: Role.investor, userId: investorB.id },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        title: "Tái sinh rừng ngập mặn Cà Mau",
        description: "Khôi phục đa dạng sinh học vùng ngập mặn",
        status: ProjectStatus.completed,
        country: "Việt Nam",
        province: "Cà Mau",
        area: "43 hecta",
        members: {
          create: [
            { role: Role.partner, userId: partnerC.id },
            { role: Role.investor, userId: investorA.id },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        title: "Bảo tồn tre Trà Bồng",
        description: "Dự án bảo tồn tre và hỗ trợ sinh kế địa phương",
        status: ProjectStatus.active,
        country: "Việt Nam",
        province: "Quảng Ngãi",
        area: "60 hecta",
        members: {
          create: [
            { role: Role.partner, userId: partnerD.id },
            { role: Role.partner, userId: partnerA.id },
            { role: Role.investor, userId: investorC.id },
          ],
        },
      },
    }),
  ]);

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

  const ticket2 = await prisma.ticket.create({
    data: {
      title: "Kiểm tra và bảo dưỡng khu B-2",
      description: "Kiểm tra tình trạng cây và làm cỏ khu vực B-2",
      projectId: project2.id,
      status: TicketStatus.open,
      assignees: { create: [{ userId: partnerB.id }] },
    },
  });

  const ticket3 = await prisma.ticket.create({
    data: {
      title: "Đóng hố, bổ sung phân",
      description: "Bổ sung phân hữu cơ và dọn dẹp khu vực A-2",
      projectId: project1.id,
      status: TicketStatus.completed,
      assignees: { create: [{ userId: partnerA.id }] },
      logs: {
        create: [
          { message: "Hoàn thành 100% diện tích", userId: partnerA.id },
          { message: "Đã nghiệm thu", userId: admin.id },
        ],
      },
      comments: {
        create: [
          { message: "Cần thêm báo cáo chi phí", userId: investorA.id, userRole: Role.investor },
          { message: "Đã cập nhật vào bảng tổng hợp", userId: admin.id, userRole: Role.admin },
        ],
      },
    },
  });

  const ticket4 = await prisma.ticket.create({
    data: {
      title: "Theo dõi ngập mặn",
      description: "Quan trắc độ mặn và mức nước hàng tuần",
      projectId: project3.id,
      status: TicketStatus.closed,
      assignees: { create: [{ userId: partnerC.id }] },
      attachments: {
        create: [
          { name: "salinity-week1.csv", type: "csv", url: "#" },
          { name: "photo-mangrove.png", type: "image", url: "#" },
        ],
      },
    },
  });

  await prisma.ticket.create({
    data: {
      title: "Tập huấn cộng đồng",
      description: "Hướng dẫn bảo vệ tre và quy trình thu hoạch bền vững",
      projectId: project4.id,
      status: TicketStatus.in_progress,
      assignees: { create: [{ userId: partnerD.id }, { userId: partnerA.id }] },
      logs: {
        create: [{ message: "Hoàn thành 50% số hộ tham dự", userId: partnerD.id }],
      },
      comments: {
        create: [{ message: "Cần thêm tài liệu hình ảnh", userId: investorC.id, userRole: Role.investor }],
      },
    },
  });

  await prisma.ticket.create({
    data: {
      title: "Đo đạc diện tích thực tế",
      description: "Đo đạc lại diện tích và cập nhật bản đồ GIS",
      projectId: project2.id,
      status: TicketStatus.in_progress,
      assignees: { create: [{ userId: partnerB.id }] },
      logs: {
        create: [{ message: "Đã hoàn thành 30% khu vực phía đông", userId: partnerB.id }],
      },
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
      {
        content: "Đề nghị khảo sát hiện trường tại Cà Mau.",
        status: RequestStatus.completed,
        fromName: investorA.name,
        fromEmail: investorA.email ?? "investor@example.com",
        projectId: project3.id,
        investorId: investorA.id,
        response: "Đã chia sẻ lịch khảo sát và liên hệ đội ngũ địa phương.",
      },
      {
        content: "Đề xuất tạm dừng giải ngân do thời tiết xấu.",
        status: RequestStatus.rejected,
        fromName: investorB.name,
        fromEmail: investorB.email ?? "investor2@example.com",
        projectId: project2.id,
        investorId: investorB.id,
        response: "Lý do không đủ cơ sở, kế hoạch vẫn tiếp tục.",
      },
      {
        content: "Cần báo cáo ESG cho dự án tre.",
        status: RequestStatus.processing,
        fromName: investorC.name,
        fromEmail: investorC.email ?? "investor3@example.com",
        projectId: project4.id,
        investorId: investorC.id,
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
