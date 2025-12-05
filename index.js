import { LinearClient } from '@linear/sdk';
import { marked } from 'marked';
import fs from 'fs/promises';
import chalk from 'chalk';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

class MarkdownToLinear {
  constructor(apiKey, teamId) {
    this.client = new LinearClient({ apiKey });
    this.teamId = teamId;
    this.createdIssues = new Map();
  }

  async parseMarkdown(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const projects = [];
    let currentProject = null;
    let currentTask = null;
    let currentSubtask = null;
    let currentSection = null; // tracks current section: description, summary, acceptanceCriteria, dependencies, subtasks
    
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // # Project level - use H1 as the actual project name
      if (line.startsWith('# ')) {
        if (currentProject) {
          projects.push(currentProject);
        }
        currentProject = {
          title: line.substring(2).trim(), // "Tasks" becomes the project name
          description: '',
          tasks: []
        };
        currentTask = null;
        currentSubtask = null;
        currentSection = null;
      }
      // ## Task level
      else if (line.startsWith('## Task ') && currentProject) {
        currentTask = {
          title: line.substring(3).trim(),
          subtasks: []
        };
        currentProject.tasks.push(currentTask);
        currentSubtask = null;
        currentSection = null;
      }
      // ### Subtasks section only
      else if (line.startsWith('### ') && currentTask) {
        const sectionTitle = line.substring(4).trim().toLowerCase();
        currentSubtask = null;
        
        if (sectionTitle === 'subtasks') {
          currentSection = 'subtasks';
        } else {
          currentSection = null;
        }
      }
      // #### Level - only handle Subtasks
      else if (line.startsWith('#### ') && currentTask) {
        const sectionTitle = line.substring(5).trim().toLowerCase();
        
        // Check if this is a subtask
        if (sectionTitle.startsWith('subtask ') && currentSection === 'subtasks') {
          currentSubtask = {
            title: line.substring(5).trim(), // Keep full title including "Subtask X.X:"
            description: ''
          };
          currentTask.subtasks.push(currentSubtask);
        }
        // Ignore all other #### sections (Summary, Acceptance Criteria, Dependencies)
      }
      // **Description** within subtasks
      else if (line.startsWith('**Description**') && currentSubtask) {
        // Skip the description header, content will be added in subsequent lines
        continue;
      }
      // Content lines
      else if (trimmedLine && currentProject) {
        // Skip description headers in subtasks
        if (line.startsWith('**Description**')) {
          continue;
        }
        
        // Only add content to subtask descriptions
        if (currentSubtask && currentSection === 'subtasks') {
          // Add to current subtask description (only if we're in a subtask)
          currentSubtask.description += line + '\n';
        } else if (!currentTask && currentProject) {
          // Add to project description
          currentProject.description += line + '\n';
        }
        // Ignore all other content (Summary, Acceptance Criteria, Dependencies content)
      }
    }
    
    if (currentProject) {
      projects.push(currentProject);
    }
    
