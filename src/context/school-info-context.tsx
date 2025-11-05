"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSchoolConfig } from '@/lib/data';
import type { SchoolConfig } from '@/lib/definitions';

interface SchoolInfo {
    schoolName: string;
    systemId: string;
    currentPlan: 'free' | 'starter' | 'pro' | 'enterprise';
}

interface SchoolContextType {
    schoolInfo: (SchoolInfo & SchoolConfig) | null;
    loading: boolean;
}

const SchoolInfoContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolInfoProvider = ({ children }: { children: ReactNode }) => {
    const [schoolInfo, setSchoolInfo] = useState<(SchoolInfo & SchoolConfig) | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchoolInfo = async () => {
            try {
                // In a real app, you would fetch this from your backend/DB
                // For now, we combine fetched config with some mock data.
                const config = await getSchoolConfig();
                
                // Mock data that would normally come from a user/school-specific DB record
                const mockInfo: SchoolInfo = {
                    schoolName: config.schoolName,
                    systemId: 'CF-001',
                    currentPlan: 'starter', // Default to starter for now
                };

                setSchoolInfo({ ...config, ...mockInfo });

            } catch (error) {
                console.error("Failed to fetch school info:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchoolInfo();
    }, []);

    return (
        <SchoolInfoContext.Provider value={{ schoolInfo, loading }}>
            {children}
        </SchoolInfoContext.Provider>
    );
};

export const useSchoolInfo = () => {
    const context = useContext(SchoolInfoContext);
    if (context === undefined) {
        throw new Error('useSchoolInfo must be used within a SchoolInfoProvider');
    }
    return context;
};
