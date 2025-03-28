import React from 'react';

// --- NEW LOB Type ---
export interface LOB {
    id: string; // e.g., 'personal_banking', 'business_lending'
    name: string; // e.g., 'Personal Banking', 'Business Lending'
}

// --- Template Definition (remains simple) ---
export interface Template {
    id: string;
    lobId: string; // <-- Associate template with an LOB
    name: string;
    component: string;
    styleClass?: string;
    hasSpecificFields?: boolean; // Optional flag to trigger TemplateSpecificForm
    usesQuill?: boolean; // Optional flag for templates using the editor
}

// TemplateField interface here
export interface TemplateField {
    id: string; // Will be the key in templateData
    label: string;
    type: 'text' | 'date' | 'textarea' | 'number'; // Add more types as needed
    placeholder?: string;
    required?: boolean; // For potential validation later
}

export interface DocumentData { // General/common fields
    subject: string;
    recipientName: string;
    // Add other common fields if needed
}

// DocumentState includes runtime state like LOBs, search term etc.
export interface DocumentState extends SavedDocumentData { // Extends the data part
    // Runtime state:
    lobs: LOB[];
    selectedLOB: LOB | null;
    allTemplates: Template[];
    searchTerm: string;
}

// --- Data needed to SAVE/LOAD a specific document instance ---
export interface SavedDocumentData {
    formData: DocumentData;
    editorContent: string;
    selectedTemplate: Template | null; // Save the template definition used
    templateData: Record<string, any>;
}

// --- Structure stored in localStorage ---
export interface SavedDocument extends SavedDocumentData { // Extends the data part
    id: string;
    savedAt: number;
}

export interface DocumentContextProps extends DocumentState {
    updateFormData: (data: Partial<DocumentData>) => void;
    setEditorContent: React.Dispatch<React.SetStateAction<string>>;
    setSelectedTemplate: (template: Template | null) => void;
    insertSection: (content: string) => void; // Still potentially useful for Quill templates
    updateTemplateData: (fieldId: string, value: any) => void;
    setTemplateData: (data: Record<string, any>) => void;
    setSelectedLOB: (lob: LOB | null) => void;
    setSearchTerm: (term: string) => void;
    // No setter for lobs/allTemplates needed if loaded once
}

// --- Prop type for Template Components ---
export interface TemplateComponentProps {
    printRef: React.RefObject<HTMLDivElement | null>; // Ref for printing/PDF
    // Add other props if template components need common functionality
}


// CommonSection 
export interface CommonSection {
    id: string;
    title: string;
    content: string; // HTML content
}