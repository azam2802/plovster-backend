import { Request, Response } from 'express';
import db from '../config/firebase';
import { IUser, userConverter, comparePassword } from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const usersCollection = db.collection('users').withConverter(userConverter);

// Generate Token
const generateToken = (id: string, role: string) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

// @desc    Login user (admin/manager)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        const snapshot = await usersCollection.where('username', '==', username).limit(1).get();

        if (snapshot.empty) {
            return res.status(401).json({ success: false, error: 'Неверные учетные данные' });
        }

        const userDoc = snapshot.docs[0];
        const user = userDoc.data();

        if (await comparePassword(user, password)) {
            res.json({
                success: true,
                token: generateToken(user.id!, user.role),
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }
            });
        } else {
            res.status(401).json({ success: false, error: 'Неверные учетные данные' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
};