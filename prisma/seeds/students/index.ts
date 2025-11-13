// Import individual functions to use in seedAllStudents
import { seedStudentsINF205 } from './students-INF205';
import { seedStudentsINF206 } from './students-INF206';
import { seedStudentsInfoek202 } from './students-Infoek202';
import { seedStudentsMSH1IE } from './students-MSH1IE';
import { seedStudentsMSH1INFA } from './students-MSH1INFA';
import { seedStudentsMSH1INFB } from './students-MSH1INFB';
import { seedStudentsMSH1TI } from './students-MSH1TI';
import { seedStudentsMSH2INF } from './students-MSH2INF';
import { seedStudentsMSH2TI } from './students-MSH2TI';

// Master function to seed all students
export async function seedAllStudents() {
  console.log("👥 Seeding all students...");
  
  // Seed students for each class
  await seedStudentsINF205();
  await seedStudentsINF206();
  await seedStudentsInfoek202();
  await seedStudentsMSH1IE();
  await seedStudentsMSH1INFA();
  await seedStudentsMSH1INFB();
  await seedStudentsMSH1TI();
  await seedStudentsMSH2INF();
  await seedStudentsMSH2TI();
  
  console.log("✅ All students seeded successfully!");
}