import React, { useState, useEffect } from 'react';
import { Button } from '@material-tailwind/react';
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer';
import { showToast } from '../../Components/Toaster/Toaster';
import useStore from '../../Store/store';
import trainingApi from '../../Model/Data/TrainigPages/Training';

const EmployeeDocuments = ({
    employeeData,
    employeeId,
    openDocumentsDrawer,
    setOpenDocumentsDrawer,
    isUpdating,
    setIsUpdating,
    setEmployeeData,
    editingRecord,
    setEditingRecord,
    onDeleteDocument,
    onRefreshDocuments
}) => {
    const addEmployeeDocument = useStore((state) => state.addEmployeeDocument);
    
    const [documentsForm, setDocumentsForm] = useState({
        docTitle: '',
        docName: '',
        docFile: null,
        docFileUrl: ''
    });

    const [isUploadingFile, setIsUploadingFile] = useState(false);

    const mapDocumentToForm = (record) => ({
        docTitle: record.doc_title || '',
        docName: record.doc_name || '',
        docFile: null,
        docFileUrl: record.doc_name || ''
    });

    // Reset form when drawer closes; when opening, populate from editing record or latest document
    useEffect(() => {
        if (!openDocumentsDrawer) {
            setDocumentsForm({
                docTitle: '',
                docName: '',
                docFile: null,
                docFileUrl: ''
            });
            setEditingRecord(null);
        } else if (editingRecord) {
            setDocumentsForm(mapDocumentToForm(editingRecord));
        } else {
            const list = employeeData?.employee_documents?.employee_document;
            if (list && Array.isArray(list) && list.length > 0) {
                setDocumentsForm(mapDocumentToForm(list[list.length - 1]));
            }
        }
    }, [openDocumentsDrawer, editingRecord, setEditingRecord]);

    const handleDocumentsChange = (field, value) => {
        setDocumentsForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            showToast('Please upload a valid file (JPEG, PNG, PDF, or DOC)', 'error');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            showToast('File size should be less than 10MB', 'error');
            return;
        }

        try {
            setIsUploadingFile(true);
            setDocumentsForm(prev => ({ ...prev, docFile: file }));

            const formData = new FormData();
            formData.append('file', file);

            const response = await trainingApi.uploadFileToElephant(formData);
            const responseData = response.data;

            if (responseData.STATUS === "SUCCESSFUL") {
                setDocumentsForm(prev => ({ 
                    ...prev, 
                    docFileUrl: responseData.FILE_URL,
                    docName: responseData.FILE_URL // Use the full URL instead of just filename
                }));
                showToast('File uploaded successfully', 'success');
            } else {
                showToast('Failed to upload file', 'error');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            showToast('Failed to upload file', 'error');
        } finally {
            setIsUploadingFile(false);
        }
    };

    const handleDocumentsSubmit = async () => {
        try {
            setIsUpdating(true);

            // Form validation
            if (!documentsForm.docTitle || !String(documentsForm.docTitle).trim()) {
                showToast('Document Title is required', 'error');
                return;
            }
            if (!documentsForm.docFileUrl || !String(documentsForm.docFileUrl).trim()) {
                showToast('Please upload a document file', 'error');
                return;
            }

            // Prepare payload for add/update document API
            const payload = {
                doc_title: documentsForm.docTitle,
                doc_name: documentsForm.docFileUrl // Send the full URL from the upload response
            };

            // Add operation and id for update
            if (editingRecord) {
                payload.operation = "update_documents";
                payload.id = editingRecord.id;
            }

            // console.log(editingRecord ? 'Updating document record with payload:' : 'Adding document record with payload:', payload);

            // Call the actual API
            const result = await addEmployeeDocument(employeeId, payload);

            if (result && result.STATUS === "SUCCESSFUL") {
                showToast(editingRecord ? 'Document record updated successfully' : 'Document record added successfully', 'success');

                if (onRefreshDocuments) await onRefreshDocuments();

                setOpenDocumentsDrawer(false);
                
                // Reset form
                setDocumentsForm({
                    docTitle: '',
                    docName: '',
                    docFile: null,
                    docFileUrl: ''
                });
            } else {
                showToast('Failed to add document record', 'error');
            }
        } catch (error) {
            console.error('Error adding document record:', error);
            showToast('Failed to add document record', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteDocument = async (documentId) => {
        try {
            setIsUpdating(true);

            // Prepare payload for delete document API
            const payload = {
                operation: "delete_documents",
                id: documentId
            };

            // console.log('Deleting document record with payload:', payload);

            // Call the actual API
            const result = await addEmployeeDocument(employeeId, payload);

            if (result && result.STATUS === "SUCCESSFUL") {
                showToast('Document record deleted successfully', 'success');

                if (onRefreshDocuments) await onRefreshDocuments();
            } else {
                showToast('Failed to delete document record', 'error');
            }
        } catch (error) {
            console.error('Error deleting document record:', error);
            showToast('Failed to delete document record', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <PortalDrawer
            open={openDocumentsDrawer}
            closeDrawer={() => setOpenDocumentsDrawer(false)}
            title={editingRecord ? "Edit Document Record" : "Add Employee Document"}
            widthSize={600}
            compo={
                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        {/* Document Title */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Document Title
                            </label>
                            <input
                                type="text"
                                value={documentsForm.docTitle}
                                onChange={(e) => handleDocumentsChange('docTitle', e.target.value)}
                                placeholder="Enter document title (e.g., Passport Copy, ID Card)"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Upload Document
                            </label>
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="document-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {isUploadingFile ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                                <span className="ml-2 text-sm text-gray-500">Uploading...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.5C5.137 5.5 5.071 5.5 5 5.5a5 5 0 0 0 0 10h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                                </svg>
                                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">PDF, DOC, DOCX, PNG, JPG (MAX. 10MB)</p>
                                            </>
                                        )}
                                    </div>
                                    <input 
                                        id="document-upload" 
                                        type="file" 
                                        className="hidden" 
                                        onChange={handleFileUpload}
                                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                        disabled={isUploadingFile}
                                    />
                                </label>
                            </div>
                            
                            {/* Show uploaded file name */}
                            {documentsForm.docFileUrl && (
                                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-800">
                                        <span className="font-medium">Uploaded:</span> {documentsForm.docFile ? documentsForm.docFile.name : 'File uploaded successfully'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-start gap-3 pt-4">
                        <Button
                            color="blue"
                            onClick={handleDocumentsSubmit}
                            disabled={isUpdating || isUploadingFile}
                            className="px-6 py-2"
                        >
                            {isUpdating ? (editingRecord ? 'Updating...' : 'Adding...') : (editingRecord ? 'Update Document' : 'Add Document')}
                        </Button>
                        <Button
                            color="gray"
                            variant="outlined"
                            onClick={() => setOpenDocumentsDrawer(false)}
                            disabled={isUpdating || isUploadingFile}
                            className="px-6 py-2"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            }
        />
    );
};

export default EmployeeDocuments;
