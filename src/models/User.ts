import bcrypt from 'bcryptjs';

export interface IUser {
    id?: string;
    username: string;
    passwordHash: string;
    role: 'admin' | 'manager';
}

export const userConverter = {
    toFirestore(user: IUser): FirebaseFirestore.DocumentData {
        const { id, ...data } = user;
        return data;
    },
    fromFirestore(
        snapshot: FirebaseFirestore.QueryDocumentSnapshot
    ): IUser {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            username: data.username,
            passwordHash: data.passwordHash,
            role: data.role
        };
    }
};

export const comparePassword = async (user: IUser, candidatePassword: string): Promise<boolean> => {
    return await bcrypt.compare(candidatePassword, user.passwordHash);
};
