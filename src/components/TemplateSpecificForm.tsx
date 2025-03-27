import React from 'react';
import { useDocument } from '../contexts/DocumentContext';
// Make sure TemplateField is exported from types.ts or define it here if preferred
import { TemplateField } from '../types';

interface TemplateSpecificFormProps {
    fields: TemplateField[]; // Expects an array of field definitions
}

const TemplateSpecificForm: React.FC<TemplateSpecificFormProps> = ({ fields }) => {
    // Get templateData and the updater function from context
    const { templateData, updateTemplateData } = useDocument();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        // Basic handling for checkbox type if added later
        // const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        // Update the specific field in the context's templateData state
        updateTemplateData(name, value);
    };

    // If no fields are passed, don't render anything
    if (!fields || fields.length === 0) {
        return null;
    }

    return (
        <div className="template-specific-form">
            <h4>Template Specific Details</h4> {/* Title for this section */}
            {fields.map((field) => (
                <div className="form-group" key={field.id}>
                    <label htmlFor={field.id}>{field.label}:</label>
                    {/* Render different input types based on field.type */}
                    {field.type === 'textarea' ? (
                        <textarea
                            id={field.id}
                            name={field.id} // name attribute is used in handleChange
                            value={templateData[field.id] || ''} // Get value from context
                            onChange={handleChange}
                            placeholder={field.placeholder || ''}
                            rows={3}
                            required={field.required} // Add required attribute if needed
                        />
                    ) : (
                        <input
                            id={field.id}
                            name={field.id} // name attribute is used in handleChange
                            type={field.type} // Uses 'text', 'date', 'number' etc.
                            value={templateData[field.id] || ''} // Get value from context
                            onChange={handleChange}
                            placeholder={field.placeholder || ''}
                            required={field.required} // Add required attribute if needed
                        />
                    )}
                    {/* Potential location for validation messages */}
                </div>
            ))}
        </div>
    );
};

export default TemplateSpecificForm;