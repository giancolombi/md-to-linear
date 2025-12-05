'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { parseMarkdown, Project } from '@/lib/markdown-parser';
import { Upload, FileText, CheckCircle2, XCircle, Loader2, Rocket, Eye, FolderOpen } from 'lucide-react';

const EXAMPLE_MARKDOWN = `# E-Commerce Platform

## Task 1: User Authentication System

### Description

#### Summary

Implement a complete authentication system for customers and administrators with secure login, registration, and password reset functionality.

#### Acceptance Criteria

- Login page with email/password validation
- User registration with email verification  
- Password reset with secure token validation
- Proper error handling and loading states

#### Dependencies

- Backend API endpoints configured
- Email service integration ready

### Subtasks

#### Subtask 1.1: Implement Login Functionality

**Description**

Create the login page with email/password fields and integrate with the backend API for user authentication. Include proper error handling and loading states.

#### Subtask 1.2: Add User Registration

**Description**

Build the registration flow with form validation, email verification, and secure password requirements. Connect to the user creation API endpoint.

#### Subtask 1.3: Create Password Reset Feature

**Description**

Implement forgot password functionality with email-based reset links and secure token validation.

## Task 2: Shopping Cart Feature

### Description

#### Summary

Build a full-featured shopping cart with persistent storage and seamless checkout experience.

#### Acceptance Criteria

- Add to cart with quantity selection
- Persistent cart storage across sessions
- Multi-step checkout process
- Real-time cart updates

### Subtasks

#### Subtask 2.1: Add to Cart Functionality

**Description**

Implement the ability to add products to cart with quantity selection and real-time updates.

#### Subtask 2.2: Cart Persistence

**Description**

Store cart data in local storage and sync with backend when user logs in.

#### Subtask 2.3: Checkout Process

**Description**

Create multi-step checkout flow with shipping and payment information collection.`;

export default function MarkdownConverter() {
  const [markdown, setMarkdown] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [teamId, setTeamId] = useState('');
  const [preview, setPreview] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [errors, setErrors] = useState<any[]>([]);

  const handlePreview = () => {
    const projects = parseMarkdown(markdown);
    setPreview(projects);
  };

  const handleMigrate = async () => {
    setIsLoading(true);
    setProgress(10);
    setResults(null);
    setErrors([]);

    try {
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          markdown,
          apiKey: apiKey || process.env.NEXT_PUBLIC_LINEAR_API_KEY,
          teamId: teamId || process.env.NEXT_PUBLIC_LINEAR_TEAM_ID,
        }),
      });

      setProgress(60);

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Migration failed');
      }

      setProgress(100);
      setResults(data);
      if (data.errors && data.errors.length > 0) {
        setErrors(data.errors);
      }
    } catch (error: any) {
      setErrors([{ task: 'Migration', error: error.message }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const loadExample = () => {
    setMarkdown(EXAMPLE_MARKDOWN);
    const projects = parseMarkdown(EXAMPLE_MARKDOWN);
    setPreview(projects);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Markdown to Linear Converter
          </CardTitle>
          <CardDescription>
            Create Linear projects with # headers, tasks with ## Task N:, and subtasks with #### Subtask N.M:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="input" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="input">
                <FileText className="h-4 w-4 mr-2" />
                Input
              </TabsTrigger>
              <TabsTrigger value="preview" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="config">
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="input" className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Markdown Content</label>
                  <Button variant="outline" size="sm" onClick={loadExample}>
                    Load Example
                  </Button>
                </div>
                <Textarea
                  placeholder="# Project Name&#10;&#10;## Task 1: Task Title&#10;&#10;### Subtasks&#10;&#10;#### Subtask 1.1: Subtask Title&#10;&#10;**Description**&#10;&#10;Subtask description..."
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                />
              </div>
              
              <Button 
                onClick={handleMigrate}
                disabled={!markdown || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Migrating to Linear...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Migrate to Linear
                  </>
                )}
              </Button>
              
              {isLoading && (
                <Progress value={progress} className="w-full" />
              )}
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-4">
              {preview.length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {preview.map((project, idx) => (
                    <Card key={idx} className="border-2">
                      <CardHeader className="pb-3 bg-muted/50">
                        <CardTitle className="text-xl flex items-center gap-2">
                          <FolderOpen className="h-5 w-5" />
                          <Badge variant="secondary">Project</Badge>
                          {project.title}
                        </CardTitle>
                        {project.description && (
                          <CardDescription className="mt-2">
                            {project.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      {project.tasks.length > 0 && (
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            {project.tasks.map((task, taskIdx) => (
                              <div key={taskIdx} className="border rounded-lg p-3 bg-background">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">Task</Badge>
                                    <span className="font-medium">{task.title}</span>
                                  </div>
                                  {task.description && (
                                    <p className="text-sm text-muted-foreground pl-2">
                                      {task.description}
                                    </p>
                                  )}
                                  {task.subtasks.length > 0 && (
                                    <div className="pl-4 space-y-2 mt-2">
                                      {task.subtasks.map((subtask, subIdx) => (
                                        <div key={subIdx} className="border-l-2 border-muted pl-3">
                                          <p className="font-medium text-sm flex items-center gap-2">
                                            <Badge variant="default" className="text-xs">Subtask</Badge>
                                            {subtask.title}
                                          </p>
                                          {subtask.description && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                              {subtask.description}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    Enter markdown content and click Preview to see the parsed structure
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="config" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Linear API Key</label>
                  <input
                    type="password"
                    placeholder="lin_api_..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to use environment variable
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Team ID</label>
                  <input
                    type="text"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to use environment variable
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Migration Complete
            </CardTitle>
            <CardDescription>
              Created {results.summary.createdProjects} projects with {results.summary.totalTasks} tasks and {results.summary.totalSubtasks} subtasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.results.map((project: any, idx: number) => (
                <div key={idx} className="border-2 rounded-lg p-4 bg-muted/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-lg flex items-center gap-2">
                      <FolderOpen className="h-5 w-5" />
                      {project.title}
                    </div>
                    {project.url && (
                      <a 
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        View Project
                      </a>
                    )}
                  </div>
                  {project.tasks.length > 0 && (
                    <div className="space-y-2">
                      {project.tasks.map((task: any, taskIdx: number) => (
                        <div key={taskIdx} className="pl-4 border-l-2 border-muted">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{task.title}</span>
                            <a 
                              href={task.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:underline"
                            >
                              {task.identifier}
                            </a>
                          </div>
                          {task.subtasks.length > 0 && (
                            <div className="mt-1 pl-4 space-y-1">
                              {task.subtasks.map((sub: any, subIdx: number) => (
                                <div key={subIdx} className="text-sm flex items-center justify-between">
                                  <span className="text-muted-foreground">• {sub.title}</span>
                                  <a 
                                    href={sub.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-500 hover:underline"
                                  >
                                    {sub.identifier}
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {errors.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Errors occurred</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1">
              {errors.map((error, idx) => (
                <li key={idx} className="text-sm">
                  [{error.level}] {error.task}: {error.error}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}