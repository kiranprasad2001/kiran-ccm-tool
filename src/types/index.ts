import React from 'react';

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

export interface Template {
    id: string;
    name: string;
    component: string; // Identifier for the component to load
    styleClass?: string;
}

// State holds generic data + specific data for the active template
export interface DocumentState {
    formData: DocumentData;         // General data
    editorContent: string;        // Only used by templates that render Quill (like StandardLetter)
    selectedTemplate: Template | null;
    templateData: Record<string, any>; // Holds data for the *active* template's fields
}

export interface DocumentContextProps extends DocumentState {
    updateFormData: (data: Partial<DocumentData>) => void;
    setEditorContent: React.Dispatch<React.SetStateAction<string>>;
    setSelectedTemplate: (template: Template | null) => void;
    insertSection: (content: string) => void; // Still potentially useful for Quill templates
    updateTemplateData: (fieldId: string, value: any) => void;
    setTemplateData: (data: Record<string, any>) => void;
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