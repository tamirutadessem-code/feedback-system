import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

app.use(cors());
app.use(bodyParser.json());

// Database connection
const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
  }
);

sequelize.authenticate()
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.log('❌ Database error:', err.message));

// ---------- Feedback Model ----------
interface FeedbackAttributes {
  id: number;
  rating: number;
  topics: string[];
  createdAt: Date;
  updatedAt: Date;
  wordRating: string | null;
}
interface FeedbackCreationAttributes extends Optional<FeedbackAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Feedback extends Model<FeedbackAttributes, FeedbackCreationAttributes> implements FeedbackAttributes {
  public id!: number;
  public rating!: number;
  public topics!: string[];
  public createdAt!: Date;
  public updatedAt!: Date;
  public wordRating!: string | null;
}

Feedback.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    rating: { type: DataTypes.INTEGER, allowNull: false },
    topics: { type: DataTypes.JSON, allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    wordRating: { type: DataTypes.STRING(50), allowNull: true, field: 'word_rating' },
  },
  {
    sequelize,
    modelName: 'Feedback',
    tableName: 'Feedbacks_new',
    timestamps: false,
  }
);

// ---------- User Model ----------
interface UserAttributes {
  id: number;
  username: string;
  password: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public role!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'user' },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true,
  }
);

// ---------- Sync database and create admin ----------
const initDB = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced');

    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      await User.create({ username: 'admin', password: hashedPassword, role: 'admin' });
      console.log('✅ Admin created (username: admin, password: admin123)');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (err) {
    console.error('❌ Sync error:', err);
  }
};
initDB();

// ---------- Auth Middleware ----------
interface AuthRequest extends Request {
  user?: any;
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

// ---------- Public Routes ----------
app.post('/api/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  console.log('🔐 Login attempt:', username);

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/feedback', async (req: Request, res: Response) => {
  try {
    const { rating, wordRating, topics } = req.body;
    if (!rating || !wordRating || !topics?.length) {
      return res.status(400).json({ error: 'All fields required' });
    }
    const feedback = await Feedback.create({ rating, wordRating, topics });
    res.status(201).json(feedback);
  } catch (err) {
    console.error('Feedback error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------- Protected Routes (Admin Only) ----------
app.get('/api/feedback', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const feedbacks = await Feedback.findAll({ order: [['createdAt', 'DESC']] });
    res.json(feedbacks);
  } catch (err) {
    console.error('Error fetching feedbacks:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/feedback/stats', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const feedbacks = await Feedback.findAll();
    
    // Initialize counts
    const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const wordRatingCounts: Record<string, number> = {};
    const topicCounts: Record<string, number> = {};

    feedbacks.forEach(fb => {
      // Count numeric ratings (1-5)
      if (fb.rating >= 1 && fb.rating <= 5) {
        ratingCounts[fb.rating] = (ratingCounts[fb.rating] || 0) + 1;
      }
      
      // Count word ratings
      if (fb.wordRating) {
        const word = fb.wordRating.trim();
        wordRatingCounts[word] = (wordRatingCounts[word] || 0) + 1;
      }
      
      // Count topics
      if (fb.topics && Array.isArray(fb.topics)) {
        fb.topics.forEach(topic => {
          const cleanedTopic = topic.trim();
          topicCounts[cleanedTopic] = (topicCounts[cleanedTopic] || 0) + 1;
        });
      }
    });

    res.json({ 
      ratingCounts, 
      wordRatingCounts, 
      topicCounts 
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------- Start Server ----------
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));