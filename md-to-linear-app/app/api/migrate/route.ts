import { NextRequest, NextResponse } from 'next/server';
import { LinearClient } from '@linear/sdk';
import { parseMarkdown } from '@/lib/markdown-parser';

export async function POST(request: NextRequest) {
  try {
    const { markdown, apiKey, teamId } = await request.json();
    
    if (!markdown || !apiKey || !teamId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const client = new LinearClient({ apiKey });
    const projects = parseMarkdown(markdown);
    
    console.log('Parsed projects:', JSON.stringify(projects, null, 2));
    
    const results = [];
    const errors = [];
    let totalTasks = 0;
    let totalSubtasks = 0;
    
    for (const project of projects) {
      try {
        console.log('Creating project:', project.title);
        const projectResult = await client.createProject({
          teamIds: [teamId],
          name: project.title,
          description: project.description || undefined,
        });
        
        // The SDK returns _project with just the ID
        if (!projectResult.success || !projectResult._project) {
          console.error('Project creation failed:', projectResult);
          throw new Error('Failed to create project');
        }
        
        const projectId = (projectResult as any)._project.id;
        console.log('Created project with ID:', projectId);
        
        // Fetch the full project details to get the URL
        const fullProject = await client.project(projectId);
        
        const projectData = {
          type: 'project',
          title: project.title,
          id: projectId,
          url: fullProject.url,
          tasks: [] as any[]
        };
        
        // Small delay to ensure project is fully created
        await new Promise(resolve => setTimeout(resolve, 500));
        
        for (const task of project.tasks) {
          totalTasks++;
          try {
            console.log('Creating task:', task.title, 'in project:', projectId);
            const parentIssueResult = await client.createIssue({
              teamId,
              projectId: projectId,
              title: task.title,
              description: task.description || undefined,
            });
            
            // The SDK returns _issue with just the ID
            if (!parentIssueResult.success || !(parentIssueResult as any)._issue) {
              console.error('Issue creation failed:', parentIssueResult);
              throw new Error(`Failed to create issue ${task.title}`);
            }
            
            const parentIssueId = (parentIssueResult as any)._issue.id;
            console.log('Created task with ID:', parentIssueId);
            
            // Fetch the full issue details
            const parentIssue = await client.issue(parentIssueId);
            
            const taskResult = {
              title: task.title,
              identifier: parentIssue.identifier,
              url: parentIssue.url,
              subtasks: [] as any[]
            };
            
            for (const subtask of task.subtasks) {
              totalSubtasks++;
              try {
                console.log('Creating subtask:', subtask.title, 'with parent:', parentIssueId);
                const subIssueResult = await client.createIssue({
                  teamId,
                  projectId: projectId,
                  title: subtask.title,
                  description: subtask.description || undefined,
                  parentId: parentIssueId
                });
                
                if (!subIssueResult.success || !(subIssueResult as any)._issue) {
                  console.error('Sub-issue creation failed:', subIssueResult);
                  throw new Error(`Failed to create sub-issue ${subtask.title}`);
                }
                
                const subIssueId = (subIssueResult as any)._issue.id;
                console.log('Created subtask with ID:', subIssueId);
                
                // Fetch the full sub-issue details
                const subIssue = await client.issue(subIssueId);
                
                taskResult.subtasks.push({
                  title: subtask.title,
                  identifier: subIssue.identifier,
                  url: subIssue.url
                });
              } catch (error: any) {
                errors.push({
                  level: 'subtask',
                  task: subtask.title,
                  error: error.message
                });
              }
            }
            
            projectData.tasks.push(taskResult);
          } catch (error: any) {
            errors.push({
              level: 'task',
              task: task.title,
              error: error.message
            });
          }
        }
        
        results.push(projectData);
      } catch (error: any) {
        errors.push({
          level: 'project',
          task: project.title,
          error: error.message
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      results,
      errors,
      summary: {
        totalProjects: projects.length,
        totalTasks,
        totalSubtasks,
        createdProjects: results.length,
        failed: errors.length
      }
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}