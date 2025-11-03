import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seedStudentsINF206() {
  console.log("🌱 Seeding students for INF206...");

  const studentsINF206 = [
    { 
      firstName: "Andrea", 
      lastName: "Abeshi", 
      institutionEmail: "aabeshi@uet.edu.al", 
      father: "Rrapush",
      personalEmail: "andreaabeshi052@gmail.com",
      phone: "0676932774",
      orderId: 1,
      classId: 6 
    },
    { 
      firstName: "Amald", 
      lastName: "Bedini", 
      institutionEmail: "abedini5@uet.edu.al", 
      father: "Edmond",
      personalEmail: "emelldiamaldi@gmail.com, emelldiamaldi@gmail.com",
      phone: "693013753",
      orderId: 2,
      classId: 6 
    },
    { 
      firstName: "Agim", 
      lastName: "Çeka", 
      institutionEmail: "aceka6@uet.edu.al", 
      father: "Shaban",
      personalEmail: "çeka.agim@hotmail.com",
      phone: "0683388788",
      orderId: 3,
      classId: 6 
    },
    { 
      firstName: "Ergis", 
      lastName: "Çollaku", 
      institutionEmail: "ecollaku3@uet.edu.al", 
      father: "Roland",
      personalEmail: "ergiscollaku28@gmail.com",
      phone: "0685672622",
      orderId: 4,
      classId: 6 
    },
    { 
      firstName: "Rei", 
      lastName: "Duçka", 
      institutionEmail: "rducka@uet.edu.al", 
      father: "Sazan",
      personalEmail: "duckareid5@gmail.com",
      phone: "0684809599",
      orderId: 5,
      classId: 6 
    },
    { 
      firstName: "Melisa", 
      lastName: "Gjegja", 
      institutionEmail: "mgjegja@uet.edu.al", 
      father: "Idajet",
      personalEmail: "melisagjegja@icloud.com",
      phone: "0682736988",
      orderId: 6,
      classId: 6 
    },
    { 
      firstName: "Samir", 
      lastName: "Haxhiu", 
      institutionEmail: "shaxhiu3@uet.edu.al", 
      father: "Idajet",
      personalEmail: "realm6874@gmail.com",
      phone: "0697358208",
      orderId: 7,
      classId: 6 
    },
    { 
      firstName: "Kristi", 
      lastName: "Kanani", 
      institutionEmail: "kkanani3@uet.edu.al", 
      father: "Aleksandër",
      personalEmail: "kananikristi6@gmail.com",
      phone: "0693435702",
      orderId: 8,
      classId: 6 
    },
    { 
      firstName: "Jozef", 
      lastName: "Lisi", 
      institutionEmail: "jlisi@uet.edu.al", 
      father: "Fran",
      personalEmail: "jlisi52@gmail.com",
      phone: "0683850146",
      orderId: 9,
      classId: 6 
    },
    { 
      firstName: "Egdar", 
      lastName: "Shaqiri", 
      institutionEmail: "eshaqiri6@uet.edu.al", 
      father: "Elmas",
      personalEmail: "egi.shaqiri99@gmail.com",
      phone: "0697335506",
      orderId: 10,
      classId: 6 
    },
    { 
      firstName: "Florian", 
      lastName: "Shurbi", 
      institutionEmail: "fshurbi@uet.edu.al", 
      father: "Anton",
      personalEmail: "shurbiflorl0@gmail.com",
      phone: "0692755407",
      orderId: 11,
      classId: 6 
    },
    { 
      firstName: "Denis", 
      lastName: "Sokoli", 
      institutionEmail: "dsokoli2@uet.edu.al", 
      father: "Paulin",
      personalEmail: "denissokoli2005@gmail.com",
      phone: "0694883813",
      orderId: 12,
      classId: 6 
    },
  ];

  await prisma.student.createMany({
    data: studentsINF206,
    skipDuplicates: true,
  });

  console.log(`✅ Successfully seeded ${studentsINF206.length} student(s) for INF206!`);
}

seedStudentsINF206()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Error seeding students for INF206:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
