import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import fs from 'fs/promises'
import path from 'path'

interface UserFileData {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  image?: string;
  role: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

async function readUsersFromFile(): Promise<UserFileData[]> {
  try {
    const data = await fs.readFile(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
}

async function writeUsersToFile(users: UserFileData[]): Promise<void> {
  try {
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error writing users file:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Read additional profile data from file
    const users = await readUsersFromFile();
    const userFromFile = users.find((u: UserFileData) => u.email === user.email);

    // Return user profile with additional data
    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      phone: userFromFile?.phone || '',
      address: userFromFile?.address || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    return NextResponse.json({
      user: userProfile,
      message: "Profile retrieved successfully"
    })
  } catch (error) {
    console.error("Error in user profile API:", error)
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, phone, address, image } = body

    // Read existing users from file
    const users = await readUsersFromFile();
    const userIndex = users.findIndex((u: UserFileData) => u.email === user.email);

    if (userIndex !== -1) {
      // Update existing user
      users[userIndex] = {
        ...users[userIndex],
        name: name || users[userIndex].name,
        phone: phone || '',
        address: address || '',
        image: image || users[userIndex].image,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Add new user entry
      users.push({
        id: user.id,
        email: user.email,
        name: name || user.name,
        phone: phone || '',
        address: address || '',
        image: image || user.image,
        role: user.role,
        provider: 'credentials', // Default provider
        createdAt: user.createdAt,
        updatedAt: new Date().toISOString()
      });
    }

    // Write updated users back to file
    await writeUsersToFile(users);
    
    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        ...user,
        name: name || user.name,
        phone: phone || '',
        address: address || '',
        image: image || user.image,
        updatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}
