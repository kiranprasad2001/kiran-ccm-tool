// src/components/templates/EmploymentApplicationTemplate.tsx
import React from 'react';
import { useDocument } from '../../contexts/DocumentContext';
import { TemplateComponentProps } from '../../types';

// --- Helper for Checkbox/Radio --- (Optional but cleaner)
const useFormInput = () => {
    const { templateData, updateTemplateData } = useDocument();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const checked = isCheckbox ? (e.target as HTMLInputElement).checked : undefined;

        // Handle simple text/date/textarea vs checkbox
        // For Yes/No radio buttons sharing a name, 'value' will be 'yes' or 'no'
        updateTemplateData(name, isCheckbox ? checked : value);
    };

    return { templateData, handleChange };
};


const EmploymentApplicationTemplate: React.FC<TemplateComponentProps> = ({ printRef }) => {
    // Use the custom hook or directly use context
    const { templateData, handleChange } = useFormInput();
    // const { templateData, updateTemplateData } = useDocument();
    // const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => { ... }

    return (
        // Root element for print/PDF capture
        <div ref={printRef as React.RefObject<HTMLDivElement>} className="template-form-table document-render-area">

            {/* --- Header Section --- */}
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                <img src="/kiran-ccm-tool/logo192.png" alt="US Seal" style={{ width: '80px', marginBottom: '10px' }} /> {/* Add logo */}
                <h3>U.S. Mission</h3>
                <h4>APPLICATION FOR EMPLOYMENT AS A LOCALLY EMPLOYED STAFF OR FAMILY MEMBER</h4>
                <p style={{ fontSize: '0.8em' }}>(This application is for positions recruited by the U.S. Mission...)</p>
            </div>
            <div style={{ fontSize: '0.7em', textAlign: 'right', border: '1px solid #ccc', padding: '3px', marginBottom: '10px' }}>
                OMB APPROVAL NO. 1405-0189<br />
                EXPIRES: 12/31/2012<br />
                ESTIMATED BURDEN: 1 Hour
            </div>


            {/* --- Position Section --- */}
            <h4 className="form-section-header">POSITION</h4>
            <table className="form-table">
                <tbody>
                    <tr>
                        <td style={{ width: '70%' }}>
                            <label htmlFor="positionTitle">1. Position Title</label><br />
                            <input type="text" id="positionTitle" name="positionTitle" value={templateData.positionTitle || ''} onChange={handleChange} />
                        </td>
                        <td style={{ width: '30%' }}>
                            <label htmlFor="grades">2. Grades</label><br />
                            <input type="text" id="grades" name="grades" value={templateData.grades || ''} onChange={handleChange} />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label htmlFor="vacancyNum">3. Vacancy Announcement Number (If known)</label><br />
                            <input type="text" id="vacancyNum" name="vacancyNum" value={templateData.vacancyNum || ''} onChange={handleChange} />
                        </td>
                        <td>
                            <label htmlFor="dateAvailable">4. Date Available for Work (mm-dd-yyyy)</label><br />
                            {/* Use text for flexibility or type="date" */}
                            <input type="text" id="dateAvailable" name="dateAvailable" value={templateData.dateAvailable || ''} onChange={handleChange} placeholder="mm-dd-yyyy"/>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* --- Personal Information Section --- */}
            <h4 className="form-section-header">PERSONAL INFORMATION</h4>
            <table className="form-table">
                 <tbody>
                    <tr>
                        <td style={{ width: '40%' }}>
                            <label htmlFor="lastName">5. Last Name(s) / Surnames</label><br />
                            <input type="text" id="lastName" name="lastName" value={templateData.lastName || ''} onChange={handleChange} />
                        </td>
                        <td style={{ width: '35%' }}>
                             <label htmlFor="firstName">First Name</label><br />
                             <input type="text" id="firstName" name="firstName" value={templateData.firstName || ''} onChange={handleChange} />
                        </td>
                         <td style={{ width: '25%' }}>
                             <label htmlFor="middleName">Middle Name</label><br />
                             <input type="text" id="middleName" name="middleName" value={templateData.middleName || ''} onChange={handleChange} />
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={3}> {/* Example using colSpan */}
                            <label htmlFor="otherNames">6. Other Names Used</label><br />
                            <input type="text" id="otherNames" name="otherNames" value={templateData.otherNames || ''} onChange={handleChange} />
                        </td>
                    </tr>
                     <tr>
                        <td>
                            <label htmlFor="dob">7. Date of Birth (mm-dd-yyyy)</label><br />
                             <input type="text" id="dob" name="dob" value={templateData.dob || ''} onChange={handleChange} placeholder="mm-dd-yyyy"/>
                        </td>
                        <td colSpan={2}>
                            <label htmlFor="placeOfBirth">8. Place of Birth</label><br />
                             <input type="text" id="placeOfBirth" name="placeOfBirth" value={templateData.placeOfBirth || ''} onChange={handleChange} />
                        </td>
                    </tr>
                    {/* ... Continue building rows and cells for fields 9, 10, 11 ... */}

                     <tr>
                        <td colSpan={3}>
                            <label htmlFor="address">9. Current Address</label><br />
                            <textarea id="address" name="address" value={templateData.address || ''} onChange={handleChange} rows={3}></textarea>
                        </td>
                    </tr>
                    {/* ... Field 10 Phone numbers - might need multiple inputs ... */}
                     <tr>
                        <td colSpan={3}>
                            <label htmlFor="email">11. E-mail Address</label><br />
                             <input type="email" id="email" name="email" value={templateData.email || ''} onChange={handleChange} />
                        </td>
                    </tr>

                     {/* --- Example Yes/No using Radio Buttons --- */}
                     <tr>
                        <td colSpan={3}>
                            <label>12. Are you a U.S. Citizen?</label>
                            <div className="radio-group">
                                <label>
                                    <input type="radio" name="usCitizen" value="yes" checked={templateData.usCitizen === 'yes'} onChange={handleChange} /> Yes
                                </label>
                                <label>
                                    <input type="radio" name="usCitizen" value="no" checked={templateData.usCitizen === 'no'} onChange={handleChange} /> No
                                </label>
                            </div>
                        </td>
                    </tr>
                     {/* ... Continue for fields 13, 14, 15 using appropriate inputs (text, radio) ... */}

                </tbody>
            </table>

            {/* ... Other sections ... */}

        </div>
    );
};

export default EmploymentApplicationTemplate;