export type TimeControl = "bullet" | "blitz" | "rapid" | "classical" | "daily";

export function parseTimeControl(timeClass: string, timeControl: string): TimeControl {
  // timeClass usually provides a good categorization (e.g., "blitz", "rapid", "bullet")
  const normalizedClass = timeClass.toLowerCase();
  
  if (["bullet", "blitz", "rapid", "daily"].includes(normalizedClass)) {
    return normalizedClass as TimeControl;
  }
  
  // Fallback to parse the timeControl string if timeClass is missing or unknown
  // e.g., "180", "180+2", "1/2592000"
  if (timeControl.includes("/")) {
    return "daily"; // days per move
  }

  const baseTimeSeconds = parseInt(timeControl.split("+")[0], 10);
  if (isNaN(baseTimeSeconds)) return "rapid"; // Default fallback

  if (baseTimeSeconds < 180) return "bullet"; // less than 3 minutes
  if (baseTimeSeconds < 600) return "blitz";  // 3 to < 10 minutes
  if (baseTimeSeconds < 3600) return "rapid"; // 10 to < 60 minutes
  return "classical";                         // 60+ minutes
}
