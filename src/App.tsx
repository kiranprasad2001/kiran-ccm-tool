import React, { useRef, useState, useEffect, lazy, Suspense, useMemo } from 'react'; // Added lazy, Suspense
import { useDocument } from './contexts/DocumentContext';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import default CSS
import {
    saveDocumentToStorage,
    loadDocumentsFromStorage,
    deleteDocumentFromStorage
} from './utils/localStorageUtils';
import { TemplateField, TemplateComponentProps, SavedDocument } from './types';

// Standard Components
import UserInputForm from './components/UserInputForm'; // For common fields like Subject
import TemplateSelector from './components/TemplateSelector';
import CommonSectionsPanel from './components/CommonSectionsPanel';
import TemplateSpecificForm from './components/TemplateSpecificForm'; // To render inputs for structured templates

import Sidebar from './components/Sidebar'; // Import the Sidebar component

import './styles/App.css';

// --- Lazy Load Template Components ---
const templateComponentMap: Record<string, React.LazyExoticComponent<React.FC<TemplateComponentProps>>> = {
  StandardLetterTemplate: lazy(() => import('./components/templates/StandardLetterTemplate')),
  POARevocationTemplate: lazy(() => import('./components/templates/POARevocationTemplate')),
  EmploymentApplicationTemplate: lazy(() => import('./components/templates/EmploymentApplicationTemplate')),
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
        formData, editorContent, templateData, updateFormData, setEditorContent, setSelectedTemplate, insertSection, selectedLOB, allTemplates, searchTerm,
    } = useDocument();

    const [savedDocuments, setSavedDocuments] = useState<SavedDocument[]>([]);
    const [showLoadModal, setShowLoadModal] = useState(false);

    useEffect(() => { setSavedDocuments(loadDocumentsFromStorage()); }, []);

    // --- Calculate Available Templates ---
    const availableTemplates = useMemo(() => {
        if (!selectedLOB) return []; // No LOB selected, show nothing
        let filtered = allTemplates.filter(t => t.lobId === selectedLOB.id);
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(t => t.name.toLowerCase().includes(lowerSearchTerm));
        }
        return filtered;
    }, [allTemplates, selectedLOB, searchTerm]);

    // Utility function to toggle toolbar visibility
    const toggleToolbarForPrint = (hide: boolean) => {
        if (printRef.current) {
            // Find the Quill toolbar *within* the printRef element
            const toolbarElement = printRef.current.querySelector('.ql-toolbar');
            if (toolbarElement) {
                if (hide) {
                    toolbarElement.classList.add('print-hide');
                    console.log('Print: Hiding toolbar');
                } else {
                    toolbarElement.classList.remove('print-hide');
                    console.log('Print: Showing toolbar');
                }
            } else {
                console.log('Print: Toolbar element not found within printRef');
            }
        }
    };

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
      onBeforeGetContent: () => {
        console.log('Print -> onBeforeGetContent');
        toggleToolbarForPrint(true);
        return Promise.resolve();
      },
//      onBeforePrint: () => console.log('Print (contentRef) -> onBeforePrint'),
      onAfterPrint: () => {
        console.log('Print -> onAfterPrint');
        toggleToolbarForPrint(false);
      },

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

      // Find toolbar within the element to be captured
      const toolbarElement = element.querySelector('.ql-toolbar');

      // Add a try/catch block for better error reporting
      try {
          // --- HIDE TOOLBAR ---
          if (toolbarElement) {
            toolbarElement.classList.add('print-hide');
            console.log('PDF: Hiding toolbar');
          }
        
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
//          alert('An error occurred while generating the PDF. Please check the console.'); // User feedback
          toast.error("Error generating PDF. Check console.");
          // Hide loading indicator?
      } finally {
        // --- ENSURE TOOLBAR IS SHOWN AGAIN ---
            if (toolbarElement) {
                toolbarElement.classList.remove('print-hide');
                console.log('PDF: Showing toolbar');
            }
        }
    };

    // insertSection now only works if the context allows it (e.g., for 'letter' template)
    const insertContentIntoEditor = (content: string) => { insertSection(content); };

    // --- Save/Load Handlers ---
    const handleSaveDocument = () => {
        // currentState now correctly matches SavedDocumentData
        const currentState = { formData, editorContent, selectedTemplate, templateData };
        const savedDoc = saveDocumentToStorage(currentState); // Save to storage
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

    if (selectedTemplate && !ActiveTemplateComponent) {
        console.error(`Template component "${selectedTemplate.component}" not found in map!`);
        // Optionally render an error message component
    }  

    return (
        <div className="app-container">
            <header className="app-header"><h1>Customer Communication Management</h1></header>

            <main className="app-main">
{/*                <aside className="app-sidebar"> */}
                    {/* Always show Template Selector */}
{/*                     <TemplateSelector /> */}

                    {/* Show common fields (like subject) */}
{/*                     <UserInputForm /> */}

                    {/* Show template-specific input fields IF defined */}
{/*                     {specificFields && <TemplateSpecificForm fields={specificFields} />} */}

                    {/* Only show common sections for templates that support it (e.g., letter) */}
{/*                     {selectedTemplate?.id === 'letter' && (
                         <CommonSectionsPanel insertContent={insertContentIntoEditor} />
                    )} */}
{/* 
                    <div className="save-load-actions">
                        <button onClick={handleSaveDocument} style={{backgroundColor: '#28a745'}}>Save Current</button>
                        <button onClick={() => setShowLoadModal(true)} disabled={savedDocuments.length === 0}>Load Saved ({savedDocuments.length})</button>
                    </div>
                </aside> */}

                <Sidebar
                    availableTemplates={availableTemplates}
                    handleSaveDocument={handleSaveDocument}
                    handleLoadDocumentClick={() => setShowLoadModal(true)}
                    insertContentIntoEditor={insertContentIntoEditor}
                    savedDocumentsCount={savedDocuments.length}
                />

                <section className="app-content">
                    {/* --- Render Active Template --- */}
                    <Suspense fallback={<div className="loading-template">Loading Template...</div>}>
                        {ActiveTemplateComponent ? (
                            <ActiveTemplateComponent printRef={printRef} />
                        ) : (
                            <div className="placeholder-preview">
                                {selectedLOB ? "Please select a template." : "Please select a Line of Business."}
                            </div>
                        )}
                    </Suspense>
                    {/* --- End Component Rendering --- */}

                    {/* --- Action Buttons --- */}
                    <div className="action-buttons">
                        {/* Use trigger ref or onClick for print */}
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