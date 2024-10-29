import React, { memo } from 'react';
import { PlayIcon } from 'lucide-react';
import { FormatTime } from '../utilities';

const ResultCard = memo(({ video, filename, episode, from, to, similarity, rank }) => {
    const handleAnimePage = () => {
        if (!filename) return;
        const query = encodeURIComponent(filename);
        window.open(`https://kaido.to/search?keyword=${query}`, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 relative">
            {/* Rank Badge */}
            <div className="absolute -top-3 -left-3 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                #{rank}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold mb-4">
                Match Found! ({(similarity * 100).toFixed(1)}% Similarity)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {video && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-base sm:text-lg font-medium mb-2">Preview Video</h3>
                            <div className="relative w-full pt-[56.25%]">
                                <video
                                    controls
                                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                                    src={video}
                                    preload="metadata"
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </div>
                    </div>
                )}

                <div>
                    <dl className="space-y-3 sm:space-y-4">
                        <InfoItem label="Anime" value={filename} />
                        <InfoItem label="Episode" value={episode || 'Movie'} />
                        <InfoItem
                            label={episode === null ? 'Time (HH:MM:SS:MS)' : 'Time (MM:SS:MS)'}
                            value={`${FormatTime({ seconds: from, isEpisodeNull: episode === null })} - 
                     ${FormatTime({ seconds: to, isEpisodeNull: episode === null })}`}
                        />
                    </dl>

                    <button
                        onClick={handleAnimePage}
                        className="mt-6 w-full flex items-center justify-center px-4 py-2 rounded-md 
                     bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm sm:text-base"
                    >
                        <PlayIcon className="-ml-1 mr-2 h-4 sm:h-5 w-4 sm:w-5" />
                        {episode ? 'Watch Full Episode' : 'Watch Full Movie'}
                    </button>
                </div>
            </div>
        </div>
    );
});

const InfoItem = memo(({ label, value }) => (
    <div>
        <dt className="text-xs sm:text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-base sm:text-lg text-gray-900">{value}</dd>
    </div>
));

InfoItem.displayName = 'InfoItem';
ResultCard.displayName = 'ResultCard';

export default ResultCard;
