'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, UserPlus } from 'lucide-react'

export default function NewStudentModal({ classes }: { classes: string[] }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [form, setForm] = useState({
    name: '',
    grade: '',
    studentType: 'New' as 'New',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    guardianName: '',
    guardianPhone: '',
    admissionDate: new Date().toISOString().split('T')[0], // Default to today
    notes: '',
    paymentMethod: 'Cash' as 'Cash' | 'Momo' | 'Bank',
    schoolFeesAmount: 0,
    initialAmountPaid: 0,
    location: '',
  })

  const [phoneError, setPhoneError] = useState('')

  const validatePhone = (phone: string) => {
    // Regex for 10-13 digits
    const phoneRegex = /^\d{10,13}$/
    return phoneRegex.test(phone)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePhone(form.guardianPhone)) {
      setPhoneError('Invalid phone number. Must be 10-13 digits.')
      return
    }
    setPhoneError('')

    setIsLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/add-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to add student')
      setMessage({ type: 'success', text: 'Student added successfully!' })
      // Force a hard reload to refresh the page content
      window.location.href = window.location.href;
      setForm({
        name: '',
        grade: '',
        studentType: 'New',
        gender: 'Male',
        guardianName: '',
        guardianPhone: '',
        admissionDate: new Date().toISOString().split('T')[0],
        notes: '',
        paymentMethod: 'Cash',
        schoolFeesAmount: 0,
        initialAmountPaid: 0,
        location: '',
      })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Network error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <UserPlus className="w-4 h-4 mr-2" />
          New Student
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
        </DialogHeader>
        {message && (
          <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Student Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Enter student full name"
              />
            </div>
            <div>
              <Label htmlFor="grade">Class/Grade *</Label>
              <Select
                value={form.grade}
                onValueChange={(value) => setForm({ ...form, grade: value })}
                required
              >
                <SelectTrigger id="grade">
                  <SelectValue placeholder="Select a class/grade" />
                </SelectTrigger>
                <SelectContent>
                  {classes && classes.length ? (
                    classes.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="KG 1">KG 1</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={form.gender}
                onValueChange={(value: 'Male' | 'Female' | 'Other') => setForm({ ...form, gender: value })}
              >
                <SelectTrigger id="gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="guardianName">Guardian Name *</Label>
              <Input
                id="guardianName"
                value={form.guardianName}
                onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
                required
                placeholder="Enter guardian full name"
              />
            </div>
            <div>
              <Label htmlFor="guardianPhone">Guardian Phone *</Label>
              <Input
                id="guardianPhone"
                value={form.guardianPhone}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm({ ...form, guardianPhone: val });
                  if (phoneError) setPhoneError('');
                }}
                required
                placeholder="e.g., 233xxxxxxxxx"
                className={phoneError ? 'border-red-500' : ''}
              />
              {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
            </div>

            <div>
              <Label htmlFor="admissionDate">Admission Date</Label>
              <Input
                id="admissionDate"
                type="date"
                value={form.admissionDate}
                onChange={(e) => setForm({ ...form, admissionDate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={form.paymentMethod}
                onValueChange={(value: 'Cash' | 'Momo' | 'Bank') => setForm({ ...form, paymentMethod: value })}
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Momo">Momo</SelectItem>
                  <SelectItem value="Bank">Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="initialAmountPaid">Initial Amount Paid (GH₵)</Label>
              <Input
                id="initialAmountPaid"
                type="number"
                step="0.01"
                value={form.initialAmountPaid}
                onChange={(e) => setForm({ ...form, initialAmountPaid: Number(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Enter student's location"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes/Remarks</Label>
            <Input
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Additional comments..."
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Student
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
