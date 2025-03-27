import React from 'react';
import { useDocument } from '../../contexts/DocumentContext';
import { TemplateComponentProps } from '../../types'; // Import shared prop type

const POARevocationTemplate: React.FC<TemplateComponentProps> = ({ printRef }) => {
    const { templateData, updateTemplateData } = useDocument();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateTemplateData(e.target.name, e.target.value);
    };

    // Format date for display/rendering if needed (e.g., from YYYY-MM-DD)
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '__________';
        try {
           return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', { // Adjust locale and options
               year: 'numeric',
               month: 'long',
               day: 'numeric',
           });
        } catch (e) { return dateString; } // Fallback
    };

    return (
        // This outer div is what gets printed/PDF'd
        <div ref={printRef as React.RefObject<HTMLDivElement>} className="template-poa document-render-area"> 
            {/* 1. Inputs Section (Optional - could be in sidebar) */}
            {/* If inputs are *within* the preview/print area */}
            {/* <div className="poa-inputs form-section">
                <h3>POA Revocation Details</h3>
                <div className="form-group">
                    <label htmlFor="declarantName">Declarant Name:</label>
                    <input type="text" id="declarantName" name="declarantName" value={templateData.declarantName || ''} onChange={handleChange} />
                </div>
                 <div className="form-group">
                    <label htmlFor="poaExecutionDate">Original POA Execution Date:</label>
                    <input type="date" id="poaExecutionDate" name="poaExecutionDate" value={templateData.poaExecutionDate || ''} onChange={handleChange} />
                </div>
                 <div className="form-group">
                    <label htmlFor="agentName">Attorney-in-Fact/Agent Name:</label>
                    <input type="text" id="agentName" name="agentName" value={templateData.agentName || ''} onChange={handleChange} />
                </div>
                 <div className="form-group">
                    <label htmlFor="revocationDate">Revocation Signing Date:</label>
                    <input type="date" id="revocationDate" name="revocationDate" value={templateData.revocationDate || ''} onChange={handleChange} />
                </div>
                 <div className="form-group">
                    <label htmlFor="principalSSN">Principal's SSN (Optional):</label>
                    <input type="text" id="principalSSN" name="principalSSN" value={templateData.principalSSN || ''} onChange={handleChange} />
                </div>
            </div>
            <hr/> */}

            {/* 2. Rendered Document Structure */}
            <div className="poa-content">
                <h2 style={{ textAlign: 'center', textDecoration: 'underline' }}>REVOCATION OF POWER OF ATTORNEY</h2>
                <br />
                <p>
                    I, <strong>{templateData.declarantName || '[Declarant Name]'}</strong>, Declarant,
                    having executed a General Durable Power of Attorney on the date <strong>{formatDate(templateData.poaExecutionDate)}</strong>,
                    naming <strong>{templateData.agentName || '[Agent Name]'}</strong> my attorney-in-fact/agent,
                    do hereby revoke that Power of Attorney pursuant to its explicit provision that it may be revoked by me by written
                    instrument signed by me and delivered to my attorney-in-fact/Agent.
                </p>
                <p>
                    This is my written revocation of the above referenced General Durable Power of Attorney and I
                    am providing a copy of it to my attorney-in-fact/Agent.
                </p>
                <p>
                    Signed this date <strong>{formatDate(templateData.revocationDate)}</strong>
                </p>
                <br />
                <p>(Principal's Signature)</p>
                <p>_______________________________</p>
                <br />
                <p>(Principal's Social Security Number)</p>
                <p><strong>{templateData.principalSSN || '[XXX-XX-XXXX]'}</strong></p>
                <br />
                <p>
                    The principal is personally known to me and I believe the principal to be of sound mind. I am
                    eighteen (18) years of age or older. I am not related to the principal by blood or marriage, or
                    related to the attorney-in-fact by blood or marriage. The principal has declared to me that this
                    instrument is his revocation of a power of attorney granting to a named attorney-in-fact the
                    power and authority specified therein, and that he has willingly made and executed it as his free
                    and voluntary act for the purposes herein expressed.
                </p>
                <br />
                <p>Witness:</p>
                <p>_______________________________</p>
            </div>
        </div>
    );
};

export default POARevocationTemplate;