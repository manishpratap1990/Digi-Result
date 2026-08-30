import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate letter grade from percentage
 */
export function calculateGrade(percentage: number): string {
  if (percentage >= 90) return 'A+'
  if (percentage >= 80) return 'A'
  if (percentage >= 70) return 'B+'
  if (percentage >= 60) return 'B'
  if (percentage >= 50) return 'C+'
  if (percentage >= 40) return 'C'
  if (percentage >= 33) return 'D'
  return 'F'
}

/**
 * Calculate grade from marks
 */
export function calculateSubjectGrade(marks: number, maxMarks: number): string {
  const pct = (marks / maxMarks) * 100
  return calculateGrade(pct)
}

/**
 * Format date from ISO string for display
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
}

/**
 * Format date of birth to ISO YYYY-MM-DD
 */
export function formatDOBForDB(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toISOString().split('T')[0]
}

/**
 * Normalize roll number (trim + uppercase)
 */
export function normalizeRollNumber(roll: string): string {
  return roll.trim().toUpperCase()
}

/**
 * Format percentage to 2 decimal places
 */
export function formatPercentage(pct: number): string {
  return `${pct.toFixed(2)}%`
}

/**
 * Get class display label
 */
export function getClassLabel(classLevel: number): string {
  return `Class ${classLevel}`
}

/**
 * Check if marks qualify as pass (default 33%)
 */
export function isSubjectPass(marks: number, maxMarks: number, passingMarks?: number): boolean {
  if (passingMarks !== undefined) return marks >= passingMarks
  return marks >= Math.ceil(maxMarks * 0.33)
}
