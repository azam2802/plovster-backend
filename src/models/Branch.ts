/**
 * Branch Model for Firestore
 */

export interface IBranch {
    id?: string;
    name: string;
    createdAt: string;
}

export const branchConverter = {
    toFirestore(branch: IBranch): FirebaseFirestore.DocumentData {
        const { id, ...data } = branch;
        return data;
    },
    fromFirestore(
        snapshot: FirebaseFirestore.QueryDocumentSnapshot
    ): IBranch {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            name: data.name,
            createdAt: data.createdAt
        };
    }
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Branch:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the branch
 *         name:
 *           type: string
 *           description: The name of the branch
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the branch was created
 *       example:
 *         name: Филиал Центр
 */
