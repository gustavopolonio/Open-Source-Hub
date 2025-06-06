import { PrismaClient } from "generated/prisma";

const prisma = new PrismaClient();

const skills = [
  "html",
  "css",
  "javascript",
  "typescript",
  "react",
  "next.js",
  "vue.js",
  "svelte",
  "solidjs",
  "tailwind css",
  "bootstrap",
  "git",
  "github",
  "docker",
  "kubernetes",
  "graphql",
  "node.js",
  "express.js",
  "fastapi",
  "flask",
  "django",
  "c",
  "c++",
  "go",
  "rust",
  "python",
  "java",
  "kotlin",
  "php",
  "ruby",
  "dart",
  "firebase",
  "postgresql",
  "mysql",
  "mongodb",
  "redis",
  "aws",
  "gcp",
  "azure",
  "jest",
  "cypress",
];

const tags = [
  "beginner-friendly",
  "javascript",
  "typescript",
  "html",
  "css",
  "react",
  "vue",
  "next.js",
  "node.js",
  "python",
  "go",
  "rust",
  "c++",
  "c",
  "java",
  "php",
  "swift",
  "angular",
  "tailwind",
  "docker",
  "graphql",
  "mongodb",
  "postgresql",
  "firebase",
  "aws",
  "gcp",
  "azure",
  "jest",
  "cypress",
  "redis",
];

async function main() {
  // Seed skills
  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill },
      update: {},
      create: { name: skill },
    });
  }

  // Seed tags
  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { name: tag },
      update: {},
      create: { name: tag },
    });
  }

  console.log("Skills seeded!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
