import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultTags = [
  {
    name: 'Question',
    description: 'General questions about programming, technology, or platform usage',
    color: '#3B82F6' // Blue
  },
  {
    name: 'Tutorial',
    description: 'Step-by-step guides and educational content',
    color: '#10B981' // Green
  },
  {
    name: 'Bug Report',
    description: 'Reports of bugs, issues, or problems',
    color: '#EF4444' // Red
  },
  {
    name: 'Feature Request',
    description: 'Suggestions for new features or improvements',
    color: '#F59E0B' // Amber
  },
  {
    name: 'Discussion',
    description: 'Open discussions and conversations',
    color: '#8B5CF6' // Violet
  },
  {
    name: 'Showcase',
    description: 'Showcasing projects, work, or achievements',
    color: '#EC4899' // Pink
  },
  {
    name: 'Help Wanted',
    description: 'Looking for help or assistance',
    color: '#06B6D4' // Cyan
  },
  {
    name: 'Announcement',
    description: 'Important announcements and updates',
    color: '#84CC16' // Lime
  },
  {
    name: 'Review',
    description: 'Reviews of tools, libraries, or services',
    color: '#F97316' // Orange
  },
  {
    name: 'Best Practice',
    description: 'Best practices and recommendations',
    color: '#6366F1' // Indigo
  }
];

async function seedTags() {
  try {
    console.log('🌱 Seeding tags...');
    
    for (const tag of defaultTags) {
      await prisma.tag.upsert({
        where: { name: tag.name },
        update: {
          description: tag.description,
          color: tag.color
        },
        create: {
          name: tag.name,
          description: tag.description,
          color: tag.color
        }
      });
      console.log(`✅ Created/updated tag: ${tag.name}`);
    }
    
    console.log('🎉 Tags seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding tags:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTags(); 