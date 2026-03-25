import React, { useState, useRef } from 'react';
import { Button, Typography, Input } from '@material-tailwind/react';
import { FaCamera, FaTimes } from 'react-icons/fa';
import { showToast } from '../Toaster/Toaster';
import useEmployees from '../../ViewModel/EmployeeViewModel/EmployeeServices';

const ProfileImageUpload = ({ employeeId, onUploadSuccess, onClose }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const { updateEmployeeProfileImage } = useEmployees();

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.match(/^image\/(jpeg|jpg|png)$/i)) {
                showToast('Please select a JPG or PNG image file', 'error');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showToast('Image size should be less than 5MB', 'error');
                return;
            }

            setSelectedFile(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            showToast('Please select an image file', 'error');
            return;
        }

        if (!employeeId) {
            showToast('Employee ID is required', 'error');
            return;
        }

        setIsUploading(true);

        try {
            // Call API (uploads to make_url then updates core profile image)
            const result = await updateEmployeeProfileImage({ file: selectedFile, emp_id: employeeId });

            if (result.success) {
                showToast(result.message || 'Profile image updated successfully!', 'success');
                if (onUploadSuccess) {
                    onUploadSuccess();
                }
                if (onClose) {
                    onClose();
                }
            } else {
                showToast(result.error || 'Failed to update profile image', 'error');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            showToast('An error occurred while uploading the image', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-4">
                <Typography className="text-lg font-semibold text-gray-800 font-Urbanist">
                    Employee profile pic
                </Typography>
                
                <Typography className="text-sm text-blue-600 font-Urbanist">
                    Choose a picture (JPG, PNG) only
                </Typography>

                {/* File Input */}
                <div className="flex flex-col gap-2">
                    <Input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleFileSelect}
                        ref={fileInputRef}
                        className="border-gray-300! text-gray-700!"
                        label="Choose file"
                        containerProps={{
                            className: "min-w-0"
                        }}
                    />
                </div>

                {/* Preview */}
                {preview && (
                    <div className="relative w-full flex flex-col items-center gap-4">
                        <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={handleRemoveFile}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                                title="Remove image"
                            >
                                <FaTimes size={12} />
                            </button>
                        </div>
                        <Typography className="text-xs text-gray-500 font-Urbanist">
                            {selectedFile?.name}
                        </Typography>
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end gap-3 mt-4">
                    <Button
                        variant="outlined"
                        color="gray"
                        onClick={onClose}
                        disabled={isUploading}
                        className="font-Urbanist"
                    >
                        Cancel
                    </Button>
                    <Button
                        color="blue"
                        onClick={handleSubmit}
                        disabled={!selectedFile || isUploading}
                        className="font-Urbanist"
                    >
                        {isUploading ? 'Uploading...' : 'Submit'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProfileImageUpload;
