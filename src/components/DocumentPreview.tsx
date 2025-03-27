import React, { useRef, useMemo, useEffect } from 'react'; // Added useEffect
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useDocument } from '../contexts/DocumentContext';

interface DocumentPreviewProps {
   printRef: React.RefObject<HTMLDivElement | null>;
   setQuillRef?: (ref: ReactQuill | null) => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ printRef, setQuillRef }) => {
    const { editorContent, setEditorContent, formData, selectedTemplate } = useDocument();
    const internalQuillRef = useRef<ReactQuill>(null);

    // Debounce editor changes (as before)
    const debouncedSetEditorContent = useMemo(() => {
        let timeoutId: NodeJS.Timeout | null = null;
        return (content: string) => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setEditorContent(content);
            }, 300);
        };
    }, [setEditorContent]);

    const handleEditorChange = (content: string, delta: any, source: any, editor: any) => {
        if (source === 'user') {
            debouncedSetEditorContent(editor.getHTML());
        }
    };

    // Pass up the Quill instance ref (as before)
    useEffect(() => {
        if (setQuillRef && internalQuillRef.current) {
            setQuillRef(internalQuillRef.current);
        }
        return () => {
            if (setQuillRef) setQuillRef(null);
        };
    }, [setQuillRef]);

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
            ['link', /* 'image' */], // Image handling might need more setup
            ['clean']
        ],
    };

    const formats = [
        'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent', 'link', /* 'image' */
    ];

    return (
        <div className="document-preview-container">
            <h2>Live Preview / Editor</h2>

            {/* This outer div IS the preview area for print/PDF */}
            <div
                ref={printRef as React.RefObject<HTMLDivElement>}
                className={`document-render-area ${selectedTemplate?.styleClass || 'template-default'}`} // Add a default class
            >
                {/* 1. Render form data elements BEFORE the editor */}
                {/*    Customize this based on your needs and selected template */}
                <div className="preview-header">
                    {/* Conditionally render based on template? */}
                    <h1>{formData.subject || "[Subject Placeholder]"}</h1>
                    <p><strong>To:</strong> {formData.recipientName || "[Recipient Name Placeholder]"}</p>
                    {/* Add other fields like Date, From, etc. as needed */}
                    <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                    <hr />
                </div>

                {/* 2. Render the Quill editor for interactive editing */}
                <ReactQuill
                    ref={internalQuillRef}
                    theme="snow" // Use "bubble" for inline editing, "snow" for toolbar
                    value={editorContent}
                    onChange={handleEditorChange}
                    modules={modules}
                    formats={formats}
                    className="quill-editor-component" // Add specific class for styling editor itself
                    // style={{ minHeight: '300px' }} // Apply min-height via CSS instead
                />

                 {/* 3. Optionally render footer elements AFTER the editor */}
                 <div className="preview-footer">
                    {/* Example: Add closing remarks or standard footers */}
                    {/* <hr /> */}
                    {/* <p>Company Confidential</p> */}
                 </div>
            </div>
        </div>
    );
};

export default DocumentPreview;