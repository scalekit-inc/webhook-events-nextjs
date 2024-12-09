type User = {
  id: string;
  email: string;
  name: string;
};
type Event = {
  id: string;
  data: any;
};

class UserMockDB {
  private users: User[] = [];

  async processUserCreate(event: Event): Promise<void> {
    const { id, email, name } = event.data;
    if (!id || !email || !name) {
      console.error('Missing required fields for user creation:', { id, email, name });
      return;
    }
    // Check if the user already exists
    const existingUser = await userMockDB.getUserById(id);
    if (existingUser) {
      // Update existing user
      await userMockDB.updateUser(id, { email, name });
      console.log(`User with ID ${id} updated.`);
    } else {
      // Create new user
      await userMockDB.createUser({ id, email, name });
      console.log(`User with ID ${id} created.`);
    }
  }

  async processUserUpdate(event: Event): Promise<void> {
    const { id, ...updates } = event.data;
    if (!id) {
      console.error('Missing user ID for update:', { id, updates });
      return;
    }
    const success = await userMockDB.updateUser(id, updates);
    if (!success) {
      console.log(`User with ID ${id} not found for update`);
      const { email, name } = updates;
      if (!email || !name) {
        console.error('Missing fields for creating user:', { id, email, name });
        return;
      }
      await userMockDB.createUser({ id, email, name });
      console.log(`User with ID ${id} successfully created.`);
    }
  }

  async createUser(user: User): Promise<void> {
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      this.users[index] = user; // Replace existing user
      console.log(`User with ID ${user.id} updated.`);
    } else {
      this.users.push(user);
      console.log(`User created:`, user);
    }
  }

  async updateUser(userId: string, updatedData: Partial<User>): Promise<boolean> {
    const index = this.users.findIndex((u) => u.id === userId);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updatedData };
      console.log(`User updated:`, this.users[index]);
      return true;
    }
    console.log(`User not found for update: ${userId}`);
    return false;

  }
  async getUserById(userId: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === userId);
    return user || null;
  }

  async processUserDelete(userId: string): Promise<boolean> {
    const index = this.users.findIndex((u) => u.id === userId);
    if (index !== -1) {
      const deletedUser = this.users.splice(index, 1);
      console.log(`User deleted:`, deletedUser[0]);
      return true;
    }
    console.log(`User not found for deletion: ${userId}`);
    return false;
  }

  async getAllUsers(): Promise<User[]> {
    return this.users;
  }
}

const userMockDB = new UserMockDB();
export default userMockDB;