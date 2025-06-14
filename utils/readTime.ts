import readingTime from 'reading-time';

export function getReadTime(text: string) {
  const readTime = Math.round(readingTime(text).minutes);
  return `${readTime < 1 ? '< 1' : readTime}min read`;
}

