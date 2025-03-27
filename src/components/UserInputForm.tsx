import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDocument } from '../contexts/DocumentContext';
import { DocumentData } from '../types';

// Validation Schema
const schema = yup.object().shape({
    subject: yup.string().required('Subject is required').max(100, 'Subject too long'),
    recipientName: yup.string().required('Recipient name is required').min(2, 'Name too short'), // <-- ADD schema rule
}).required();


const UserInputForm: React.FC = () => {
    const { formData, updateFormData } = useDocument();
    const { register, handleSubmit, formState: { errors }, watch } = useForm<DocumentData>({
        resolver: yupResolver(schema),
        defaultValues: formData // Pre-populate form if needed
    });

    // Watch for changes and update context (debounced would be better for performance)
    React.useEffect(() => {
        const subscription = watch((value) => {
            updateFormData(value as DocumentData);
        });
        return () => subscription.unsubscribe();
    }, [watch, updateFormData]);

    // We don't really need a submit handler if updates are live,
    // but it's good practice if you wanted explicit saving later.
    const onSubmit: SubmitHandler<DocumentData> = data => {
         console.log('Form data (explicit submit, likely not needed here):', data);
         // updateFormData(data); // Already handled by watch
    };

    return (
        // Use handleSubmit only if you need explicit submission logic
        // <form onSubmit={handleSubmit(onSubmit)}>
        <form className="user-input-form">
            <h2>Document Details</h2>
            <div className="form-group">
                <label htmlFor="recipientName">Recipient Name:</label>
                <input
                    id="recipientName"
                    {...register('recipientName')}
                />
                {errors.recipientName && <p className="error">{errors.recipientName.message}</p>}
            </div>

            <div className="form-group">
                <label htmlFor="subject">Subject:</label>
                <input
                    id="subject"
                    {...register('subject')}
                />
                {errors.subject && <p className="error">{errors.subject.message}</p>}
            </div>

             {/* Add more form fields here */}

            {/* <button type="submit">Update Details (if not live)</button> */}
        </form>
    );
};

export default UserInputForm;