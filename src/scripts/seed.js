/**
 * Optional demo data for local development.
 *
 *   npm run seed
 *
 * Creates a demo account plus a few developers so the feed, requests and
 * connections screens have something to show.
 *
 * Demo login: demo@devtinder.dev / Demo@1234
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { User } = require("../models/user");
const { connectionRequestModel } = require("../models/connectionrequest");

const PASSWORD = "Demo@1234";

const people = [
  {
    firstName: "Demo",
    lastName: "User",
    emailId: "demo@devtinder.dev",
    age: 24,
    gender: "others",
    about: "Full-stack developer exploring React, Node and everything in between.",
    skills: ["React", "Node.js", "MongoDB", "Tailwind"],
    photoUrl: "https://i.pravatar.cc/300?u=demo-devtinder",
  },
  {
    firstName: "Aarav",
    lastName: "Sharma",
    emailId: "aarav@devtinder.dev",
    age: 26,
    gender: "male",
    about: "Backend engineer. I turn coffee into scalable APIs and occasional bugs.",
    skills: ["Node.js", "Express", "PostgreSQL", "AWS"],
    photoUrl: "https://i.pravatar.cc/300?u=aarav-devtinder",
  },
  {
    firstName: "Meera",
    lastName: "Iyer",
    emailId: "meera@devtinder.dev",
    age: 23,
    gender: "female",
    about: "Frontend developer obsessed with design systems and smooth animations.",
    skills: ["React", "TypeScript", "Figma", "Framer Motion"],
    photoUrl: "https://i.pravatar.cc/300?u=meera-devtinder",
  },
  {
    firstName: "Kabir",
    lastName: "Khan",
    emailId: "kabir@devtinder.dev",
    age: 28,
    gender: "male",
    about: "DevOps by day, indie hacker by night. Kubernetes is my love language.",
    skills: ["Docker", "Kubernetes", "Go", "Terraform"],
    photoUrl: "https://i.pravatar.cc/300?u=kabir-devtinder",
  },
  {
    firstName: "Riya",
    lastName: "Nair",
    emailId: "riya@devtinder.dev",
    age: 25,
    gender: "female",
    about: "Mobile developer building delightful apps with React Native.",
    skills: ["React Native", "Expo", "Firebase", "Redux"],
    photoUrl: "https://i.pravatar.cc/300?u=riya-devtinder",
  },
  {
    firstName: "Dev",
    lastName: "Patel",
    emailId: "dev@devtinder.dev",
    age: 22,
    gender: "male",
    about: "CS student, open-source contributor and competitive programmer.",
    skills: ["C++", "Python", "DSA", "Git"],
    photoUrl: "https://i.pravatar.cc/300?u=dev-devtinder",
  },
];

const run = async () => {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    console.error("DATABASE_URL is missing. Add it to src/.env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  const password = await bcrypt.hash(PASSWORD, 10);

  const saved = {};
  for (const person of people) {
    const user = await User.findOneAndUpdate(
      { emailId: person.emailId },
      { ...person, password },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    saved[person.firstName] = user;
  }

  await connectionRequestModel.deleteMany({
    fromUserid: { $in: Object.values(saved).map((user) => user._id) },
  });

  await connectionRequestModel.create([
    {
      fromUserid: saved.Aarav._id,
      toUserid: saved.Demo._id,
      status: "interested",
    },
    {
      fromUserid: saved.Meera._id,
      toUserid: saved.Demo._id,
      status: "accepted",
    },
    {
      fromUserid: saved.Demo._id,
      toUserid: saved.Kabir._id,
      status: "interested",
    },
  ]);

  console.log("Seeded demo data.");
  console.log(`Login with: demo@devtinder.dev / ${PASSWORD}`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Seed failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
