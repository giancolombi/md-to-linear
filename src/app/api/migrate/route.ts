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
    
    const results: Array<{
      type: string;
      title: string;
      id: string;
      url: string;
      tasks: Array<{
        title: string;
        identifier: string;
        url: string;
        subtasks: Array<{ title: string; identifier: string; url: string }>;
      }>;
    }> = [];
    const errors: Array<{ level: string; task: string; error: string }> = [];
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
        
        if (!projectResult.success) {
          console.error('Project creation failed:', projectResult);
          throw new Error('Failed to create project');
        }
        
        // Get the created project
        const createdProject = await projectResult.project;
        if (!createdProject) {
          throw new Error('Failed to get created project');
        }
        
        console.log('Created project with ID:', createdProject.id);
        
        const projectData = {
          type: 'project',
          title: project.title,
          id: createdProject.id,
          url: createdProject.url,
          tasks: [] as Array<{
            title: string;
            identifier: string;
            url: string;
            subtasks: Array<{ title: string; identifier: string; url: string }>;
          }>
        };
        
        // Small delay to ensure project is fully created
        await new Promise(resolve => setTimeout(resolve, 500));
        
        for (const task of project.tasks) {
          totalTasks++;
          try {
            console.log('Creating task:', task.title, 'in project:', createdProject.id);
            const parentIssueResult = await client.createIssue({
              teamId,
              projectId: createdProject.id,
              title: task.title,
              description: task.description || undefined,
            });
            
            if (!parentIssueResult.success) {
              console.error('Issue creation failed:', parentIssueResult);
              throw new Error(`Failed to create issue ${task.title}`);
            }
            
            const parentIssue = await parentIssueResult.issue;
            if (!parentIssue) {
              throw new Error('Failed to get created issue');
            }
            
            console.log('Created task with ID:', parentIssue.id);
            
            const taskResult = {
              title: task.title,
              identifier: parentIssue.identifier,
              url: parentIssue.url,
              subtasks: [] as Array<{ title: string; identifier: string; url: string }>
            };
            
            for (const subtask of task.subtasks) {
              totalSubtasks++;
              try {
                console.log('Creating subtask:', subtask.title, 'with parent:', parentIssue.id);
                const subIssueResult = await client.createIssue({
                  teamId,
                  projectId: createdProject.id,
                  title: subtask.title,
                  description: subtask.description || undefined,
                  parentId: parentIssue.id
                });
                
                if (!subIssueResult.success) {
                  console.error('Sub-issue creation failed:', subIssueResult);
                  throw new Error(`Failed to create sub-issue ${subtask.title}`);
                }
                
                const subIssue = await subIssueResult.issue;
                if (!subIssue) {
                  throw new Error('Failed to get created sub-issue');
                }
                
                console.log('Created subtask with ID:', subIssue.id);
                
                taskResult.subtasks.push({
                  title: subtask.title,
                  identifier: subIssue.identifier,
                  url: subIssue.url
                });
              } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                errors.push({
                  level: 'subtask',
                  task: subtask.title,
                  error: errorMessage
                });
              }
            }
            
            projectData.tasks.push(taskResult);
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            errors.push({
              level: 'task',
              task: task.title,
              error: errorMessage
            });
          }
        }
        
        results.push(projectData);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push({
          level: 'project',
          task: project.title,
          error: errorMessage
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
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
