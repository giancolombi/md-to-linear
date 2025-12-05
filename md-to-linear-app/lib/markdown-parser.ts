export interface Subtask {
  title: string;
  description: string;
}

export interface Task {
  title: string;
  description: string;
  subtasks: Subtask[];
}

export interface Project {
  title: string;
  description: string;
  tasks: Task[];
}

export function parseMarkdown(content: string): Project[] {
  const projects: Project[] = [];
  let currentProject: Project | null = null;
  let currentTask: Task | null = null;
  let currentSubtask: Subtask | null = null;
  let currentSection: string | null = null;
  
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
        title: line.substring(2).trim(),
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
        description: '',
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
          title: line.substring(5).trim(),
          description: ''
        };
        currentTask.subtasks.push(currentSubtask);
      }
      // Ignore all other #### sections (Summary, Acceptance Criteria, Dependencies)
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
  
  return projects.map(project => ({
    ...project,
    description: project.description.trim(),
    tasks: project.tasks.map(task => ({
      ...task,
      description: task.description.trim(),
      subtasks: task.subtasks.map(sub => ({
        ...sub,
        description: sub.description.trim()
      }))
    }))
  }));
}