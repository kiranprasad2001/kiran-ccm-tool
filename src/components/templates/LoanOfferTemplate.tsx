import React, { useRef, useMemo, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useDocument } from '../../contexts/DocumentContext';
import { TemplateComponentProps } from '../../types';

const StandardLetterTemplate: React.FC<TemplateComponentProps> = ({ printRef }) => {
    // Use general form data and editor content for this template
    const { editorContent, setEditorContent, formData } = useDocument();
    const internalQuillRef = useRef<ReactQuill>(null);

    // Debounce and handle changes as in previous DocumentPreview
    const debouncedSetEditorContent = useMemo(() => {
        let timeoutId: NodeJS.Timeout | null = null;
        // Return the actual debouncing function
        return (content: string) => { // <-- This is the function to return
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setEditorContent(content);
            }, 300);
        };
    }, [setEditorContent]);

    const handleEditorChange = (content: string, delta: any, source: any, editor: any) => {
        if (source === 'user') {
            // Call the debounced function correctly
            debouncedSetEditorContent(editor.getHTML());
        }
    };

    // Pass up Quill ref if needed? Maybe not needed by App.tsx anymore
    // useEffect(() => { /* ... if quill instance needed by parent ... */ }, []);


    // src/components/templates/StandardLetterTemplate.tsx

    const modules: any = { /* ... Quill modules ... */ }; // Using 'any' for modules for simplicity

    const formats: string[] = [ // <-- Add : string[]
        'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent', 'link',
    ];

    return (
        // This outer div is what gets printed/PDF'd
        <div ref={printRef as React.RefObject<HTMLDivElement>} className={`template-letter document-render-area`}>
            {/* Render standard header + Quill editor */}
            <div className="preview-header">
                <h1>{formData.subject || "[Subject Placeholder]"}</h1>
                {/* Maybe recipient name is also in formData? */}
                {/* <p><strong>To:</strong> {formData.recipientName || "[Recipient Name Placeholder]"}</p> */}
                <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                <hr />
            </div>
            <ReactQuill
                ref={internalQuillRef}
                theme="snow"
                value={editorContent}
                onChange={handleEditorChange}
                modules={modules}
                formats={formats}
                className="quill-editor-component"
            />
            <div className="preview-footer">
                {/* Optional footer */}
            </div>
        </div>
    );
};

export default StandardLetterTemplate;