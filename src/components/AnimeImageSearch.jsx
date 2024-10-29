import React, { useState, useCallback, useEffect, memo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Clock, Image as ImageIcon, Upload, AlertCircle } from 'lucide-react';
import axios from 'axios';
import ResultCard from './ResultCard';

// Constants
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const API_URL = 'https://api.trace.moe/search';

// Memoized UploadSection component
const UploadSection = memo(({ preview, isDragActive, getRootProps, getInputProps, error, loading, handleUpload }) => (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
        <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
        >
            <input {...getInputProps()} />
            <ImageIcon className="mx-auto h-8 sm:h-12 w-8 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
            {preview ? (
                <div className="relative max-w-full overflow-hidden">
                    <img
                        src={preview}
                        alt="Preview"
                        className="max-h-48 sm:max-h-64 mx-auto rounded-lg object-contain"
                        loading="lazy"
                    />
                </div>
            ) : (
                <div className="space-y-1 sm:space-y-2">
                    <p className="text-sm sm:text-base text-gray-600">
                        Drag and drop an image here, or click to select
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                        Maximum file size: 5MB
                    </p>
                </div>
            )}
        </div>

        {error && (
            <div className="mt-4 p-3 sm:p-4 bg-red-50 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
            </div>
        )}

        <button
            onClick={handleUpload}
            disabled={!preview || loading}
            className={`mt-4 w-full flex items-center justify-center px-4 py-2 rounded-md text-white text-sm sm:text-base
        ${preview && !loading
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                } transition-colors`}
        >
            {loading ? (
                <>
                    <Clock className="animate-spin -ml-1 mr-2 h-4 sm:h-5 w-4 sm:w-5" />
                    Processing...
                </>
            ) : (
                <>
                    <Upload className="-ml-1 mr-2 h-4 sm:h-5 w-4 sm:w-5" />
                    Upload Image
                </>
            )}
        </button>
    </div>
));

UploadSection.displayName = 'UploadSection';

const AnimeImageSearch = () => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        if (file.size > MAX_FILE_SIZE) {
            setError('File size exceeds 5MB limit');
            return;
        }

        setImage(file);
        setPreview(URL.createObjectURL(file));
        setError(null);
        setResults([]); // Clear previous results
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false,
        maxSize: MAX_FILE_SIZE
    });

    const handleUpload = useCallback(async () => {
        if (!image) return;

        setLoading(true);
        setError(null);
        setResults([]);

        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await axios.post(API_URL, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 30000,
                maxContentLength: MAX_FILE_SIZE,
            });

            if (response.data?.result?.length > 0) {
                // Sort results by similarity and take top MAX_RESULTS
                const sortedResults = response.data.result
                    .sort((a, b) => b.similarity - a.similarity)
                setResults(sortedResults);
            } else {
                setError('No matches found for this image');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            setError(
                error.response?.data?.message ||
                (error.request ? 'Network error. Please check your connection.' : 'Failed to process image.')
            );
        } finally {
            setLoading(false);
        }
    }, [image]);

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8 sm:mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                        Anime Identifier
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600">
                        Upload an anime screenshot to find its source
                    </p>
                </div>

                <UploadSection
                    preview={preview}
                    isDragActive={isDragActive}
                    getRootProps={getRootProps}
                    getInputProps={getInputProps}
                    error={error}
                    loading={loading}
                    handleUpload={handleUpload}
                />

                {results.length > 0 && (
                    <div className="space-y-6">
                        {results.map((result, index) => (
                            <ResultCard
                                key={`${result.filename}-${index}`}
                                {...result}
                                rank={index + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(AnimeImageSearch);
