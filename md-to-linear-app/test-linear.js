import { LinearClient } from '@linear/sdk';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = new LinearClient({
  apiKey: process.env.NEXT_PUBLIC_LINEAR_API_KEY
});

async function test() {
  try {
    // Test creating a project
    const projectData = await client.createProject({
      teamIds: [process.env.NEXT_PUBLIC_LINEAR_TEAM_ID],
      name: 'Test Project from API',
      description: 'Testing the API'
    });
    
    console.log('Project response:', projectData);
    console.log('Project _project:', projectData._project);
    console.log('Success:', projectData.success);
    
    // Try to get the actual project
    if (projectData._project) {
      console.log('Project ID from _project:', projectData._project.id);
      
      // Try to fetch the full project
      const project = await client.project(projectData._project.id);
      console.log('Fetched project:', project);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

test();