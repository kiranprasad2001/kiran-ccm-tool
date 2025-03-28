// src/components/Sidebar.tsx
import React from 'react';
import { useDocument } from '../contexts/DocumentContext';
import { Template, TemplateField } from '../types'; // Import TemplateField

// Import Sidebar Components
import LOBSelector from './LOBSelector';
import TemplateSearch from './TemplateSearch';
import TemplateSelector from './TemplateSelector';
import UserInputForm from './UserInputForm';
import TemplateSpecificForm from './TemplateSpecificForm';
import CommonSectionsPanel from './CommonSectionsPanel';

interface SidebarProps {
    availableTemplates: Template[]; // Filtered list
    handleSaveDocument: () => void;
    handleLoadDocumentClick: () => void; // Renamed to avoid confusion
    insertContentIntoEditor: (content: string) => void;
    savedDocumentsCount: number;
}

// --- Define the field sets for templates that need them ---
// It's often cleaner to define these constants outside the component
const poaRevocationFields: TemplateField[] = [
    { id: "declarantName", label: "Declarant Name", type: "text", placeholder: "Full Name"},
    { id: "poaExecutionDate", label: "Original POA Execution Date", type: "date"},
    { id: "agentName", label: "Attorney-in-Fact/Agent Name", type: "text", placeholder: "Full Name"},
    { id: "revocationDate", label: "Revocation Signing Date", type: "date"},
    { id: "principalSSN", label: "Principal's SSN (Optional)", type: "text", placeholder: "XXX-XX-XXXX"}
];

// Define field sets for other templates as needed
const loanOfferFields: TemplateField[] = [
    { id: "loanAmount", label: "Loan Amount", type: "number", placeholder: "e.g., 50000" },
    { id: "interestRate", label: "Interest Rate (%)", type: "number", placeholder: "e.g., 5.5" },
    // Add more loan offer fields...
];
const accountUpdateFields: TemplateField[] = [
     { id: "accountNumber", label: "Account Number", type: "text", placeholder: "Enter account #" },
     { id: "updateReason", label: "Reason for Update", type: "textarea", placeholder: "Describe change..." },
     // Add more account update fields...
];
// --- End Field Definitions ---

const Sidebar: React.FC<SidebarProps> = ({
    availableTemplates,
    handleSaveDocument,
    handleLoadDocumentClick,
    insertContentIntoEditor,
    savedDocumentsCount
}) => {
    const { selectedTemplate } = useDocument();

    // --- Determine which fields to show in sidebar ---
    // This logic could be improved - maybe store field definitions with the template component?
    // For now, keep the hardcoded check based on the template definition flag/id
    let specificFields: TemplateField[] | null = null;
    // Check the flag first
    if (selectedTemplate?.hasSpecificFields) {
        // Use a switch or if/else if to determine WHICH fields to show
        switch (selectedTemplate.id) {
            case 'biz_poa_revocation':
            // case 'pers_poa_revocation': // If you add a personal one
                specificFields = poaRevocationFields;
                break;
            case 'biz_loan_offer':
                specificFields = loanOfferFields;
                break;
            case 'pers_account_update':
                specificFields = accountUpdateFields;
                break;
            // Add cases for any other template IDs that have specific fields
            default:
                console.warn(`Sidebar: Fields requested but not defined for ${selectedTemplate.id}`);
//                console.warn(`Template '${selectedTemplate.name}' (${selectedTemplate.id}) is marked 'hasSpecificFields' but no field definition was found in Sidebar.tsx.`);
                // Optionally set specificFields to an empty array or a default "not configured" message field
                // specificFields = [];
                break;
        }
    }


    return (
        <aside className="app-sidebar">
            <LOBSelector />
            <TemplateSearch />
            {/* Pass filtered templates to selector */}
            <TemplateSelector availableTemplates={availableTemplates} />

            {/* General Fields */}
            <UserInputForm />

            {/* Show template-specific input fields IF defined */}
            {specificFields && <TemplateSpecificForm fields={specificFields} />}

            {/* Only show common sections for templates that support it */}
            {selectedTemplate?.usesQuill && (
                <CommonSectionsPanel insertContent={insertContentIntoEditor} />
            )}

            {/* Save/Load */}
            <div className="save-load-actions">
                <button onClick={handleSaveDocument} style={{ backgroundColor: '#28a745' }}>Save Current</button>
                <button onClick={handleLoadDocumentClick} disabled={savedDocumentsCount === 0}>Load Saved ({savedDocumentsCount})</button>
            </div>
        </aside>
    );
};

export default Sidebar;