// Client-side storage utilities
export const storage = {
  getItem: (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  },
};

// Session management
export const sessionStorage = {
  setUser: (user: any) => storage.setItem('currentUser', JSON.stringify(user)),
  getUser: () => {
    const user = storage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  },
  clearUser: () => storage.removeItem('currentUser'),
};
