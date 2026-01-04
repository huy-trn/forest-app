import { PrismaClient, Role, ProjectStatus, TicketStatus, RequestStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const buildBodyEn = (summary: string) => {
  const paragraphs = [
    summary,
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer feugiat, arcu sit amet feugiat aliquet, arcu mauris commodo leo, vel tempus arcu lacus id tortor. Sed non bibendum erat. Cras non lorem eget odio bibendum vestibulum.",
    "Curabitur aliquet orci at felis laoreet, sed tempus turpis dapibus. Duis molestie ligula in arcu consectetur, eget vulputate enim cursus. Donec vitae nisi vitae risus volutpat tempor at sed ipsum.",
    "Phasellus gravida, ligula vitae lacinia posuere, nibh nisl sodales leo, id tristique mi quam id nunc. Sed vel sapien at arcu imperdiet gravida quis id turpis. Etiam venenatis, ipsum in tempor aliquet, erat eros posuere nulla, vel ultricies turpis enim eget nibh.",
    "Suspendisse non aliquet leo. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Sed consequat, velit nec tempor posuere, risus est pulvinar erat, sed varius sapien tellus vitae risus.",
  ];
  return paragraphs.map((p) => `<p>${p}</p>`).join("");
};

const buildBodyVi = (summary: string) => {
  const paragraphs = [
    summary,
    "Nội dung mô tả đầy đủ hơn để xem bố cục hiển thị: lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer feugiat arcu vitae ante hendrerit, vel laoreet mi tempor.",
    "Curabitur aliquet orci tại đây giúp bài viết dài hơn, dễ nhìn khi trình bày. Duis molestie ligula in arcu consectetur, eget vulputate enim cursus, giúp trang trông giống blog thực tế.",
    "Phasellus gravida, ligula vitae lacinia posuere, nibh nisl sodales leo, id tristique mi quam id nunc. Sed vel sapien at arcu imperdiet gravida quis id turpis. Etiam venenatis, ipsum in tempor aliquet, erat eros posuere nulla, vel ultricies turpis enim eget nibh.",
    "Suspendisse non aliquet leo. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Sed consequat, velit nec tempor posuere, risus est pulvinar erat, sed varius sapien tellus vitae risus.",
  ];
  return paragraphs.map((p) => `<p>${p}</p>`).join("");
};

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
      data: { name: "Seed Admin", email: "seed-admin@example.com", phone: "+84 123 456 789", role: Role.admin, passwordHash: password },
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

  // Seed some map pins (multiple per project)
  await prisma.projectLocation.createMany({
    data: [
      // Project 1 - Lao Cai vicinity
      { projectId: project1.id, latitude: 22.336651, longitude: 104.148407, label: "Plot A" },
      { projectId: project1.id, latitude: 22.345902, longitude: 104.162938, label: "Plot B" },
      // Project 2 - Nghe An vicinity
      { projectId: project2.id, latitude: 19.192106, longitude: 105.455933, label: "Zone 1" },
      { projectId: project2.id, latitude: 19.205812, longitude: 105.470245, label: "Zone 2" },
      // Project 3 - Ca Mau vicinity
      { projectId: project3.id, latitude: 8.997533, longitude: 105.131836, label: "Mangrove West" },
      // Project 4 - Quang Ngai vicinity
      { projectId: project4.id, latitude: 15.120018, longitude: 108.532715, label: "Tre TB-01" },
    ],
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

  // Showcase content
  await prisma.showcaseHero.deleteMany();
  await prisma.post.deleteMany();

  await prisma.showcaseHero.createMany({
    data: [
      {
        locale: "en",
        title: "Forest Management Web App",
        description: "Role-based dashboards for admins, partners, and investors to collaborate on forest projects.",
      },
      {
        locale: "vi",
        title: "Hệ thống quản lý rừng",
        description: "Bảng điều khiển cho quản trị, đối tác và nhà đầu tư hợp tác trên dự án trồng rừng.",
      },
    ],
  });
  await prisma.post.createMany({
    data: [
      // English posts
      {
        title: "Project spotlight",
        body: buildBodyEn("See how partners and investors are accelerating reforestation across Northern Vietnam."),
        imageUrl: "https://images.unsplash.com/photo-1523978591478-c753949ff840?auto=format&fit=crop&w=1200&q=80",
        locale: "en",
      },
      {
        title: "Monitoring via satellites",
        body: buildBodyEn("Remote sensing plus on-the-ground logs keep progress transparent for every stakeholder."),
        imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        locale: "en",
      },
      {
        title: "Community impact first",
        body: buildBodyEn("Training and fair-pay programs help local farmers thrive alongside new forests."),
        imageUrl: "https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=1200&q=80",
        locale: "en",
      },
      {
        title: "Mangrove recovery",
        body: buildBodyEn("Weekly salinity readings and photo logs track the health of restored mangroves."),
        imageUrl: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
        locale: "en",
      },
      {
        title: "New partner onboarding",
        body: buildBodyEn("Field teams in Nghe An completed 50% of community workshops for soil care."),
        imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        locale: "en",
      },
      {
        title: "Drone monitoring",
        body: buildBodyEn("Weekly drone imagery highlights canopy growth and soil moisture."),
        imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        locale: "en",
      },
      {
        title: "Farmer workshops",
        body: buildBodyEn("Half of local households joined training on seedling care and organic fertilization."),
        imageUrl: "https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=1200&q=80",
        locale: "en",
      },
      {
        title: "ESG reporting",
        body: buildBodyEn("Environmental and social indicators are being compiled for investors."),
        imageUrl: "https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=1200&q=80",
        locale: "en",
      },
      {
        title: "Value-chain planning",
        body: buildBodyEn("Roadmap for timber, resin, and bamboo product sales by region."),
        imageUrl: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
        locale: "en",
      },
      {
        title: "Fresh satellite imagery",
        body: buildBodyEn("This month’s satellite pass shows an 8% canopy density increase."),
        imageUrl: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
        locale: "en",
      },
      {
        title: "Soil health baseline",
        body: buildBodyEn("Baseline soil carbon samples collected across five plots to track improvement."),
        imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        locale: "en",
      },
      {
        title: "Nursery expansion",
        body: buildBodyEn("A second nursery line is producing 2,000 seedlings per week to meet planting goals."),
        imageUrl: "https://images.unsplash.com/photo-1523978591478-c753949ff840?auto=format&fit=crop&w=1200&q=80",
        locale: "en",
      },
      {
        title: "Biodiversity notes",
        body: buildBodyEn("Camera traps captured returning bird species around the restored mangroves."),
        imageUrl: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
        locale: "en",
      },
      {
        title: "Logistics check",
        body: buildBodyEn("Road access cleared for the rainy season to keep sapling transport on schedule."),
        imageUrl: "https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=1200&q=80",
        locale: "en",
      },
      {
        title: "Community Q&A",
        body: buildBodyEn("Monthly forum answered common questions about harvest timelines and revenue sharing."),
        imageUrl: "https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=1200&q=80",
        locale: "en",
      },

      // Vietnamese posts
      {
        title: "Tiêu điểm dự án",
        body: buildBodyVi("Đối tác và nhà đầu tư đang đẩy nhanh tiến độ trồng rừng tại miền Bắc."),
        imageUrl: "https://images.unsplash.com/photo-1523978591478-c753949ff840?auto=format&fit=crop&w=1200&q=80",
        locale: "vi",
      },
      {
        title: "Giám sát vệ tinh",
        body: buildBodyVi("Kết hợp ảnh vệ tinh và nhật ký hiện trường để minh bạch tiến độ."),
        imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        locale: "vi",
      },
      {
        title: "Tác động cộng đồng",
        body: buildBodyVi("Các khóa tập huấn và chương trình thu nhập công bằng giúp nông hộ phát triển."),
        imageUrl: "https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=1200&q=80",
        locale: "vi",
      },
      {
        title: "Phục hồi rừng ngập mặn",
        body: buildBodyVi("Ghi nhận độ mặn và ảnh hiện trường hàng tuần để theo dõi sức khỏe rừng."),
        imageUrl: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
        locale: "vi",
      },
      {
        title: "Theo dõi rừng bằng drone",
        body: buildBodyVi("Ảnh flycam giúp giám sát tốc độ sinh trưởng theo từng tuần."),
        imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        locale: "vi",
      },
      {
        title: "Hội thảo nông hộ",
        body: buildBodyVi("50% hộ dân đã tham gia tập huấn kỹ thuật ươm giống và bón phân hữu cơ."),
        imageUrl: "https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=1200&q=80",
        locale: "vi",
      },
      {
        title: "Báo cáo ESG",
        body: buildBodyVi("Các chỉ số môi trường và xã hội đang được tổng hợp cho nhà đầu tư."),
        imageUrl: "https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=1200&q=80",
        locale: "vi",
      },
      {
        title: "Kết nối chuỗi giá trị",
        body: buildBodyVi("Lập kế hoạch bán gỗ, nhựa thông và sản phẩm tre theo vùng."),
        imageUrl: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
        locale: "vi",
      },
      {
        title: "Thử nghiệm giống mới",
        body: buildBodyVi("Ba giống keo lai được trồng thử tại Quảng Ngãi để đánh giá sinh trưởng."),
        imageUrl: "https://images.unsplash.com/photo-1523978591478-c753949ff840?auto=format&fit=crop&w=1200&q=80",
        locale: "vi",
      },
      {
        title: "Bảo vệ rừng cộng đồng",
        body: buildBodyVi("Tổ chức tuần tra định kỳ và ghi nhận hiện trạng bằng ứng dụng di động."),
        imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        locale: "vi",
      },
      {
        title: "Đo mẫu đất",
        body: buildBodyVi("Lấy mẫu carbon đất tại 5 ô thí nghiệm để theo dõi mức cải thiện theo thời gian."),
        imageUrl: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
        locale: "vi",
      },
      {
        title: "Mở rộng vườn ươm",
        body: buildBodyVi("Dây chuyền ươm thứ hai đang cung cấp 2.000 cây giống mỗi tuần."),
        imageUrl: "https://images.unsplash.com/photo-1523978591478-c753949ff840?auto=format&fit=crop&w=1200&q=80",
        locale: "vi",
      },
      {
        title: "Đa dạng sinh học",
        body: buildBodyVi("Bẫy ảnh ghi nhận chim quay lại khu rừng ngập mặn vừa phục hồi."),
        imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        locale: "vi",
      },
      {
        title: "Kiểm tra hậu cần",
        body: buildBodyVi("Đã dọn đường vận chuyển cây giống trước mùa mưa để đảm bảo tiến độ trồng."),
        imageUrl: "https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=1200&q=80",
        locale: "vi",
      },
      {
        title: "Gặp gỡ cộng đồng",
        body: buildBodyVi("Phiên hỏi đáp hằng tháng giải đáp thắc mắc về thời gian thu hoạch và chia sẻ lợi nhuận."),
        imageUrl: "https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=1200&q=80",
        locale: "vi",
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