    return projects;
  }

  async createProject(title, description) {
    try {
      const project = await this.client.createProject({
        teamIds: [this.teamId],
        name: title,
        description: description.trim() || undefined
      });
      return project.project;
    } catch (error) {
      console.error(chalk.red(`Error creating project "${title}":`, error.message));
      throw error;
    }
  }

  async createIssue(title, description, parentId = null, projectId = null) {
    try {
      const issueData = {
        teamId: this.teamId,
        title: title,
        description: description.trim()
      };
      
      if (parentId) {
        issueData.parentId = parentId;
      }
      
      if (projectId) {
        issueData.projectId = projectId;
      }
      
      const issue = await this.client.createIssue(issueData);
      return issue.issue;
    } catch (error) {
      console.error(chalk.red(`Error creating issue "${title}":`, error.message));
      throw error;
    }
  }

  async convertToLinear(projects) {
    console.log(chalk.blue('\n🚀 Starting conversion to Linear...\n'));
    
    for (const project of projects) {
      console.log(chalk.yellow(`Creating project: ${project.title}`));
      
      // Create actual Linear Project
      const linearProject = await this.createProject(
        project.title, 
        project.description
      );
      
      console.log(chalk.green(`✓ Created Project: ${linearProject.name}`));
      console.log(chalk.gray(`  URL: ${linearProject.url}`));
      
      // Create tasks as issues within the project
      for (const task of project.tasks) {
        console.log(chalk.cyan(`  Creating task: ${task.title}`));
        
        // Create simple task description
        let taskDescription = '';
        
        // Add subtask summary
        if (task.subtasks.length > 0) {
          taskDescription += `This task has ${task.subtasks.length} subtasks that will be created as child issues.`;
        }
        
        const parentIssue = await this.createIssue(
          task.title,
          taskDescription || 'No description provided',
          null,  // no parent issue
          linearProject.id  // assign to project
        );
        
        console.log(chalk.green(`  ✓ Created Task: ${parentIssue.identifier} - ${parentIssue.title}`));
        
        // Create subtasks as sub-issues
        for (const subtask of task.subtasks) {
          console.log(chalk.magenta(`    Creating subtask: ${subtask.title}`));
          console.log(chalk.gray(`    Description length: ${subtask.description.length} chars`));
          
          const subIssue = await this.createIssue(
            subtask.title,
            subtask.description.trim() || 'No description provided',
            parentIssue.id,  // parent issue
            linearProject.id  // assign to same project
          );
          
          console.log(chalk.green(`    ✓ Created Subtask: ${subIssue.identifier} - ${subIssue.title}`));
        }
      }
      
      console.log('');
    }
    
    console.log(chalk.bold.green('\n✅ All projects, tasks, and subtasks created successfully!\n'));
  }

  async run(markdownPath) {
    try {
      console.log(chalk.bold.blue('📄 Markdown to Linear Converter\n'));
      console.log(chalk.gray(`Reading from: ${markdownPath}`));
      
      const projects = await this.parseMarkdown(markdownPath);
      
      console.log(chalk.gray(`Found ${projects.length} projects`));
      const totalTasks = projects.reduce((sum, proj) => sum + proj.tasks.length, 0);
      const totalSubtasks = projects.reduce((sum, proj) => 
        sum + proj.tasks.reduce((taskSum, task) => taskSum + task.subtasks.length, 0), 0
      );
      console.log(chalk.gray(`Found ${totalTasks} tasks with enhanced structure`));
      console.log(chalk.gray(`Found ${totalSubtasks} subtasks`));
      
      // Show structure summary
      projects.forEach((project, idx) => {
        console.log(chalk.gray(`  Project ${idx + 1}: ${project.title} (${project.tasks.length} tasks)`));
        project.tasks.forEach((task, taskIdx) => {
          const sections = [];
          if (task.summary) sections.push('summary');
          if (task.description) sections.push('description');
          if (task.acceptanceCriteria) sections.push('acceptance criteria');
          if (task.dependencies) sections.push('dependencies');
          if (task.subtasks.length > 0) sections.push(`${task.subtasks.length} subtasks`);
          
          console.log(chalk.gray(`    Task ${taskIdx + 1}: ${task.title} (${sections.join(', ')})`));
        });
      });
      
      await this.convertToLinear(projects);
    } catch (error) {
      console.error(chalk.red('Error:', error.message));
      process.exit(1);
    }
  }
}

async function main() {
  const apiKey = process.env.LINEAR_API_KEY;
  const teamId = process.env.LINEAR_TEAM_ID;
  const markdownPath = process.argv[2];

  if (!apiKey || !teamId) {
    console.error(chalk.red('Error: LINEAR_API_KEY and LINEAR_TEAM_ID must be set in .env file'));
    console.log(chalk.yellow('\nCreate a .env file with:'));
    console.log('LINEAR_API_KEY=your_api_key_here');
    console.log('LINEAR_TEAM_ID=your_team_id_here\n');
    process.exit(1);
  }

  if (!markdownPath) {
    console.error(chalk.red('Error: Please provide a markdown file path'));
    console.log(chalk.yellow('\nUsage: npm start <path-to-markdown-file>\n'));
    process.exit(1);
  }

  const converter = new MarkdownToLinear(apiKey, teamId);
  await converter.run(markdownPath);
}

main().catch(console.error);