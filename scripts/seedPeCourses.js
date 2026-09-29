import mongoose from 'mongoose';
import { PeCourse } from '../server/models/peCourse.model.js';
import { DB_NAME } from '../server/constants.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    // Same database the app uses (see server/db/index.js)
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const peCourses = [
  // Batch 2022 - AI/ML Branch - PE4
  {
    courseCode: 'AI347',
    courseName: 'Introduction to Distributed System + Lab',
    branch: 'artificial intelligence and machine learning',
    batch: 2022,
    type: 'pe4',
    students: []
  },
  {
    courseCode: 'IT445',
    courseName: 'Internet of Things + Lab',
    branch: 'artificial intelligence and machine learning',
    batch: 2022,
    type: 'pe4',
    students: []
  },
  {
    courseCode: 'AI425',
    courseName: 'Computer Vision + Lab',
    branch: 'artificial intelligence and machine learning',
    batch: 2022,
    type: 'pe4',
    students: []
  },
  {
    courseCode: 'IT451',
    courseName: 'Cloud Computing + Lab',
    branch: 'artificial intelligence and machine learning',
    batch: 2022,
    type: 'pe4',
    students: []
  },

  // Batch 2022 - AI/ML Branch - PE5
  {
    courseCode: 'IT351',
    courseName: 'Natural Language Processing',
    branch: 'artificial intelligence and machine learning',
    batch: 2022,
    type: 'pe5',
    students: []
  },
  {
    courseCode: 'AI429',
    courseName: 'Speech Processing',
    branch: 'artificial intelligence and machine learning',
    batch: 2022,
    type: 'pe5',
    students: []
  },
  {
    courseCode: 'IT349',
    courseName: 'Cryptography & Network Security',
    branch: 'artificial intelligence and machine learning',
    batch: 2022,
    type: 'pe5',
    students: []
  },

  // Batch 2022 - CSE Branch - PE4
  {
    courseCode: 'CS431',
    courseName: 'Computer Graphics + Lab',
    branch: 'computer science and engineering',
    batch: 2022,
    type: 'pe4',
    students: []
  },
  {
    courseCode: 'CS435',
    courseName: 'Frontend Design + Lab',
    branch: 'computer science and engineering',
    batch: 2022,
    type: 'pe4',
    students: []
  },
  {
    courseCode: 'CS437',
    courseName: 'Deep Learning + Lab',
    branch: 'computer science and engineering',
    batch: 2022,
    type: 'pe4',
    students: []
  },

  // Batch 2022 - CSE Branch - PE5
  {
    courseCode: 'IT445',
    courseName: 'Internet of Things (IoT) + Lab',
    branch: 'computer science and engineering',
    batch: 2022,
    type: 'pe5',
    students: []
  },
  {
    courseCode: 'IT331',
    courseName: 'Image Processing + Lab',
    branch: 'computer science and engineering',
    batch: 2022,
    type: 'pe5',
    students: []
  },
  {
    courseCode: 'IT347',
    courseName: 'Cloud Computing + Lab',
    branch: 'computer science and engineering',
    batch: 2022,
    type: 'pe5',
    students: []
  },

  // Batch 2023 - AI/ML Branch - PE3
  {
    courseCode: 'AI315',
    courseName: 'Advanced Algorithms',
    branch: 'artificial intelligence and machine learning',
    batch: 2023,
    type: 'pe3',
    students: []
  },
  {
    courseCode: 'AI317',
    courseName: 'Information Retreival',
    branch: 'artificial intelligence and machine learning',
    batch: 2023,
    type: 'pe3',
    students: []
  },
  {
    courseCode: 'AI319',
    courseName: 'Introduction to Compiler Design',
    branch: 'artificial intelligence and machine learning',
    batch: 2023,
    type: 'pe3',
    students: []
  },
  {
    courseCode: 'AI321',
    courseName: 'Data Minning',
    branch: 'artificial intelligence and machine learning',
    batch: 2023,
    type: 'pe3',
    students: []
  },

  // Batch 2023 - AI/ML Branch - PE4
  {
    courseCode: 'AI347',
    courseName: 'Introduction to Distributed System + Lab',
    branch: 'artificial intelligence and machine learning',
    batch: 2023,
    type: 'pe4',
    students: []
  },
  {
    courseCode: 'IT445',
    courseName: 'Internet of Things + Lab',
    branch: 'artificial intelligence and machine learning',
    batch: 2023,
    type: 'pe4',
    students: []
  },
  {
    courseCode: 'AI425',
    courseName: 'Computer Vision + Lab',
    branch: 'artificial intelligence and machine learning',
    batch: 2023,
    type: 'pe4',
    students: []
  },
  {
    courseCode: 'IT451',
    courseName: 'Cloud Computing + Lab',
    branch: 'artificial intelligence and machine learning',
    batch: 2023,
    type: 'pe4',
    students: []
  },

  // Batch 2023 - AI/ML Branch - PE5
  {
    courseCode: 'IT351',
    courseName: 'Natural Language Processing',
    branch: 'artificial intelligence and machine learning',
    batch: 2023,
    type: 'pe5',
    students: []
  },
  {
    courseCode: 'AI429',
    courseName: 'Speech Processing',
    branch: 'artificial intelligence and machine learning',
    batch: 2023,
    type: 'pe5',
    students: []
  },
  {
    courseCode: 'IT349',
    courseName: 'Cryptography & Network Security',
    branch: 'artificial intelligence and machine learning',
    batch: 2023,
    type: 'pe5',
    students: []
  },

  // Batch 2023 - CSE Branch - PE3
  {
    courseCode: 'IT349',
    courseName: 'Cryptography & Network Security',
    branch: 'computer science and engineering',
    batch: 2023,
    type: 'pe3',
    students: []
  },
  {
    courseCode: 'IT354',
    courseName: 'Wireless Sensor Networks',
    branch: 'computer science and engineering',
    batch: 2023,
    type: 'pe3',
    students: []
  },
  {
    courseCode: 'IT353',
    courseName: 'Block Chain Technology',
    branch: 'computer science and engineering',
    batch: 2023,
    type: 'pe3',
    students: []
  },
  {
    courseCode: 'CS351',
    courseName: 'Nature Inspired Computing',
    branch: 'computer science and engineering',
    batch: 2023,
    type: 'pe3',
    students: []
  },

  // Batch 2023 - CSE Branch - PE4
  {
    courseCode: 'CS431',
    courseName: 'Computer Graphics + Lab',
    branch: 'computer science and engineering',
    batch: 2023,
    type: 'pe4',
    students: []
  },
  {
    courseCode: 'CS435',
    courseName: 'Frontend Design + Lab',
    branch: 'computer science and engineering',
    batch: 2023,
    type: 'pe4',
    students: []
  },
  {
    courseCode: 'CS437',
    courseName: 'Deep Learning + Lab',
    branch: 'computer science and engineering',
    batch: 2023,
    type: 'pe4',
    students: []
  },

  // Batch 2023 - CSE Branch - PE5
  {
    courseCode: 'IT445',
    courseName: 'Internet of Things (IoT) + Lab',
    branch: 'computer science and engineering',
    batch: 2023,
    type: 'pe5',
    students: []
  },
  {
    courseCode: 'IT331',
    courseName: 'Image Processing + Lab',
    branch: 'computer science and engineering',
    batch: 2023,
    type: 'pe5',
    students: []
  },
  {
    courseCode: 'IT347',
    courseName: 'Cloud Computing + Lab',
    branch: 'computer science and engineering',
    batch: 2023,
    type: 'pe5',
    students: []
  },
];

