import React, { useState, useEffect } from 'react';
import { useDocument } from '../contexts/DocumentContext';

const TemplateSearch: React.FC = () => {
    const { searchTerm, setSearchTerm, selectedLOB } = useDocument();
    // Local state for debouncing
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

    // Update local state when global term changes (e.g., on LOB change)
    useEffect(() => {
        setLocalSearchTerm(searchTerm);
    }, [searchTerm]);

    // Debounce effect
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchTerm(localSearchTerm); // Update global context after delay
        }, 300); // 300ms debounce

        // Cleanup function
        return () => {
            clearTimeout(handler);
        };
    }, [localSearchTerm, setSearchTerm]);


    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
         setLocalSearchTerm(event.target.value);
    };

    // Only show search if an LOB is selected
    if (!selectedLOB) {
        return null;
    }

    return (
        <div className="form-group">
            <label htmlFor="template-search">Search Templates:</label>
            <input
                type="search"
                id="template-search"
                placeholder={`Search in ${selectedLOB.name}...`}
                value={localSearchTerm}
                onChange={handleChange}
            />
        </div>
    );
};

export default TemplateSearch;