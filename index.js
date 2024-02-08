const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv').config();
const DB = process.env.DB;



const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect( DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("DB is connected");
}).catch((error) => {
    console.log("DB connection error:", error.message);
});

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

const User = mongoose.model("User", userSchema);

// Routes
app.post('/register', async (req, res) => {
    console.log(req.body);
    const { name, email, password, reEnterPassword } = req.body;

    if (!name || !email || !password || !reEnterPassword || (password !== reEnterPassword)) {
        return res.status(400).json({ message: "Please fill all fields and ensure passwords match." });
    }

    try {
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        console.log("User registered successfully");
        res.status(200).json({ message: "User registered successfully" });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: "Error registering user. Please try again." });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });

            

            
        } 
        else{

        console.log('User found:', user);

        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log('Password Match:', passwordMatch);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Password incorrect' });
        }

        res.status(200).json({ message: 'Login successful', user: user }
        );}
    } catch (error) {
        console.error('Error finding user:', error);
        res.status(500).json({ message: 'An error occurred while processing your request.' });
    }

});


// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
});
