import React from 'react';
import { useDocument } from '../contexts/DocumentContext';
import { LOB } from '../types';

const LOBSelector: React.FC = () => {
    const { lobs, selectedLOB, setSelectedLOB } = useDocument();

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const lobId = event.target.value;
        const lob = lobs.find(l => l.id === lobId) || null;
        setSelectedLOB(lob);
    };

    return (
        <div className="form-group">
            <label htmlFor="lob-selector">Line of Business:</label>
            <select
                id="lob-selector"
                value={selectedLOB?.id || ''}
                onChange={handleChange}
            >
                <option value="">-- Select LOB --</option>
                {lobs.map(lob => (
                    <option key={lob.id} value={lob.id}>
                        {lob.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default LOBSelector;