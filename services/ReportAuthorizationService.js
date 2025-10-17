/**
 * Service class responsible for handling report authorization logic
 * Follows Single Responsibility Principle - only handles authorization
 */
export class ReportAuthorizationService {
  constructor(auth, db) {
    this.auth = auth;
    this.db = db;
  }

  /**
   * Check if current user is authenticated
   */
  isAuthenticated() {
    return !!this.auth.currentUser;
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.auth.currentUser;
  }

  /**
   * Check if user has business/admin role
   */
  async isAuthorizedForReports(userId) {
    const { doc, getDoc } = await import('firebase/firestore');
    const userDoc = await getDoc(doc(this.db, 'users', userId));
    
    if (!userDoc.exists()) {
      return false;
    }

    const userData = userDoc.data();
    return userData.userType === 'business';
  }

  /**
   * Validate user authorization for reports
   */
  async validateAuthorization() {
    const currentUser = this.getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const isAuthorized = await this.isAuthorizedForReports(currentUser.uid);
    if (!isAuthorized) {
      throw new Error('User not authorized for reports');
    }

    return currentUser;
  }
}
