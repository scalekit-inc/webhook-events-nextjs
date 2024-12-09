type User = {
  id: string;
  email: string;
  name: string;
};

class UserMockDB {
  private users: User[] = [];

  async createUser(user: User): Promise<void> {
    this.users.push(user);
    console.log(`User created:`, user);
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

  async deleteUser(userId: string): Promise<boolean> {
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