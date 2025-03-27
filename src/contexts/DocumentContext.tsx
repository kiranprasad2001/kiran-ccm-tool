import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { DocumentState, DocumentContextProps, DocumentData, Template } from '../types';

const defaultState: DocumentState = {
    formData: { subject: '', recipientName: '' },
    editorContent: '<p>Start writing your document...</p>',
    selectedTemplate: null,
    templateData: {},
};

const DocumentContext = createContext<DocumentContextProps | undefined>(undefined);

interface DocumentProviderProps {
    children: ReactNode;
}

export const DocumentProvider: React.FC<DocumentProviderProps> = ({ children }) => {
    const [formData, setFormData] = useState<DocumentData>(defaultState.formData);
    const [editorContent, setEditorContent] = useState<string>(defaultState.editorContent);
    const [selectedTemplate, setSelectedTemplateState] = useState<Template | null>(defaultState.selectedTemplate);
    const [templateData, setTemplateData] = useState<Record<string, any>>(defaultState.templateData);

    const updateFormData = useCallback((data: Partial<DocumentData>) => {
        setFormData(prevData => ({ ...prevData, ...data }));
    }, []);

    const updateTemplateData = useCallback((fieldId: string, value: any) => {
        setTemplateData(prevData => ({ ...prevData, [fieldId]: value }));
    }, []);

    const setSelectedTemplate = useCallback((template: Template | null) => {
        setSelectedTemplateState(template);
        // Reset specific and editor data when template changes
        setTemplateData({});
        // Only reset editorContent if the *new* template isn't expected to use it
        // This logic depends on how you define which templates use Quill
        // For now, let's clear it unless it's the 'letter' template
        if (template?.id !== 'letter') {
           setEditorContent('');
        } else if (editorContent === '') {
            setEditorContent('<p>Start writing your document...</p>'); // Reset if switching back to letter
        }
    }, [editorContent]); // Dependency on editorContent

    // insertSection only makes sense for Quill-based templates
    const insertSection = useCallback((content: string) => {
        // Only allow insert if the current template is the 'letter' template (or others using Quill)
        if (selectedTemplate?.id === 'letter') {
             setEditorContent(prevContent => prevContent + content);
        } else {
             console.warn("Cannot insert common section into this template type.");
        }
    }, [selectedTemplate]);


    const value: DocumentContextProps = {
        formData,
        editorContent,
        selectedTemplate,
        templateData,
        updateFormData,
        setEditorContent,
        setSelectedTemplate,
        insertSection,
        updateTemplateData,
        setTemplateData, // Pass the direct setter
    };

    return (
        <DocumentContext.Provider value={value}>
            {children}
        </DocumentContext.Provider>
    );
};

export const useDocument = (): DocumentContextProps => {
    // ... (rest of the hook remains the same)
    const context = useContext(DocumentContext);
    if (context === undefined) {
        throw new Error('useDocument must be used within a DocumentProvider');
    }
    return context;
};