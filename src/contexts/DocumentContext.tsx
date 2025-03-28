import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { DocumentState, DocumentContextProps, DocumentData, Template, LOB } from '../types';

// Import LOB data
import lobsData from '../data/lobs.json'; // <-- Import the JSON data

import personalTemplates from '../data/templates/personal.json';
import businessTemplates from '../data/templates/business.json';

const allTemplatesData: Template[] = [
    ...personalTemplates,
    ...businessTemplates,
    // ...wealthTemplates,
] as Template[]; // Assert type

// --- Default State ---
const defaultState: DocumentState = {
    formData: { subject: '', recipientName: '' },
    editorContent: '<p>Start writing...</p>',
    selectedTemplate: null,
    templateData: {},
    lobs: [], // Will be loaded
    selectedLOB: null,
    allTemplates: [], // Will be loaded
    searchTerm: '',
};

const DocumentContext = createContext<DocumentContextProps | undefined>(undefined);

// --- Provider ---
export const DocumentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [formData, setFormData] = useState<DocumentData>(defaultState.formData);
    const [editorContent, setEditorContent] = useState<string>(defaultState.editorContent);
    const [selectedTemplate, setSelectedTemplateState] = useState<Template | null>(defaultState.selectedTemplate);
    const [templateData, setTemplateData] = useState<Record<string, any>>(defaultState.templateData);
    const [lobs, setLobs] = useState<LOB[]>(defaultState.lobs);
    const [selectedLOB, setSelectedLOBState] = useState<LOB | null>(defaultState.selectedLOB);
    const [allTemplates, setAllTemplates] = useState<Template[]>(defaultState.allTemplates);
    const [searchTerm, setSearchTermState] = useState<string>(defaultState.searchTerm);

    // --- Load initial data ---
    useEffect(() => {
        // Load LOBs (sync for now, could be async)
        setLobs(lobsData as LOB[]);
        // Load all templates (sync for now)
        setAllTemplates(allTemplatesData);
        // Optionally select a default LOB?
        // setSelectedLOBState(lobsData[0] as LOB);
    }, []);

interface DocumentProviderProps {
    children: ReactNode;
}

    const updateFormData = useCallback((data: Partial<DocumentData>) => {
        setFormData(prevData => ({ ...prevData, ...data }));
    }, []);

    const updateTemplateData = useCallback((fieldId: string, value: any) => {
        setTemplateData(prevData => ({ ...prevData, [fieldId]: value }));
    }, []);

    const setSelectedLOB = useCallback((lob: LOB | null) => {
        setSelectedLOBState(lob);
        setSelectedTemplateState(null); // Reset template when LOB changes
        setTemplateData({}); // Reset specific data
        setSearchTermState(''); // Reset search term
    }, []);

    const setSearchTerm = useCallback((term: string) => {
        setSearchTermState(term);
    }, []);

    const setSelectedTemplate = useCallback((template: Template | null) => {
        setSelectedTemplateState(template);
        setTemplateData({}); // Reset specific data
        // Reset editor content if new template doesn't use Quill
        if (!template?.usesQuill) {
            setEditorContent('');
        } else if (editorContent === '') {
             setEditorContent('<p>Start writing...</p>');
        }
    }, [editorContent]); // editorContent dependency  

    // insertSection only makes sense for Quill-based templates
    const insertSection = useCallback((content: string) => {
        // Only allow insert if the current template uses Quill
        if (selectedTemplate?.usesQuill) {
             setEditorContent(prevContent => prevContent + content);
        } else {
             console.warn("Cannot insert common section into this template type.");
        }
    }, [selectedTemplate]); // selectedTemplate dependency


    // --- Context Value ---
    const value: DocumentContextProps = {
        formData,
        editorContent,
        selectedTemplate,
        templateData,
        lobs,
        selectedLOB,
        allTemplates,
        searchTerm,
        updateFormData,
        setEditorContent,
        setSelectedTemplate,
        insertSection,
        updateTemplateData,
        setTemplateData,
        setSelectedLOB,
        setSearchTerm,
    };

    return <DocumentContext.Provider value={value}>{children}</DocumentContext.Provider>;
};

export const useDocument = (): DocumentContextProps => {
    // ... (rest of the hook remains the same)
    const context = useContext(DocumentContext);
    if (context === undefined) {
        throw new Error('useDocument must be used within a DocumentProvider');
    }
    return context;
};