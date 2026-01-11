import { PrismaClient, Role, ProjectStatus, TicketStatus, RequestStatus, ForestType } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const htmlBody = (paragraphs: string[], imageUrl?: string) => {
  const image = imageUrl ? `<p><img src="${imageUrl}" alt="project image" /></p>` : "";
  return [image, ...paragraphs.map((p) => `<p>${p}</p>`)].filter(Boolean).join("");
};

async function resetDatabase() {
  await prisma.verificationToken.deleteMany();
  await prisma.ticketAttachment.deleteMany();
  await prisma.ticketComment.deleteMany();
  await prisma.ticketLog.deleteMany();
  await prisma.ticketAssignee.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.projectLocationVersion.deleteMany();
  await prisma.projectLocation.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.investorRequest.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.showcaseHero.deleteMany();
}

async function seedUsers(password: string) {
  const users = [
    { name: "Quỳnh Nguyễn", email: "admin@example.com", phone: "+84 912 000 111", role: Role.admin },
    { name: "Huyền Trần", email: "ops@example.com", phone: "+84 913 222 333", role: Role.admin },
    { name: "Lan Phạm", email: "lan.pham@partners.com", phone: "+84 934 555 888", role: Role.partner },
    { name: "Kiệt Trần", email: "kiet.tran@partners.com", phone: "+84 925 101 202", role: Role.partner },
    { name: "Minh Bùi", email: "minh.bui@partners.com", phone: "+84 936 303 404", role: Role.partner, status: "inactive" },
    { name: "An Hồ", email: "an.ho@partners.com", phone: "+84 937 909 101", role: Role.partner },
    { name: "Sophie Lê", email: "sophie.le@greenbamboo.vn", phone: "+84 988 111 222", role: Role.investor },
    { name: "Thanh Tùng", email: "thanh.tung@impactfund.vn", phone: "+84 955 333 444", role: Role.investor },
    { name: "Minh Châu", email: "minh.chau@earthcare.vn", phone: "+84 977 666 777", role: Role.investor },
  ];

  const created = await Promise.all(
    users.map((u) =>
      prisma.user.create({
        data: {
          ...u,
          passwordHash: password,
        },
      })
    )
  );

  return Object.fromEntries(created.map((u) => [u.email, u]));
}

async function seedProjects(userMap: Record<string, any>) {
  const projectsData = [
    {
      title: "Phục hồi rừng bản địa Lạng Sơn",
      description: htmlBody(
        [
          "Khôi phục rừng tự nhiên trên đất thoái hóa, ưu tiên cây bản địa như dẻ, trám và lim. Kế hoạch 3 năm gồm làm giàu rừng, phục hồi tầng tán và xây dựng lực lượng bảo vệ cộng đồng.",
          "Đội ngũ phối hợp với kiểm lâm xã để thiết lập các ô tiêu chuẩn theo dõi tăng trưởng và kiểm soát cháy rừng mùa khô.",
        ],
        "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80"
      ),
      status: ProjectStatus.active,
      forestType: ForestType.natural,
      country: "Việt Nam",
      province: "Lạng Sơn",
      area: "150 ha",
      members: [
        { role: Role.partner, email: "lan.pham@partners.com" },
        { role: Role.partner, email: "kiet.tran@partners.com" },
        { role: Role.investor, email: "sophie.le@greenbamboo.vn" },
      ],
    },
    {
      title: "Lá chắn ngập mặn Mekong",
      description: htmlBody(
        [
          "Trồng phục hồi đước và mắm tại các dải bờ xói lở, lắp thiết bị đo độ mặn và mực nước để cảnh báo sớm.",
          "Kết hợp tuần tra cộng đồng và ảnh vệ tinh để đánh giá mật độ tán rừng hằng tháng, bảo vệ sinh kế nuôi trồng thủy sản.",
        ],
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
      ),
      status: ProjectStatus.active,
      forestType: ForestType.natural,
      country: "Việt Nam",
      province: "Bạc Liêu",
      area: "96 ha",
      members: [
        { role: Role.partner, email: "an.ho@partners.com" },
        { role: Role.partner, email: "lan.pham@partners.com" },
        { role: Role.investor, email: "thanh.tung@impactfund.vn" },
      ],
    },
    {
      title: "Trang trại thông Tây Nguyên",
      description: htmlBody(
        [
          "Khu rừng trồng thông lấy nhựa có chứng chỉ FSC, bổ sung dải cây bụi bản địa để giữ ẩm và giảm xói mòn.",
          "Đội vận hành thử nghiệm cảm biến độ ẩm đất IoT và lịch khai thác giật lùi để tối ưu sản lượng nhựa.",
        ],
        "https://images.unsplash.com/photo-1523978591478-c753949ff840?auto=format&fit=crop&w=1200&q=80"
      ),
      status: ProjectStatus.active,
      forestType: ForestType.artificial,
      country: "Việt Nam",
      province: "Gia Lai",
      area: "210 ha",
      members: [
        { role: Role.partner, email: "kiet.tran@partners.com" },
        { role: Role.partner, email: "minh.bui@partners.com" },
        { role: Role.investor, email: "sophie.le@greenbamboo.vn" },
        { role: Role.investor, email: "minh.chau@earthcare.vn" },
      ],
    },
    {
      title: "Hợp tác xã tre Quảng Ngãi",
      description: htmlBody(
        [
          "Mô hình rừng trồng tre luân kỳ kết hợp cây che phủ đậu nành để phục hồi đất và đa dạng sinh học.",
          "Kế hoạch 2024 tập trung mở rộng 30 ha mới, lắp đặt hệ thống tưới nhỏ giọt tiết kiệm nước và đào mương giữ ẩm.",
        ],
        "https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=1200&q=80"
      ),
      status: ProjectStatus.completed,
      forestType: ForestType.artificial,
      country: "Việt Nam",
      province: "Quảng Ngãi",
      area: "128 ha",
      members: [
        { role: Role.partner, email: "an.ho@partners.com" },
        { role: Role.partner, email: "lan.pham@partners.com" },
        { role: Role.investor, email: "thanh.tung@impactfund.vn" },
        { role: Role.investor, email: "minh.chau@earthcare.vn" },
      ],
    },
  ];

  const projects = [];
  for (const project of projectsData) {
    const created = await prisma.project.create({
      data: {
        title: project.title,
        description: project.description,
        status: project.status,
        forestType: project.forestType,
        country: project.country,
        province: project.province,
        area: project.area,
        members: {
          create: project.members.map((m) => ({
            role: m.role,
            userId: userMap[m.email].id,
          })),
        },
      },
    });
    projects.push(created);
  }

  return projects;
}

