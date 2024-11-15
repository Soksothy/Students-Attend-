// To run this script, use the command: `node generate_students.js`
// Ensure you have MongoDB running and the "mongodb" package installed by running `npm install mongodb`

try {
    const { MongoClient } = require('mongodb');
} catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
        console.error('The "mongodb" package is not installed. Please run "npm install mongodb" and try again.');
        process.exit(1);
    } else {
        throw e;
    }
}

async function generateStudents() {
    const uri = 'mongodb://localhost:27017'; // Replace with your MongoDB connection string
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const database = client.db('student-management'); // Updated database name
        const studentsCollection = database.collection('students');

        const grades = ['A', 'B', 'C', 'D'];
        const students = [];

        for (let i = 1; i <= 500; i++) {
            students.push({
                name: `Student ${i}`,
                email: `student${i}@example.com`,
                studentId: `S${i}`,
                grade: grades[Math.floor(Math.random() * grades.length)]
            });
        }

        await studentsCollection.insertMany(students);
        console.log('500 students inserted successfully');
    } catch (error) {
        console.error('Error inserting students:', error);
    } finally {
        await client.close();
    }
}

generateStudents();