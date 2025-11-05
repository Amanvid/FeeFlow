'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettings {
  smsEnabled: boolean;
  feeRemindersEnabled: boolean;
  paymentNotificationsEnabled: boolean;
  admissionNotificationsEnabled: boolean;
}

interface SchoolConfig {
  schoolName: string;
  address: string;
  momoNumber: string;
  dueDate: string;
  invoicePrefix: string;
  senderId: string;
  logoUrl: string;
  notifications: NotificationSettings;
}

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [config, setConfig] = useState<SchoolConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/school-config');
      if (!response.ok) {
        throw new Error('Failed to fetch configuration');
      }
      const data = await response.json();
      setConfig(data);
    } catch (err) {
      setError('Failed to load settings');
      console.error('Error fetching config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    if (config) {
      setConfig({
        ...config,
        notifications: {
          ...config.notifications,
          [key]: value,
        },
      });
    }
  };

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const response = await fetch('/api/school-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notifications: config.notifications }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      toast({
        title: 'Settings Saved',
        description: 'Notification settings have been updated successfully.',
        className: 'bg-green-50 border-green-200',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
      console.error('Error saving config:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your school's notification and communication settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Configure how your school sends notifications to students and guardians
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-enabled">SMS Notifications</Label>
                <p className="text-sm text-gray-500">
                  Enable or disable all SMS notifications
                </p>
              </div>
              <Switch
                id="sms-enabled"
                checked={config?.notifications?.smsEnabled || false}
                onCheckedChange={(checked) => handleNotificationChange('smsEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="fee-reminders-enabled">Fee Reminders</Label>
                <p className="text-sm text-gray-500">
                  Send SMS reminders for outstanding fees
                </p>
              </div>
              <Switch
                id="fee-reminders-enabled"
                checked={config?.notifications?.feeRemindersEnabled || false}
                onCheckedChange={(checked) => handleNotificationChange('feeRemindersEnabled', checked)}
                disabled={!config?.notifications?.smsEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="payment-notifications-enabled">Payment Notifications</Label>
                <p className="text-sm text-gray-500">
                  Send SMS notifications when payments are made
                </p>
              </div>
              <Switch
                id="payment-notifications-enabled"
                checked={config?.notifications?.paymentNotificationsEnabled || false}
                onCheckedChange={(checked) => handleNotificationChange('paymentNotificationsEnabled', checked)}
                disabled={!config?.notifications?.smsEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="admission-notifications-enabled">Admission Notifications</Label>
                <p className="text-sm text-gray-500">
                  Send SMS notifications for admission-related updates
                </p>
              </div>
              <Switch
                id="admission-notifications-enabled"
                checked={config?.notifications?.admissionNotificationsEnabled || false}
                onCheckedChange={(checked) => handleNotificationChange('admissionNotificationsEnabled', checked)}
                disabled={!config?.notifications?.smsEnabled}
              />
            </div>

            {config?.notifications?.smsEnabled && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Current Sender ID:</strong> {config?.senderId}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  This is the name that will appear as the sender of SMS messages
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin')}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}