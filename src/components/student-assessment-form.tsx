'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StudentAssessmentFormProps {
  students: Array<{
    id: string;
    name: string;
  }>;
  subjects: string[];
  classes: string[];
  onSubmit: (data: {
    studentId: string;
    subject: string;
    assessmentType: string;
    score: number;
    maxScore: number;
    term: string;
    className: string;
  }) => Promise<void>;
}

export function StudentAssessmentForm({ students, subjects, classes, onSubmit }: StudentAssessmentFormProps) {
  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    assessmentType: '',
    score: '',
    maxScore: '',
    term: '',
    className: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studentId || !formData.subject || !formData.assessmentType || !formData.score || !formData.maxScore || !formData.term || !formData.className) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        studentId: formData.studentId,
        subject: formData.subject,
        assessmentType: formData.assessmentType,
        score: parseFloat(formData.score),
        maxScore: parseFloat(formData.maxScore),
        term: formData.term,
        className: formData.className
      });
      
      // Reset form
      setFormData({
        studentId: '',
        subject: '',
        assessmentType: '',
        score: '',
        maxScore: '',
        term: '',
        className: ''
      });
      
      alert('Assessment added successfully!');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Failed to add assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Student Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="student">Student</Label>
              <Select value={formData.studentId} onValueChange={(value) => handleInputChange('studentId', value)}>
                <SelectTrigger id="student">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="class">Class</Label>
              <Select value={formData.className} onValueChange={(value) => handleInputChange('className', value)}>
                <SelectTrigger id="class">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classItem) => (
                    <SelectItem key={classItem} value={classItem}>
                      {classItem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="term">Term</Label>
              <Select value={formData.term} onValueChange={(value) => handleInputChange('term', value)}>
                <SelectTrigger id="term">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="assessmentType">Assessment Type</Label>
              <Select value={formData.assessmentType} onValueChange={(value) => handleInputChange('assessmentType', value)}>
                <SelectTrigger id="assessmentType">
                  <SelectValue placeholder="Select assessment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Test">Individual Test</SelectItem>
                  <SelectItem value="Quiz">Class Test</SelectItem>
                  <SelectItem value="Exam">End of Term Exam</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="score">Score</Label>
              <Input
                id="score"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.score}
                onChange={(e) => handleInputChange('score', e.target.value)}
                placeholder="Enter score"
                required
              />
            </div>

            <div>
              <Label htmlFor="maxScore">Maximum Score</Label>
              <Input
                id="maxScore"
                type="number"
                step="0.1"
                min="1"
                max="100"
                value={formData.maxScore}
                onChange={(e) => handleInputChange('maxScore', e.target.value)}
                placeholder="Enter maximum score"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Adding Assessment...' : 'Add Assessment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
