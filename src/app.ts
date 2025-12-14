import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
// import connectDB from './config/database';
import complaintRoutes from './routes/complaintRoutes';
import authRoutes from './routes/authRoutes';
import branchRoutes from './routes/branchRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config();

import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './config/swagger';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Database Connection
// connectDB(); // Removed for Firestore

// Routes
app.use('/api/complaints', complaintRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.send('Plovster Backend is Running');
});

export default app;
