import React, { useRef, useState, useEffect, lazy, Suspense } from 'react'; // Added lazy, Suspense
import { useDocument } from './contexts/DocumentContext';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import default CSS
import {
    saveDocumentToStorage,
    loadDocumentsFromStorage,
    deleteDocumentFromStorage,
    SavedDocument
} from './utils/localStorageUtils';
import { TemplateField } from './types';

// Standard Components
import UserInputForm from './components/UserInputForm'; // For common fields like Subject
import TemplateSelector from './components/TemplateSelector';
import CommonSectionsPanel from './components/CommonSectionsPanel';
import TemplateSpecificForm from './components/TemplateSpecificForm'; // To render inputs for structured templates
import { TemplateComponentProps } from './types'; // Import shared props

import './styles/App.css';

// --- Lazy Load Template Components ---
const templateComponentMap: Record<string, React.LazyExoticComponent<React.FC<TemplateComponentProps>>> = {
  StandardLetterTemplate: lazy(() => import('./components/templates/StandardLetterTemplate')),
  POARevocationTemplate: lazy(() => import('./components/templates/POARevocationTemplate')),
  // Add other templates here as you create them
  // AffidavitTemplate: lazy(() => import('./components/templates/AffidavitTemplate')),
};


function App() {
    const printRef = useRef<HTMLDivElement>(null);

    // Remove Quill instance state from App - managed within StandardLetterTemplate if needed
    // const [quillInstance, setQuillInstance] = useState<ReactQuill | null>(null);

    const {
        selectedTemplate,
        setTemplateData, // For load
        //... other context needed for save/load/insert
        formData, editorContent, templateData, updateFormData, setEditorContent, setSelectedTemplate, insertSection
    } = useDocument();

    const [savedDocuments, setSavedDocuments] = useState<SavedDocument[]>([]);
    const [showLoadModal, setShowLoadModal] = useState(false);

    useEffect(() => { setSavedDocuments(loadDocumentsFromStorage()); }, []);

    // --- Print Handler ---
    const handlePrint = useReactToPrint({
//      content: () => {
//        console.log('Print Handler: Getting content. Ref:', printRef.current); // Log inside content fn
//        if (!printRef.current) {
//          console.error("PRINT REF IS NULL when getting content!");
//        }
//        return printRef.current;
//      },
      contentRef: printRef,
      // --- Debugging Hooks ---
//      onBeforeGetContent: () => console.log('Print (contentRef) -> onBeforeGetContent'),
//      onBeforePrint: () => console.log('Print (contentRef) -> onBeforePrint'),
//      onAfterPrint: () => console.log('Print (contentRef) -> onAfterPrint'),

      documentTitle: 'Generated Document',
    } as any); // Keep cast for now
    
    // --- PDF Handler ---
    const handleSavePdf = async () => {
      console.log('Save PDF Handler: Function called. Ref:', printRef.current); // Log start of function
      const element = printRef.current;
      if (!element) {
          console.error('Save PDF Handler: ERROR - printRef.current is null!');
          alert('Error preparing PDF: Cannot find document content.'); // User feedback
          return;
      }

      // Add a try/catch block for better error reporting
      try {
          console.log('Save PDF Handler: Calling html2canvas...');
          // Show loading indicator? (Optional enhancement)
          const canvas = await html2canvas(element, {
               scale: 2, // Improves resolution
               useCORS: true, // If you ever add external images
               logging: true, // Enable html2canvas logging
               });
          console.log('Save PDF Handler: html2canvas finished.');

          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
          const imgX = (pdfWidth - imgWidth * ratio) / 2;
          const imgY = 10; // Margin from top

          console.log('Save PDF Handler: Adding image to PDF...');
          pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
          console.log('Save PDF Handler: Calling pdf.save()...');
          pdf.save('document.pdf');
          console.log('Save PDF Handler: pdf.save() finished.');
           // Hide loading indicator?

           pdf.save('document.pdf');
           console.log('Save PDF Handler: pdf.save() finished.');
           toast.success('PDF saved successfully!', { autoClose: 3000 });
      } catch (error) {
          console.error('Save PDF Handler: ERROR during PDF generation:', error);
          alert('An error occurred while generating the PDF. Please check the console.'); // User feedback
           // Hide loading indicator?
      }
    };

    // insertSection now only works if the context allows it (e.g., for 'letter' template)
    const insertContentIntoEditor = (content: string) => { insertSection(content); };

    // --- Save/Load Handlers ---
    const handleSaveDocument = () => {
        // Gather current state - requires access to context values
        const currentState = { formData, editorContent, selectedTemplate, templateData };
        const savedDoc = saveDocumentToStorage(currentState);
        if (savedDoc) {
            setSavedDocuments(prev => [savedDoc, ...prev.filter(d => d.id !== savedDoc.id)].slice(0, 10));
//            alert(`Document "${savedDoc.formData.subject || savedDoc.templateData?.declarantName || 'Untitled'}" saved!`);
            toast.success(`Document "${savedDoc.formData.subject || savedDoc.templateData?.declarantName || 'Untitled'}" saved!`);
        }
    };

    const handleLoadDocument = (docToLoad: SavedDocument) => {
        updateFormData(docToLoad.formData);
        setEditorContent(docToLoad.editorContent);
        setTemplateData(docToLoad.templateData || {});
        // IMPORTANT: Set selectedTemplate *last* to trigger correct component rendering
        setSelectedTemplate(docToLoad.selectedTemplate);
        setShowLoadModal(false);
//        alert(`Document "${docToLoad.formData.subject || docToLoad.templateData?.declarantName || 'Untitled'}" loaded.`);
        toast.info(`Document "${docToLoad.formData.subject || docToLoad.templateData?.declarantName || 'Untitled'}" loaded.`); // <-- Use toast info
    };

    const handleDeleteDocument = (idToDelete: string) => {
      if (window.confirm("Are you sure you want to delete this saved document?")) {
          deleteDocumentFromStorage(idToDelete);
          // Update the list in state
          setSavedDocuments(prev => prev.filter(doc => doc.id !== idToDelete));
          toast.warn("Document deleted."); // <-- Use toast warn/info
      }
    };


    // --- Dynamically Select Component ---
    const ActiveTemplateComponent = selectedTemplate ? templateComponentMap[selectedTemplate.component] : null;

    // --- Determine which fields to show in sidebar ---
    const specificFields: TemplateField[] | null = selectedTemplate?.id === 'poa_revocation' ? [ // Hardcode fields for specific templates for now
         { id: "declarantName", label: "Declarant Name", type: "text", placeholder: "Full Name"},
         { id: "poaExecutionDate", label: "Original POA Execution Date", type: "date"},
         { id: "agentName", label: "Attorney-in-Fact/Agent Name", type: "text", placeholder: "Full Name"},
         { id: "revocationDate", label: "Revocation Signing Date", type: "date"},
         { id: "principalSSN", label: "Principal's SSN (Optional)", type: "text", placeholder: "XXX-XX-XXXX"}
      ] : null; // Add checks for other structured templates (Affidavit, etc.)


    return (
        <div className="app-container">
            <header className="app-header"><h1>Customer Comminucation Management</h1></header>

            <main className="app-main">
                <aside className="app-sidebar">
                    {/* Always show Template Selector */}
                    <TemplateSelector />

                    {/* Show common fields (like subject) */}
                    <UserInputForm />

                    {/* Show template-specific input fields IF defined */}
                    {specificFields && <TemplateSpecificForm fields={specificFields} />}

                    {/* Only show common sections for templates that support it (e.g., letter) */}
                    {selectedTemplate?.id === 'letter' && (
                         <CommonSectionsPanel insertContent={insertContentIntoEditor} />
                    )}

                    <div className="save-load-actions">
                        <button onClick={handleSaveDocument} style={{backgroundColor: '#28a745'}}>Save Current</button>
                        <button onClick={() => setShowLoadModal(true)} disabled={savedDocuments.length === 0}>Load Saved ({savedDocuments.length})</button>
                    </div>
                </aside>

                <section className="app-content">
                    {/* --- Render the selected template component --- */}
                    <Suspense fallback={<div className="loading-template">Loading Template...</div>}>
                        {ActiveTemplateComponent ? (
                            <ActiveTemplateComponent printRef={printRef} />
                        ) : (
                            <div className="placeholder-preview">Please select a template.</div>
                        )}
                    </Suspense>
                    {/* --- End Component Rendering --- */}

                    <div className="action-buttons">
                       {/* --- Use the basic onClick to call handlePrint --- */}
                       <button
                          onClick={() => {
                              console.log('Print Button onClick: Calling handlePrint...');
                              console.log('Type of handlePrint before call:', typeof handlePrint); // Add this log
                              if (typeof handlePrint === 'function') {
                                  // --- Store the result, even if not used ---
                                  const result = handlePrint();
                                  console.log('handlePrint was called. Result:', result); // See what it returns
                              } else {
                                  console.error('handlePrint is not a function or undefined!');
                              }
                              console.log('Print Button onClick: Finished call attempt.');
                          }}
                        >
                          Print Document
                        </button>
                        <button onClick={handleSavePdf}>Save as PDF</button>
                    </div>
                </section>
            </main>

             {/* --- Simple Load Modal --- */}
            {showLoadModal && (
                // --- PASTE THE ACTUAL MODAL JSX HERE ---
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Load Saved Document</h2>
                        {savedDocuments.length > 0 ? (
                            <ul>
                                {savedDocuments.map(doc => (
                                    <li key={doc.id}>
                                        {/* Use templateData field for POA name if available */}
                                        <span>{doc.formData.subject || doc.templateData?.declarantName || 'Untitled'} ({new Date(doc.savedAt).toLocaleTimeString()})</span>
                                        <div>
                                            <button onClick={() => handleLoadDocument(doc)}>Load</button>
                                            <button onClick={() => handleDeleteDocument(doc.id)} style={{backgroundColor: '#dc3545', marginLeft: '5px'}}>Delete</button>
                                         </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No documents saved yet.</p>
                        )}
                        <button onClick={() => setShowLoadModal(false)} style={{marginTop: '15px'}}>Close</button>
                    </div>
                </div>
                 // --- END MODAL JSX ---
            )}
             {/* --- End Modal --- */}

            <footer className="app-footer"><p>© {new Date().getFullYear()} Kiran Prasad</p></footer>

            {/* --- 2. Add ToastContainer (place once, often near the end) --- */}
            <ToastContainer
                position="bottom-right" // Or "top-right", "bottom-left", etc.
                autoClose={3000} // Close after 3 seconds
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light" // Or "dark", "colored"
            />
             {/* --- End ToastContainer --- */}

        </div>
    );
}

export default App;