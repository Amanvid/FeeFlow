'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface TemplateStatus {
  success: boolean;
  timestamp: string;
  templates: {
    count: number;
    types: string[];
    content?: Record<string, string>;
  };
  duration?: number;
  message?: string;
  error?: string;
}

export default function SmsTemplateManager() {
  const [status, setStatus] = useState<TemplateStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [updateResult, setUpdateResult] = useState<TemplateStatus | null>(null);

  // Fetch current template status
  const fetchTemplateStatus = async (includeContent = false) => {
    try {
      const response = await fetch(`/api/sms-templates/update${includeContent ? '?content=true' : ''}`);
      const data = await response.json();
      
      if (data.success) {
        setStatus(data);
      } else {
        setStatus({
          success: false,
          timestamp: new Date().toISOString(),
          templates: { count: 0, types: [] },
          error: data.message || 'Failed to fetch template status'
        });
      }
    } catch (error) {
      setStatus({
        success: false,
        timestamp: new Date().toISOString(),
        templates: { count: 0, types: [] },
        error: error instanceof Error ? error.message : 'Network error'
      });
    }
  };

  // Update templates (force refresh)
  const updateTemplates = async () => {
    setLoading(true);
    setUpdateResult(null);
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/sms-templates/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ force: true })
      });
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      setUpdateResult({
        ...data,
        duration
      });
      
      // Refresh status after update
      await fetchTemplateStatus(false);
      
    } catch (error) {
      setUpdateResult({
        success: false,
        timestamp: new Date().toISOString(),
        templates: { count: 0, types: [] },
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Network error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load initial status
  useEffect(() => {
    fetchTemplateStatus(false);
  }, []);

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Format duration
  const formatDuration = (duration: number) => {
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(1)}s`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SMS Template Manager</h1>
        <p className="text-muted-foreground">
          Manage and update SMS templates from Google Sheets
        </p>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Template Status</CardTitle>
          <CardDescription>
            View the current SMS templates loaded from Google Sheets
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {status.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {status.success ? 'Templates Loaded' : 'Load Failed'}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatTimestamp(status.timestamp)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3">
                  <div className="text-2xl font-bold">{status.templates.count}</div>
                  <div className="text-sm text-muted-foreground">Template Types</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium">Available Templates</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {status.templates.types.join(', ')}
                  </div>
                </div>
              </div>

              {status.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{status.error}</AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading status...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Update Templates</CardTitle>
          <CardDescription>
            Force refresh SMS templates from Google Sheets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={updateTemplates} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Templates...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Force Update Templates
                </>
              )}
            </Button>

            {updateResult && (
              <Alert variant={updateResult.success ? "default" : "destructive"}>
                {updateResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <div className="space-y-1">
                    <div>
                      {updateResult.success ? 'Templates updated successfully!' : 'Update failed'}
                    </div>
                    {updateResult.duration && (
                      <div className="text-sm text-muted-foreground">
                        Duration: {formatDuration(updateResult.duration)}
                      </div>
                    )}
                    {updateResult.timestamp && (
                      <div className="text-sm text-muted-foreground">
                        Updated: {formatTimestamp(updateResult.timestamp)}
                      </div>
                    )}
                    {updateResult.error && (
                      <div className="text-sm text-red-600 dark:text-red-400">
                        Error: {updateResult.error}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Template Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Template Preview</CardTitle>
          <CardDescription>
            Preview the current SMS templates (click to load)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => fetchTemplateStatus(true)}
            variant="outline"
            className="w-full"
            disabled={!status}
          >
            Load Template Content
          </Button>

          {status?.templates?.content && (
            <div className="mt-4 space-y-3">
              {Object.entries(status.templates.content).map(([name, content]) => (
                <div key={name} className="rounded-lg border p-3">
                  <div className="font-medium text-sm mb-1">
                    {name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {content.length > 100 ? `${content.substring(0, 100)}...` : content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Daily Updates</h4>
              <p className="text-muted-foreground">
                Set up a daily cron job or Windows Task Scheduler to run the template update automatically.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Manual Updates</h4>
              <p className="text-muted-foreground">
                Use the "Force Update Templates" button above to manually refresh templates from Google Sheets.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Google Sheets</h4>
              <p className="text-muted-foreground">
                Ensure your Google Sheets "Template" sheet has the correct column headers and template content.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}