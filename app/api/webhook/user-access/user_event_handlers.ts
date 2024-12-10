import userDB from './user_DB';
import { Event } from '../../types/types';

// Function to process user creation
export async function processUserCreate(event: Event): Promise<void> {
  const { id, email, name } = event.data;
  if (!id || !email || !name) {
    console.error('Missing required fields for user creation:', { id, email, name });
    return;
  }
  // Check if the user already exists
  const existingUser = await userDB.getUserByEmail(email);
  if (existingUser) {
    // Update existing user
    await userDB.updateUser(id, { email, name });
    console.log(`User with ID ${id} updated.`);
  } else {
    // Create new user
    await userDB.createUser({ id, email, name });
    console.log(`User with ID ${id} created.`);
  }
}

// Function to process user update
export async function processUserUpdate(event: Event): Promise<void> {
  const { id, ...updates } = event.data;
  if (!id) {
    console.error('Missing user ID for update:', { id, updates });
    return;
  }
  const success = await userDB.updateUser(id, updates);
  if (!success) {
    console.log(`User with ID ${id} not found for update`);
    const { email, name } = updates;
    if (!email || !name) {
      console.error('Missing fields for creating user:', { id, email, name });
      return;
    }
    await userDB.createUser({ id, email, name });
    console.log(`User with ID ${id} successfully created.`);
  }
}

// Function to process user delete
export async function processUserDelete(event: Event): Promise<void> {
    const { id } = event.data;
  if (!id) {
    console.error('Missing user ID for delete:', { id });
    return;
  }
    await userDB.deleteUserByID(id);
  }

