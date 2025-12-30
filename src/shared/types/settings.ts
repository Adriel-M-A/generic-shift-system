export interface AppSettings {
  shift_opening: string
  shift_closing: string
  shift_interval: string
  calendar_start_day: 'monday' | 'sunday'
  threshold_low: string
  threshold_medium: string
  show_completed: string
  show_cancelled: string
  show_absent: string
  [key: string]: string
}
