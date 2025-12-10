export type TimeRange = "short_term" | "medium_term" | "long_term";

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
    short_term: "4 semaines",
    medium_term: "6 mois",
    long_term: "Tout le temps",
};
