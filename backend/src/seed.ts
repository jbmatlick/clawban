/**
 * Seed database with example tasks
 */

import * as taskService from './services/task.service.js';

const EXAMPLE_TASKS = [
  {
    title: 'Build authentication system',
    description: `Implement JWT-based authentication with the following features:

- User registration and login
- Password hashing with bcrypt
- JWT token generation and validation
- Refresh token mechanism
- Protected route middleware
- Email verification

**Tech stack**: Express, JWT, bcrypt, nodemailer`,
    model_strategy: 'opus-coding' as const,
    estimated_token_cost: 75000,
    estimated_dollar_cost: 2.25,
  },
  {
    title: 'Design database schema',
    description: `Create comprehensive database schema for the application:

**Tables needed**:
- Users (id, email, password_hash, verified, created_at)
- Tasks (id, user_id, title, description, status, created_at)
- Sessions (id, user_id, token, expires_at)

Use PostgreSQL with proper indexes and foreign keys.`,
    model_strategy: 'opus-planning' as const,
    estimated_token_cost: 30000,
    estimated_dollar_cost: 0.9,
  },
  {
    title: 'Implement drag-and-drop UI',
    description: `Create smooth drag-and-drop experience for Kanban board:

- Use react-beautiful-dnd
- Smooth animations
- Visual feedback during drag
- Persist state after drop
- Handle edge cases (invalid drops)
- Mobile touch support

Match the design system from chatb2b-web.`,
    model_strategy: 'sonnet-coding' as const,
    estimated_token_cost: 45000,
    estimated_dollar_cost: 0.9,
  },
];

async function seed() {
  console.log('🌱 Seeding database with example tasks...\n');

  for (const taskData of EXAMPLE_TASKS) {
    const task = await taskService.createTask(taskData);
    console.log(`✅ Created: ${task.title} (${task.id})`);
  }

  console.log('\n✨ Seeding complete!');
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
