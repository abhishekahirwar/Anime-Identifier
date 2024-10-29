function getAnimeTitle(filename) {
    const withoutFirstBracket = filename.replace(/^\[[^\]]*\]\s*/, '');
    const pattern = /\b(?!\([^()]*\d[^()]*\))([A-Za-z]+(?:\d+)?|[A-Za-z]\d+)\b/g;
    const matches = withoutFirstBracket.match(pattern);
    if (matches) {
        return matches.join(' ');
    } else {
        return null;
    }
}

export default getAnimeTitle
