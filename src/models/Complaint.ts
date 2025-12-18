export interface IComplaint {
    id?: string;
    fullName: string;
    branch: string;
    problem: string;
    solution?: string;
    contact?: string;
    rating?: number;
    adminComment?: string;
    status: 'New' | 'In progress' | 'Solved' | 'Rejected';
    createdAt: string; // ISO String
}

// Helper to convert Firestore doc to Complaint
export const complaintConverter = {
    toFirestore(complaint: IComplaint): FirebaseFirestore.DocumentData {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...data } = complaint;
        return data;
    },
    fromFirestore(
        snapshot: FirebaseFirestore.QueryDocumentSnapshot
    ): IComplaint {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            fullName: data.fullName,
            branch: data.branch,
            problem: data.problem,
            solution: data.solution,
            contact: data.contact,
            rating: data.rating,
            adminComment: data.adminComment,
            status: data.status || 'New',
            createdAt: data.createdAt
        };
    }
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Complaint:
 *       type: object
 *       required:
 *         - fullName
 *         - branch
 *         - problem
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the complaint
 *         fullName:
 *           type: string
 *           description: The name of the customer
 *         branch:
 *           type: string
 *           description: The branch of the organization
 *         problem:
 *           type: string
 *           description: The problem description
 *         solution:
 *           type: string
 *           description: The suggested solution
 *         contact:
 *           type: string
 *           description: Contact info
 *         rating:
 *           type: number
 *           description: Rating fro 1 to 5
 *         adminComment:
 *           type: string
 *           description: Admin's comment on the complaint
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the complaint was created
 *       example:
 *         fullName: John Doe
 *         branch: Main Street
 *         problem: Slow service
 *         solution: Hire more staff
 *         contact: john@example.com
 *         rating: 3
 */