const seedPeCourses = async () => {
  try {
    await connectDB();
    // Clear existing PE courses
    console.log('Clearing existing PE courses...');
    await PeCourse.deleteMany({});

    // Insert new PE courses
    console.log('Inserting PE courses...');
    const insertedCourses = await PeCourse.insertMany(peCourses);

    console.log(`✅ Successfully seeded ${insertedCourses.length} PE courses!`);
    console.log('\nBreakdown:');
    
    const batch2022 = insertedCourses.filter(c => c.batch === 2022);
    const batch2023 = insertedCourses.filter(c => c.batch === 2023);
    
    console.log(`  - Batch 2022: ${batch2022.length} courses`);
    console.log(`  - Batch 2023: ${batch2023.length} courses`);
    
    const aiml = insertedCourses.filter(c => c.branch === 'artificial intelligence and machine learning');
    const cse = insertedCourses.filter(c => c.branch === 'computer science and engineering');
    
    console.log(`  - AI/ML Branch: ${aiml.length} courses`);
    console.log(`  - CSE Branch: ${cse.length} courses`);
    
    const pe3 = insertedCourses.filter(c => c.type === 'pe3');
    const pe4 = insertedCourses.filter(c => c.type === 'pe4');
    const pe5 = insertedCourses.filter(c => c.type === 'pe5');
    
    console.log(`  - PE3: ${pe3.length} courses`);
    console.log(`  - PE4: ${pe4.length} courses`);
    console.log(`  - PE5: ${pe5.length} courses`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding PE courses:', error);
    process.exit(1);
  }
};

seedPeCourses();
