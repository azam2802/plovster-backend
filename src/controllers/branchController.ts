import { Request, Response } from 'express';
import db from '../config/firebase';
import { IBranch, branchConverter } from '../models/Branch';

const branchesCollection = db.collection('branches').withConverter(branchConverter);

// @desc    Get all branches
// @route   GET /api/branches
// @access  Public
export const getBranches = async (req: Request, res: Response) => {
    try {
        const snapshot = await branchesCollection.orderBy('name', 'asc').get();
        const branches = snapshot.docs.map(doc => doc.data());

        res.status(200).json({ success: true, data: branches });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
};

// @desc    Create a new branch
// @route   POST /api/branches
// @access  Private (Admin)
export const createBranch = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ success: false, error: 'Название филиала обязательно' });
        }

        // Check if branch already exists
        const existing = await branchesCollection.where('name', '==', name.trim()).get();
        if (!existing.empty) {
            return res.status(400).json({ success: false, error: 'Филиал с таким названием уже существует' });
        }

        const newBranch: IBranch = {
            name: name.trim(),
            createdAt: new Date().toISOString()
        };

        const docRef = await branchesCollection.add(newBranch);
        const savedBranch = (await docRef.get()).data();

        res.status(201).json({ success: true, data: savedBranch });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
};

// @desc    Delete a branch
// @route   DELETE /api/branches/:id
// @access  Private (Admin)
export const deleteBranch = async (req: Request, res: Response) => {
    try {
        const docRef = branchesCollection.doc(req.params.id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, error: 'Филиал не найден' });
        }

        await docRef.delete();

        res.status(200).json({ success: true, message: 'Филиал удален' });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
};
