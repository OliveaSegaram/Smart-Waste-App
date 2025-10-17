/**
 * Service class responsible for fetching and processing report data from Firebase
 * Follows Single Responsibility Principle - only handles data operations
 */
export class ReportDataService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Fetch all collections data
   */
  async fetchCollections() {
    const { collection, getDocs } = await import('firebase/firestore');
    const collectionsSnapshot = await getDocs(collection(this.db, 'garbageCollections'));
    const collections = [];
    collectionsSnapshot.forEach(doc => collections.push({ id: doc.id, ...doc.data() }));
    return collections;
  }

  /**
   * Fetch all schedules data
   */
  async fetchSchedules() {
    const { collection, getDocs } = await import('firebase/firestore');
    const schedulesSnapshot = await getDocs(collection(this.db, 'schedules'));
    const schedules = [];
    schedulesSnapshot.forEach(doc => schedules.push({ id: doc.id, ...doc.data() }));
    return schedules;
  }

  /**
   * Fetch all users data
   */
  async fetchUsers() {
    const { collection, getDocs } = await import('firebase/firestore');
    const usersSnapshot = await getDocs(collection(this.db, 'users'));
    const users = [];
    usersSnapshot.forEach(doc => users.push({ id: doc.id, ...doc.data() }));
    return users;
  }

  /**
   * Fetch user data by ID
   */
  async fetchUserById(userId) {
    const { doc, getDoc } = await import('firebase/firestore');
    const userDoc = await getDoc(doc(this.db, 'users', userId));
    return userDoc.exists() ? userDoc.data() : null;
  }

  /**
   * Fetch overview data for dashboard
   */
  async fetchOverviewData() {
    const [collections, schedules, users] = await Promise.all([
      this.fetchCollections(),
      this.fetchSchedules(),
      this.fetchUsers()
    ]);

    return {
      totalCollections: collections.length,
      totalSchedules: schedules.length,
      totalUsers: users.length,
      totalRevenue: collections.reduce((sum, col) => sum + parseFloat(col.totalCost || 0), 0),
      collections,
      schedules,
      users
    };
  }
}
