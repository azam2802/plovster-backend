import { Request, Response } from 'express';
import db from '../config/firebase';
import { IComplaint, complaintConverter } from '../models/Complaint';
import { sendNotification } from '../utils/notificationService';

const complaintsCollection = db.collection('complaints').withConverter(complaintConverter);

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Public
export const createComplaint = async (req: Request, res: Response) => {
    try {
        const { fullName, branch, problem, solution, contact, rating } = req.body;

        const newComplaint: IComplaint = {
            fullName,
            branch,
            problem,
            solution,
            contact,
            rating,
            status: 'New',
            createdAt: new Date().toISOString()
        };

        const docRef = await complaintsCollection.add(newComplaint);
        const savedComplaint = (await docRef.get()).data();

        // Notify admin
        await sendNotification(`New Complaint from ${branch}: ${problem.substring(0, 50)}...`);

        res.status(201).json({
            success: true,
            data: savedComplaint,
            message: 'Жалоба успешно отправлена',
        });
    } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
    }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private (Admin/Manager)
export const getComplaints = async (req: Request, res: Response) => {
    try {
        const { status, branch, sort } = req.query;

        let query: FirebaseFirestore.Query = complaintsCollection;

        if (branch) query = query.where('branch', '==', branch);
        if (status) query = query.where('status', '==', status);

        // Firestore requires composite indexes for where() + orderBy() on different fields.
        // To avoid this complexity for now, we'll sort in memory.
        const snapshot = await query.get();
        let complaints = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IComplaint));

        // In-memory sorting
        if (sort === 'date_asc') {
            complaints.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        } else if (sort === 'date_desc') {
            complaints.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (sort === 'rating_asc') {
            complaints.sort((a, b) => (a.rating || 0) - (b.rating || 0));
        } else if (sort === 'rating_desc') {
            complaints.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else {
            // Default: date_desc
            complaints.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        // Pagination
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 15;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const total = complaints.length;
        const pagedComplaints = complaints.slice(startIndex, endIndex);

        res.status(200).json({
            success: true,
            count: pagedComplaints.length,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            data: pagedComplaints
        });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
};

// @desc    Update complaint status/comment
// @route   PATCH /api/complaints/:id
// @access  Private (Admin)
export const updateComplaint = async (req: Request, res: Response) => {
    try {
        const { adminComment, status } = req.body;
        const docRef = complaintsCollection.doc(req.params.id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, error: 'Жалоба не найдена' });
        }

        const updates: Partial<IComplaint> = {};
        if (adminComment !== undefined) updates.adminComment = adminComment;
        if (status) updates.status = status;

        await docRef.update(updates);
        const updatedDoc = (await docRef.get()).data();

        res.status(200).json({ success: true, data: updatedDoc });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
};

// @desc    Get analytics
// @route   GET /api/analytics
// @access  Private (Admin)
export const getAnalytics = async (req: Request, res: Response) => {
    try {
        const snapshot = await complaintsCollection.get();
        const complaints = snapshot.docs.map(doc => doc.data());

        const total = complaints.length;

        const byBranch: any = {};

        let totalSumRating = 0;
        let ratedCount = 0;

        complaints.forEach(c => {
            // Branch stats
            if (!byBranch[c.branch]) byBranch[c.branch] = { count: 0, sumRating: 0 };
            byBranch[c.branch].count++;

            if (c.rating) {
                byBranch[c.branch].sumRating += c.rating;
                totalSumRating += c.rating;
                ratedCount++;
            }
        });

        const byBranchArray = Object.keys(byBranch).map(key => ({
            _id: key,
            count: byBranch[key].count,
            avgRating: byBranch[key].count > 0 ? byBranch[key].sumRating / byBranch[key].count : 0
        }));

        res.status(200).json({
            success: true,
            data: {
                total,
                globalAvgRating: ratedCount > 0 ? (totalSumRating / ratedCount).toFixed(1) : 0,
                byBranch: byBranchArray
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
};
