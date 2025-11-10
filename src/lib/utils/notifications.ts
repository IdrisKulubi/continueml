/**
 * Notification utilities for consistency checking and other alerts
 */

export interface ConsistencyNotification {
  generationId: string;
  consistencyScore: number;
  message: string;
  severity: "success" | "warning" | "error";
}

/**
 * Determine notification severity based on consistency score
 * @param score - Consistency score (0-100)
 * @returns Severity level
 */
export function getConsistencySeverity(
  score: number
): "success" | "warning" | "error" {
  if (score >= 90) {
    return "success";
  } else if (score >= 75) {
    return "warning";
  } else {
    return "error";
  }
}

/**
 * Generate notification message based on consistency score
 * @param score - Consistency score (0-100)
 * @returns User-friendly message
 */
export function getConsistencyMessage(score: number): string {
  if (score >= 90) {
    return `Excellent consistency! Your generation scored ${score}% and closely matches your entity references.`;
  } else if (score >= 75) {
    return `Good consistency with minor variations (${score}%). Review the content to ensure it meets your expectations.`;
  } else {
    return `Low consistency detected (${score}%). Consider regenerating with more specific prompts or adjusting entity references.`;
  }
}

/**
 * Create a consistency notification object
 * @param generationId - ID of the generation
 * @param consistencyScore - Consistency score (0-100)
 * @returns Notification object
 */
export function createConsistencyNotification(
  generationId: string,
  consistencyScore: number
): ConsistencyNotification {
  return {
    generationId,
    consistencyScore,
    message: getConsistencyMessage(consistencyScore),
    severity: getConsistencySeverity(consistencyScore),
  };
}

/**
 * Check if a consistency score should trigger a notification
 * Only notify for completed generations with scores below 90%
 * @param score - Consistency score (0-100)
 * @returns True if notification should be shown
 */
export function shouldNotifyConsistency(score: number | null): boolean {
  return score !== null && score < 90;
}
