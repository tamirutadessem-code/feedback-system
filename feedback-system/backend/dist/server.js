"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const sequelize_1 = require("sequelize");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// Database connection
const sequelize = new sequelize_1.Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
});
sequelize.authenticate()
    .then(() => console.log('✅ Database connected'))
    .catch(err => console.log('❌ Database error:', err.message));
class Feedback extends sequelize_1.Model {
}
Feedback.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    rating: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    topics: { type: sequelize_1.DataTypes.JSON, allowNull: false },
    createdAt: { type: sequelize_1.DataTypes.DATE, allowNull: false, defaultValue: sequelize_1.DataTypes.NOW },
    updatedAt: { type: sequelize_1.DataTypes.DATE, allowNull: false, defaultValue: sequelize_1.DataTypes.NOW },
    wordRating: { type: sequelize_1.DataTypes.STRING(50), allowNull: true, field: 'word_rating' },
}, {
    sequelize,
    modelName: 'Feedback',
    tableName: 'Feedbacks_new',
    timestamps: false,
});
class User extends sequelize_1.Model {
}
User.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: sequelize_1.DataTypes.STRING(50), allowNull: false, unique: true },
    password: { type: sequelize_1.DataTypes.STRING(255), allowNull: false },
    role: { type: sequelize_1.DataTypes.STRING(20), allowNull: false, defaultValue: 'user' },
}, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true,
});
// ---------- Sync database and create admin ----------
const initDB = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('✅ Database synced');
        const adminExists = await User.findOne({ where: { username: 'admin' } });
        if (!adminExists) {
            const hashedPassword = bcryptjs_1.default.hashSync('admin123', 10);
            await User.create({ username: 'admin', password: hashedPassword, role: 'admin' });
            console.log('✅ Admin created (username: admin, password: admin123)');
        }
        else {
            console.log('✅ Admin user already exists');
        }
    }
    catch (err) {
        console.error('❌ Sync error:', err);
    }
};
initDB();
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: 'No token provided' });
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
        if (err)
            return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};
const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin')
        return res.status(403).json({ error: 'Admin access required' });
    next();
};
// ---------- Public Routes ----------
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('🔐 Login attempt:', username);
    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const validPassword = bcryptjs_1.default.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, role: user.role });
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
app.post('/api/feedback', async (req, res) => {
    try {
        const { rating, wordRating, topics } = req.body;
        if (!rating || !wordRating || !topics?.length) {
            return res.status(400).json({ error: 'All fields required' });
        }
        const feedback = await Feedback.create({ rating, wordRating, topics });
        res.status(201).json(feedback);
    }
    catch (err) {
        console.error('Feedback error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
// ---------- Protected Routes (Admin Only) ----------
app.get('/api/feedback', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const feedbacks = await Feedback.findAll({ order: [['createdAt', 'DESC']] });
        res.json(feedbacks);
    }
    catch (err) {
        console.error('Error fetching feedbacks:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
app.get('/api/feedback/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const feedbacks = await Feedback.findAll();
        // Initialize counts
        const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        const wordRatingCounts = {};
        const topicCounts = {};
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
    }
    catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
// ---------- Start Server ----------
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