async function seedLocations(projects: any[]) {
  const [p1, p2, p3, p4] = projects;
  await prisma.projectLocation.createMany({
    data: [
      { projectId: p1.id, latitude: 21.8334, longitude: 106.7701, label: "Ô mẫu 1", name: "Đồi Kéo" },
      { projectId: p1.id, latitude: 21.8249, longitude: 106.7543, label: "Ô mẫu 2", name: "Bản Keo" },
      { projectId: p2.id, latitude: 9.2312, longitude: 105.6921, label: "Cồn chắn sóng", name: "Cồn Đước" },
      { projectId: p2.id, latitude: 9.2458, longitude: 105.7055, label: "Trạm đo", name: "Trạm mặn 01" },
      { projectId: p3.id, latitude: 13.9812, longitude: 108.1033, label: "Lô thu nhựa", name: "Lô T1" },
      { projectId: p3.id, latitude: 13.9655, longitude: 108.1156, label: "Lô thử nghiệm", name: "Lô IoT" },
      { projectId: p4.id, latitude: 15.1031, longitude: 108.6101, label: "Vùng ươm", name: "Nursery Bắc" },
      { projectId: p4.id, latitude: 15.0899, longitude: 108.5922, label: "Lô tre 2023", name: "Lô tre QN-23" },
    ],
  });
}

