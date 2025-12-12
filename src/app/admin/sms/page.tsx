"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

export default function AdminSendSmsPage() {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [parents, setParents] = useState(true);
  const [students, setStudents] = useState(false);
  const [teachers, setTeachers] = useState(false);
  const [staff, setStaff] = useState(false);
  const [customEnabled, setCustomEnabled] = useState(false);
  const [customNumbers, setCustomNumbers] = useState("");
  const [sending, setSending] = useState(false);

  const [usePerAudienceTemplates, setUsePerAudienceTemplates] = useState(false);
  const [templates, setTemplates] = useState<any | null>(null);
  const [messagesByGroup, setMessagesByGroup] = useState<{ [k: string]: string }>({});

  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);

  const applyTemplate = (text: string, vars: Record<string, any>): string => {
    if (!text) return '';
    let out = text;
    Object.entries(vars || {}).forEach(([k, v]) => {
      const val = typeof v === 'number' ? String(v) : (v ?? '');
      out = out.replace(new RegExp(`\\{${k}\\}`, 'g'), val);
    });
    return out;
  };

  const loadRecipients = async () => {
    try {
      const res = await fetch('/api/admin/recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groups: groupsSelected(),
          classes: selectedClasses,
          departments: selectedDepartments,
        })
      });
      const data = await res.json();
      if (data.success) {
        setRecipients(data.recipients || []);
      }
    } catch {}
  };

  const loadTemplates = async () => {
    try {
      const res = await fetch('/api/sms-templates/update?content=true');
      const data = await res.json();
      if (data.success && data.templates && data.templates.content) {
        setTemplates(data.templates.content);
      }
    } catch {}
  };

  const loadFilters = async () => {
    try {
      const [classesRes, departmentsRes] = await Promise.all([
        fetch('/api/classes'),
        fetch('/api/admin/departments')
      ]);
      const classesData = await classesRes.json();
      const departmentsData = await departmentsRes.json();
      if (classesData.classes) setClasses(classesData.classes);
      if (departmentsData.departments) setDepartments(departmentsData.departments);
    } catch {}
  };

  useEffect(() => {
    loadTemplates();
    loadFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groupsSelected = () => {
    const groups: string[] = [];
    if (parents) groups.push("parents");
    if (students) groups.push("students");
    if (teachers) groups.push("teachers");
    if (staff) groups.push("staff");
    if (customEnabled) groups.push("custom");
    return groups;
  };

  const handleSend = async () => {
    const groups = groupsSelected();
    if (!usePerAudienceTemplates) {
      if (!message.trim()) {
        toast({ title: "Message required", description: "Enter a message to send", variant: "destructive" });
        return;
      }
    } else {
      const anyMessage = groups.some(g => (messagesByGroup[g] || '').trim().length > 0);
      if (!anyMessage) {
        toast({ title: "Message required", description: "Provide a message or template for selected audiences", variant: "destructive" });
        return;
      }
    }

    const nums = customNumbers
      .split(/[\,\n;]/)
      .map(s => s.trim())
      .filter(Boolean);

    setSending(true);
    try {
      const payload: any = {
        groups,
        customNumbers: nums,
        classes: selectedClasses,
        departments: selectedDepartments,
      };
      if (usePerAudienceTemplates) {
        payload.messagesByGroup = messagesByGroup;
      } else {
        payload.message = message;
      }

      const res = await fetch("/api/admin/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "SMS sent", description: `Messages sent to ${data.sent} recipients` });
        setMessage("");
        setCustomNumbers("");
        setMessagesByGroup({});
        setSelectedClasses([]);
        setSelectedDepartments([]);
      } else {
        toast({ title: "Failed", description: data.error || "Failed to send", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Send SMS</h2>
        <p className="text-muted-foreground">Send custom messages to parents, students, teachers, staff, or custom numbers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audience</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-2">
              <Checkbox id="parents" checked={parents} onCheckedChange={(v) => setParents(!!v)} />
              <Label htmlFor="parents">Parents</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="students" checked={students} onCheckedChange={(v) => setStudents(!!v)} />
              <Label htmlFor="students">Students</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="teachers" checked={teachers} onCheckedChange={(v) => setTeachers(!!v)} />
              <Label htmlFor="teachers">Teachers</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="staff" checked={staff} onCheckedChange={(v) => setStaff(!!v)} />
              <Label htmlFor="staff">Non-Teaching Staff</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="custom" checked={customEnabled} onCheckedChange={(v) => setCustomEnabled(!!v)} />
              <Label htmlFor="custom">Custom Numbers</Label>
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <Label>Filter by Class</Label>
              <div className="mt-2 grid grid-cols-2 gap-2 max-h-48 overflow-auto rounded border p-2">
                {classes.map((c) => (
                  <label key={c} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedClasses.includes(c)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectedClasses(prev => checked ? [...prev, c] : prev.filter(x => x !== c));
                      }}
                    />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
              <p className="text-muted-foreground text-xs mt-2">Applies to Parents, Students and Teachers</p>
            </div>

            <div>
              <Label>Filter by Department</Label>
              <div className="mt-2 grid grid-cols-2 gap-2 max-h-48 overflow-auto rounded border p-2">
                {departments.map((d) => (
                  <label key={d} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedDepartments.includes(d)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectedDepartments(prev => checked ? [...prev, d] : prev.filter(x => x !== d));
                      }}
                    />
                    <span>{d}</span>
                  </label>
                ))}
              </div>
              <p className="text-muted-foreground text-xs mt-2">Applies to Non-Teaching Staff</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline" onClick={loadRecipients}>Load Recipients</Button>
            <span className="text-xs text-muted-foreground">Select an audience and filters, then load recipients</span>
          </div>
          {recipients.length > 0 && (
            <div className="mt-4 rounded border p-3 space-y-2">
              <Label>Recipients</Label>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {recipients.map((r) => (
                  <button
                    key={r.id}
                    className={`text-left rounded border px-3 py-2 ${selectedRecipientId === r.id ? 'bg-accent text-accent-foreground' : ''}`}
                    onClick={() => {
                      setSelectedRecipientId(r.id);
                      // Determine source text (global or per-audience)
                      const group = r.type === 'parent' ? (parents ? 'parents' : 'students') : r.type === 'teacher' ? 'teachers' : 'staff';
                      if (usePerAudienceTemplates) {
                        const text = messagesByGroup[group] || '';
                        const applied = applyTemplate(text, r.variables || {});
                        setMessagesByGroup(prev => ({ ...prev, [group]: applied }));
                      } else {
                        const applied = applyTemplate(message, r.variables || {});
                        setMessage(applied);
                      }
                    }}
                  >
                    <div className="font-medium">
                      {r.type === 'parent' && (r.studentName ? `${r.studentName} (${r.name})` : r.name)}
                      {r.type !== 'parent' && (r.name)}
                    </div>
                    <div className="text-xs text-muted-foreground">{r.type} • {r.className || r.department || ''}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Message</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-3">
            <Checkbox id="useTemplates" checked={usePerAudienceTemplates} onCheckedChange={(v) => setUsePerAudienceTemplates(!!v)} />
            <Label htmlFor="useTemplates">Use different message templates per audience</Label>
            <Button variant="outline" className="ml-auto" onClick={loadTemplates}>Load Templates</Button>
          </div>

          {!usePerAudienceTemplates && (
            <div className="space-y-3">
              {templates && (
                <select
                  className="border rounded px-2 py-1"
                  onChange={(e) => {
                    const key = e.target.value;
                    if (key) setMessage(templates[key] || '');
                  }}
                >
                  <option value="">Select template</option>
                  <option value="feeReminder">Fee Reminder</option>
                  <option value="paymentNotification">Payment Notification</option>
                  <option value="admissionNotification">Admission Notification</option>
                  <option value="otp">OTP</option>
                  <option value="activation">Activation</option>
                  <option value="adminActivation">Admin Activation</option>
                </select>
              )}
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type message" />
            </div>
          )}

          {usePerAudienceTemplates && (
            <div className="space-y-4">
              {['parents','students','teachers','staff','custom'].filter(g => groupsSelected().includes(g)).map((group) => (
                <div key={group} className="rounded border p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="capitalize">{group} message</Label>
                    {templates && (
                      <select
                        className="ml-auto border rounded px-2 py-1"
                        onChange={(e) => {
                          const val = e.target.value;
                          const tpl = templates[val] || '';
                          setMessagesByGroup(prev => ({ ...prev, [group]: tpl }));
                        }}
                      >
                        <option value="">Select template</option>
                        <option value="feeReminder">Fee Reminder</option>
                        <option value="paymentNotification">Payment Notification</option>
                        <option value="admissionNotification">Admission Notification</option>
                        <option value="otp">OTP</option>
                        <option value="activation">Activation</option>
                        <option value="adminActivation">Admin Activation</option>
                      </select>
                    )}
                  </div>
                  <Textarea
                    value={messagesByGroup[group] || ''}
                    onChange={(e) => setMessagesByGroup(prev => ({ ...prev, [group]: e.target.value }))}
                    placeholder={`Message to ${group}`}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="mt-4">
            <Button onClick={handleSend} disabled={sending}>
              {sending ? "Sending..." : "Send SMS"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {customEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>Custom Numbers</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="numbers">Enter numbers separated by commas or new lines</Label>
            <Textarea id="numbers" value={customNumbers} onChange={(e) => setCustomNumbers(e.target.value)} placeholder="e.g. 0241234567, +23324XXXXXXX" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
