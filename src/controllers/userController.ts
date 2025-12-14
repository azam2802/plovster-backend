import { Request, Response } from 'express';
import db from '../config/firebase';
import { IUser, userConverter } from '../models/User';
import bcrypt from 'bcryptjs';

const usersCollection = db.collection('users').withConverter(userConverter);

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
export const getUsers = async (req: Request, res: Response) => {
    try {
        const snapshot = await usersCollection.get();
        const users = snapshot.docs.map(doc => {
            const data = doc.data();
            // Don't return password hash
            return {
                id: data.id,
                username: data.username,
                role: data.role
            };
        });

        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
};

// @desc    Create a new user (admin/manager)
// @route   POST /api/users
// @access  Private (Admin)
export const createUser = async (req: Request, res: Response) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({ success: false, error: 'Все поля обязательны' });
        }

        if (role !== 'admin' && role !== 'manager') {
            return res.status(400).json({ success: false, error: 'Роль должна быть admin или manager' });
        }

        // Check if user already exists
        const existing = await usersCollection.where('username', '==', username).get();
        if (!existing.empty) {
            return res.status(400).json({ success: false, error: 'Пользователь с таким логином уже существует' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser: IUser = {
            username,
            passwordHash,
            role
        };

        const docRef = await usersCollection.add(newUser);
        const savedUser = (await docRef.get()).data();

        res.status(201).json({
            success: true,
            data: {
                id: savedUser?.id,
                username: savedUser?.username,
                role: savedUser?.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
};
