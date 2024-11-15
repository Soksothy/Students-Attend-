const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Configuration
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let db;
let studentsCollection;

// Connect to MongoDB
async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        db = client.db('student-management');
        studentsCollection = db.collection('students');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}
connectDB();

// Routes
app.get('/api/students', async (req, res) => {
    try {
        const students = await studentsCollection.find({}).toArray();
        console.log('Retrieved students:', students);
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/students/:id', async (req, res) => {
    try {
        const student = await studentsCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/students', async (req, res) => {
    try {
        const result = await studentsCollection.insertOne(req.body);
        res.status(201).json({ _id: result.insertedId, ...req.body });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.put('/api/students/:id', async (req, res) => {
    try {
        const result = await studentsCollection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json({ _id: req.params.id, ...req.body });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/students/:id', async (req, res) => {
    try {
        const result = await studentsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json({ message: 'Student deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await client.close();
        console.log('MongoDB connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));