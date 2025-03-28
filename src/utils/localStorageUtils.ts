//import { DocumentState, DocumentData, Template } from '../types';
import { SavedDocumentData, SavedDocument, LOB, Template, DocumentData } from '../types'; // <-- Import the new types

const STORAGE_KEY = 'ccmToolDocuments';

// Type for the data we store for a single saved document
/* export interface SavedDocument extends DocumentState {
    id: string; // Unique ID for the saved document
    savedAt: number; // Timestamp
} */

// Type for the overall structure in localStorage
interface StorageData {
    documents: SavedDocument[];
}

// Helper to get all saved documents
export const loadDocumentsFromStorage = (): SavedDocument[] => {
    try {
        const rawData = localStorage.getItem(STORAGE_KEY);
        if (!rawData) {
            return [];
        }
        const data: StorageData = JSON.parse(rawData);
        // Sort by saved date, newest first
        return data.documents.sort((a, b) => b.savedAt - a.savedAt);
    } catch (error) {
        console.error("Error loading documents from localStorage:", error);
        return [];
    }
};

// Helper to save the current document state
export const saveDocumentToStorage = (currentState: SavedDocumentData): SavedDocument | null => {
    try {
        const existingDocuments = loadDocumentsFromStorage();
        const newDocument: SavedDocument = {
            ...currentState,
            id: `doc-${Date.now()}-${Math.random().toString(16).substring(2, 8)}`, // Simple unique ID
            savedAt: Date.now(),
        };

        const updatedDocuments: StorageData = {
            // Keep a limited number of saves if desired (e.g., last 10)
            documents: [newDocument, ...existingDocuments].slice(0, 10),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDocuments));
        console.log("Document saved:", newDocument.id);
        return newDocument;
    } catch (error) {
        console.error("Error saving document to localStorage:", error);
        // Handle potential storage limit errors
        if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
            alert("Could not save document. Browser storage might be full.");
        } else {
            alert("An error occurred while saving the document.");
        }
        return null;
    }
};

// Helper to delete a document
export const deleteDocumentFromStorage = (idToDelete: string): void => {
    try {
        const existingDocuments = loadDocumentsFromStorage();
        const filteredDocuments = existingDocuments.filter(doc => doc.id !== idToDelete);
        const updatedDocuments: StorageData = { documents: filteredDocuments };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDocuments));
        console.log("Document deleted:", idToDelete);
    } catch (error) {
        console.error("Error deleting document from localStorage:", error);
    }
};