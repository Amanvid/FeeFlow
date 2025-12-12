'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SubjectSelectorProps {
  currentSubject: string;
  availableSubjects: string[];
  onSubjectChange: (subject: string) => void;
}

export function SubjectSelector({ currentSubject, availableSubjects, onSubjectChange }: SubjectSelectorProps) {
  return (
    <div className="flex items-center space-x-4 mb-6">
      <label className="text-sm font-medium">Select Subject:</label>
      <Select value={currentSubject} onValueChange={onSubjectChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select subject" />
        </SelectTrigger>
        <SelectContent>
          {availableSubjects.map((subject) => (
            <SelectItem key={subject} value={subject}>
              {subject}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}