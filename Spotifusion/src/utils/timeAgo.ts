export function getTimeAgo(isoDateString: string): string {
    const date = new Date(isoDateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const absoluteDiffMs = Math.abs(diffMs);

    const seconds = Math.floor(absoluteDiffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0) return `Il y a ${years} an${years > 1 ? "s" : ""}`;
    if (months > 0) return `Il y a ${months} mois`;
    if (days > 0) return `Il y a ${days} jour${days > 1 ? "s" : ""}`;
    if (hours > 0) return `Il y a ${hours} heure${hours > 1 ? "s" : ""}`;
    if (minutes > 0) return `Il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;
    if (seconds > 0) return `Il y a ${seconds} seconde${seconds > 1 ? "s" : ""}`;
    return "À l'instant";
}