async function seedTickets(projects: any[], userMap: Record<string, any>) {
  const [p1, p2, p3, p4] = projects;
  await prisma.ticket.create({
    data: {
      title: "Đo đạc tái sinh tự nhiên",
      description: "Thu thập mật độ cây tái sinh và loài ưu thế tại 8 ô tiêu chuẩn.",
      projectId: p1.id,
      status: TicketStatus.in_progress,
      assignees: { create: [{ userId: userMap["lan.pham@partners.com"].id }] },
      logs: {
        create: [
          { message: "Đã đo 4/8 ô, mật độ trung bình 1.200 cây/ha", userId: userMap["lan.pham@partners.com"].id },
          { message: "Upload ảnh ô mẫu lên hệ thống", userId: userMap["lan.pham@partners.com"].id },
        ],
      },
      comments: {
        create: [
          { message: "Nhớ gắn tọa độ GPS từng ô", userId: userMap["ops@example.com"].id, userRole: Role.admin },
        ],
      },
      attachments: {
        create: [{ name: "plots-kml.kml", type: "kml", url: "https://example.com/plots.kml" }],
      },
    },
  });

  await prisma.ticket.create({
    data: {
      title: "Kiểm tra hệ thống quan trắc mặn",
      description: "Hiệu chuẩn cảm biến và kiểm tra pin năng lượng mặt trời.",
      projectId: p2.id,
      status: TicketStatus.open,
      assignees: { create: [{ userId: userMap["an.ho@partners.com"].id }] },
      comments: {
        create: [
          { message: "Đề nghị chụp ảnh tủ điện sau khi vệ sinh", userId: userMap["admin@example.com"].id, userRole: Role.admin },
        ],
      },
    },
  });

  await prisma.ticket.create({
    data: {
      title: "Lịch khai thác nhựa quý III",
      description: "Cập nhật kế hoạch khai thác giật lùi và phân công nhóm thu nhựa.",
      projectId: p3.id,
      status: TicketStatus.in_progress,
      assignees: {
        create: [
          { userId: userMap["kiet.tran@partners.com"].id },
          { userId: userMap["minh.bui@partners.com"].id },
        ],
      },
      logs: {
        create: [{ message: "Đã khoanh vùng 12 ha cho chu kỳ mới", userId: userMap["kiet.tran@partners.com"].id }],
      },
      comments: {
        create: [
          { message: "Cần báo cáo tồn kho nhựa", userId: userMap["sophie.le@greenbamboo.vn"].id, userRole: Role.investor },
        ],
      },
    },
  });

  await prisma.ticket.create({
    data: {
      title: "Đào mương giữ ẩm và trồng dặm",
      description: "Hoàn thiện 2.5 km mương và trồng dặm 4.000 cây tre giống mới.",
      projectId: p4.id,
      status: TicketStatus.completed,
      assignees: { create: [{ userId: userMap["an.ho@partners.com"].id }] },
      logs: {
        create: [
          { message: "Mương đã xong 100%, kiểm tra nước đọng ổn định", userId: userMap["an.ho@partners.com"].id },
          { message: "Trồng dặm hoàn tất, tỷ lệ sống 94%", userId: userMap["lan.pham@partners.com"].id },
        ],
      },
      attachments: {
        create: [{ name: "photo-drainage.jpg", type: "image", url: "https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=800&q=80" }],
      },
    },
  });
}

async function seedInvestorRequests(projects: any[], userMap: Record<string, any>) {
  const [p1, p2, p3, p4] = projects;
  await prisma.investorRequest.createMany({
    data: [
      {
        content: "Cần bảng phân bổ vốn cho giai đoạn 2024-2025.",
        status: RequestStatus.processing,
        fromName: userMap["sophie.le@greenbamboo.vn"].name,
        fromEmail: userMap["sophie.le@greenbamboo.vn"].email,
        projectId: p3.id,
        investorId: userMap["sophie.le@greenbamboo.vn"].id,
        response: "Đang tổng hợp chi phí thiết bị và nhân công.",
      },
      {
        content: "Đề nghị báo cáo độ mặn tuần này và ảnh hiện trường.",
        status: RequestStatus.pending,
        fromName: userMap["thanh.tung@impactfund.vn"].name,
        fromEmail: userMap["thanh.tung@impactfund.vn"].email,
        projectId: p2.id,
        investorId: userMap["thanh.tung@impactfund.vn"].id,
      },
      {
        content: "Quan tâm mua tín chỉ carbon từ rừng bản địa.",
        status: RequestStatus.completed,
        fromName: userMap["minh.chau@earthcare.vn"].name,
        fromEmail: userMap["minh.chau@earthcare.vn"].email,
        projectId: p1.id,
        investorId: userMap["minh.chau@earthcare.vn"].id,
        response: "Đã gửi phương pháp luận và hồ sơ đo đạc.",
      },
      {
        content: "Muốn tham quan hiện trường tre vào tháng tới.",
        status: RequestStatus.processing,
        fromName: userMap["thanh.tung@impactfund.vn"].name,
        fromEmail: userMap["thanh.tung@impactfund.vn"].email,
        projectId: p4.id,
        investorId: userMap["thanh.tung@impactfund.vn"].id,
        response: "Đã lên lịch khảo sát ngày 12/05, sẽ gửi lịch chi tiết.",
      },
    ],
  });
}

async function seedShowcase() {
  await prisma.showcaseHero.createMany({
    data: [
      {
        locale: "en",
        title: "Vietnam Forest Operations Hub",
        description: "Field-ready dashboards for monitoring natural and plantation forests, built for teams and investors.",
      },
      {
        locale: "vi",
        title: "Trung tâm vận hành rừng",
        description: "Giám sát rừng tự nhiên và rừng trồng với báo cáo minh bạch cho đội ngũ và nhà đầu tư.",
      },
    ],
  });
}

async function main() {
  const password = await hash("password123", 10);
  await resetDatabase();

  const userMap = await seedUsers(password);
  const projects = await seedProjects(userMap);
  await seedLocations(projects);
  await seedTickets(projects, userMap);
  await seedInvestorRequests(projects, userMap);
  await seedShowcase();

  console.log("Seed completed with realistic data");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
