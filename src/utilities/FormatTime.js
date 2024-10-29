function FormatTime({ seconds, isEpisodeNull }) {
    if (isEpisodeNull) {
        // Format in hours when episode is null
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = ((seconds % 3600) % 60).toFixed(2);
        return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.padStart(5, '0')}`;
    } else {
        // Format in minutes when episode exists
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = (seconds % 60).toFixed(2);
        return `${minutes}:${remainingSeconds.padStart(5, '0')}`;
    }
}

export default FormatTime
