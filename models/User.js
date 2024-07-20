const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    dateOfRegistration: { type: Date, default: Date.now },
    dob: { type: Date, required: true },
    monthlySalary: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    purchasePower: { type: Number, default: 0 },
    password: { type: String, required: true }
});

module.exports = mongoose.model('User', UserSchema);
