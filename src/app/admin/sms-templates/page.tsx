import SmsTemplateManager from '@/components/admin/sms-template-manager';

export const metadata = {
  title: 'SMS Template Manager',
  description: 'Manage and update SMS templates from Google Sheets',
};

export default function SmsTemplatesPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <SmsTemplateManager />
    </div>
  );
}