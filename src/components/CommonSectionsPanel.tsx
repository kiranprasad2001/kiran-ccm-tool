import React, { useState, useEffect } from 'react'; // Remove useEffect if not needed elsewhere
import { useDocument } from '../contexts/DocumentContext';
import { CommonSection } from '../types';
// Import the JSON data directly
import sectionsData from '../data/commonSections.json'; // <-- Use the import

interface CommonSectionsPanelProps {
    insertContent: (content: string) => void;
}

// Cast the imported data to the correct type
const loadedSections: CommonSection[] = sectionsData as CommonSection[];

const CommonSectionsPanel: React.FC<CommonSectionsPanelProps> = ({ insertContent }) => {
    // Remove loading and error states if fetch is removed
    // const [sections, setSections] = useState<CommonSection[]>([]);
    // const [loading, setLoading] = useState<boolean>(true);
    // const [error, setError] = useState<string | null>(null);

    const { formData } = useDocument();

    // REMOVE the entire useEffect block that performs the fetch

    const handleInsert = (section: CommonSection) => {
        let contentToInsert = section.content;
        contentToInsert = contentToInsert.replace(/\[Recipient Name\]/g, formData.recipientName || '_____');
        contentToInsert = contentToInsert.replace(/\[Subject\]/g, formData.subject || '_____');
        insertContent(contentToInsert);
    };

    // No need for loading/error checks if using direct import
    // if (loading) return <p>Loading sections...</p>;
    // if (error) return <p style={{ color: 'orange' }}>{error}</p>;

    return (
        <div className="common-sections-panel">
            <h3>Reusable Sections</h3>
            {/* Directly map over the imported data */}
            {loadedSections.length === 0 && <p>No sections available.</p>}
            <ul>
                {loadedSections.map(section => (
                    <li key={section.id}>
                        <span>{section.title}</span>
                        <button onClick={() => handleInsert(section)} title={`Insert: ${section.title}`}>
                            Insert
                        </button>
                    </li>
                ))}
            </ul>
            {/* Styles can remain in App.css */}
        </div>
    );
};

export default CommonSectionsPanel;