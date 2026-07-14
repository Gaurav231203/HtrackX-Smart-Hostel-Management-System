/**
 * Central export file for all API functions
 * Import from '@/lib/api' instead of individual files
 */

// Auth API
export {
  signUpStudent,
  signUpAdmin,
  signIn,
  signOut,
  getCurrentSession,
  getCurrentUserProfile,
} from './auth'

// Attendance API
export {
  markAttendance,
  getAttendanceByDate,
  getUserAttendance,
  getAllAttendance,
  getAttendanceByDateForAll,
  createDailyAttendanceRows,
  checkAttendanceRowsExist,
} from './attendance'

// Tickets API
export {
  createTicket,
  getUserTickets,
  getAllTickets,
  updateTicketStatus,
  deleteTicket,
  getTicketById,
} from './tickets'

// Leave Applications API
export {
  createLeaveApplication,
  getUserLeaveApplications,
  getAllLeaveApplications,
  updateLeaveStatus,
  deleteLeaveApplication,
  getLeaveById,
} from './leave'

// Mess Menu API
export {
  setMessMenu,
  getMessMenuByDay,
  getMessMenu,
  getAllMessMenus,
  deleteMessMenu,
  uploadMessMenuImage,
} from './mess-menu'

// Notifications API
export {
  createNotification,
  getUserNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createBroadcastNotification,
} from './notification'
