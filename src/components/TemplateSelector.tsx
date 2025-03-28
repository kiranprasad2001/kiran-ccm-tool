import React, { useState, useEffect } from 'react';
import { useDocument } from '../contexts/DocumentContext';
import { Template } from '../types';
import defaultTemplates from '../data/templates.json'; // Fallback import

// --- Define props for the component ---
interface TemplateSelectorProps {
    availableTemplates: Template[];
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ availableTemplates }) => {
    const { selectedTemplate, setSelectedTemplate, selectedLOB } = useDocument();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

/*     useEffect(() => {
         // Simulate fetching templates (replace with actual API call if needed)
        try {
             // For simplicity, using the imported JSON directly here
             // In a real app: fetch('/api/templates').then(...)
             setTemplates(defaultTemplates as Template[]);
             setLoading(false);
             // Set a default template if none selected
             if (!selectedTemplate && defaultTemplates.length > 0) {
                 setSelectedTemplate(defaultTemplates[0]);
             }
        } catch (error) {
            console.error("Failed to load templates:", error);
            setLoading(false);
             // Handle error state if necessary
        }
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount */


    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const templateId = event.target.value;
        // Find in the passed availableTemplates
        const template = availableTemplates.find(t => t.id === templateId) || null;
        setSelectedTemplate(template);
    };

    // Don't render if no LOB is selected or no templates are available for it
    if (!selectedLOB || availableTemplates.length === 0) {
         // Optionally show a message if LOB selected but no results after search
         if (selectedLOB && availableTemplates.length === 0) {
             return <div className="form-group"><p>No templates found for this LOB/search.</p></div>;
         }
         return null; // Hide if no LOB selected
    }

    return (
        <div className="template-selector form-group">
            <label htmlFor="template">Select Template:</label>
            <select
                id="template"
                value={selectedTemplate?.id || ''}
                onChange={handleChange}
//                disabled={templates.length === 0}
            >
                <option value="" disabled>-- Select Template --</option>
                {templates.map(template => (
                    <option key={template.id} value={template.id}>
                        {template.name}
                    </option>
                ))}
                {availableTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                        {template.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default TemplateSelector;