import express from 'express';
import { createComplaint, getComplaints, updateComplaint, getAnalytics } from '../controllers/complaintController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Complaints
 *   description: The complaints managing API
 */

/**
 * @swagger
 * /api/complaints:
 *   post:
 *     summary: Create a new complaint
 *     tags: [Complaints]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Complaint'
 *     responses:
 *       201:
 *         description: The complaint was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Complaint'
 *       500:
 *         description: Some server error
 */
router.post('/', createComplaint);

/**
 * @swagger
 * /api/complaints:
 *   get:
 *     summary: Returns the list of all complaints
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branch
 *         schema:
 *           type: string
 *         description: Filter by branch
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: The list of the complaints
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Complaint'
 */
router.get('/', protect, getComplaints);

/**
 * @swagger
 * /api/complaints/{id}:
 *   patch:
 *     summary: Update a complaint status or comment
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The complaint id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               adminComment:
 *                 type: string
 *     responses:
 *       200:
 *         description: The updated description
 *       404:
 *         description: The complaint was not found
 */
router.patch('/:id', protect, adminOnly, updateComplaint);

/**
 * @swagger
 * /api/complaints/analytics:
 *   get:
 *     summary: Get analytics
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data
 */
router.get('/analytics', protect, adminOnly, getAnalytics);

export default router;
