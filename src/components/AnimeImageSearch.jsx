import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Clock, Image as ImageIcon, Upload, AlertCircle, PlayIcon } from 'lucide-react';
import axios from 'axios';
import { FormatTime, getTitle } from '../utilities';

const AnimeImageSearch = () => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Cleanup function for image preview URL
    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        if (file.size > 25 * 1024 * 1024) {
            setError('File size exceeds 25MB limit');
            return;
        }

        setImage(file);
        setPreview(URL.createObjectURL(file));
        setError(null);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false,
        maxSize: 25 * 1024 * 1024
    });

    const handleUpload = async () => {
        if (!image) return;

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('image', image);

            const response = await axios.post('https://api.trace.moe/search', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 30000,
                maxContentLength: 25 * 1024 * 1024,
            });

            if (response.data?.result?.length > 0) {
                setResult(response.data.result[0]);
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
    };

    const handleAnimePage = useCallback(() => {
        if (!result?.filename) return;

        // Get the cleaned title
        const animeTitle = getTitle(result.filename);

        const query = animeTitle.replaceAll(" ", "+")
        // console.log(query);

        window.open(`https://kaido.to/search?keyword=${query}`, '_blank', 'noopener,noreferrer');
    }, [result?.filename]);

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header - More responsive text sizing */}
                <div className="text-center mb-8 sm:mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                    Anime Identifier
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600">
                        Upload an anime screenshot to find its source
                    </p>
                </div>

                {/* Upload Section - Improved responsive padding */}
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
                                />
                            </div>
                        ) : (
                            <div className="space-y-1 sm:space-y-2">
                                <p className="text-sm sm:text-base text-gray-600">
                                    Drag and drop an image here, or click to select
                                </p>
                                <p className="text-xs sm:text-sm text-gray-500">
                                    Maximum file size: 25MB
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
                        disabled={!image || loading}
                        className={`mt-4 w-full flex items-center justify-center px-4 py-2 rounded-md text-white text-sm sm:text-base
                            ${image && !loading
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

                {/* Results Section - Improved responsive layout */}
                {result && (
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                        <h2 className="text-xl sm:text-2xl font-bold mb-4">Match Found!</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-4">
                                {result.video && (
                                    <div>
                                        <h3 className="text-base sm:text-lg font-medium mb-2">Preview Video</h3>
                                        <div className="relative w-full pt-[56.25%]">
                                            <video
                                                controls
                                                className="absolute top-0 left-0 w-full h-full rounded-lg"
                                                src={result.video}
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div>
                                <dl className="space-y-3 sm:space-y-4">
                                    <div>
                                        <dt className="text-xs sm:text-sm font-medium text-gray-500">Anime</dt>
                                        <dd className="mt-1 text-base sm:text-lg text-gray-900">
                                            {getTitle(result.filename) || result.filename}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs sm:text-sm font-medium text-gray-500">Episode</dt>
                                        <dd className="mt-1 text-base sm:text-lg text-gray-900">
                                            {result.episode || 'Movie/Special'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs sm:text-sm font-medium text-gray-500">
                                            {result.episode === null ? 'Time (HH:MM:SS:MS)' : 'Time (MM:SS:MS)'}
                                        </dt>
                                        <dd className="mt-1 text-base sm:text-lg text-gray-900">
                                            {FormatTime({ seconds: result.from, isEpisodeNull: result.episode === null })} -
                                            {FormatTime({ seconds: result.to, isEpisodeNull: result.episode === null })}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs sm:text-sm font-medium text-gray-500">Similarity</dt>
                                        <dd className="mt-1 text-base sm:text-lg text-gray-900">
                                            {(result.similarity * 100).toFixed(1)}%
                                        </dd>
                                    </div>
                                </dl>

                                <button
                                    onClick={handleAnimePage}
                                    className="mt-6 w-full flex items-center justify-center px-4 py-2 rounded-md 
                                        bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm sm:text-base"
                                >
                                    <PlayIcon className="-ml-1 mr-2 h-4 sm:h-5 w-4 sm:w-5" />
                                    {result.episode ? 'Watch Full Episode' : 'Watch Full Movie'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnimeImageSearch;
