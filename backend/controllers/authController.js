const jwt = require("jsonwebtoken");
const User = require('../models/User');

const generateToken = (id) => {
	return jwt.sign({ id },
		process.env.JWT_SECRET,
		{ expiresIn: "1d" }

	)
};

exports.register = async (req, res) => {
	const { fullName, email, password } = req.body;
	if (!fullName || !email || !password) {
		return res.status(400).json({ message: "All fields are required" });
	}
	try {
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: "Email already in use" });
		}

		const user = await User.create({
			fullName,
			email,
			password,
		});
		res.status(201).json({
			id: user._id,
			user,
			token: generateToken(user._id),
		})
	} catch (err) {
		res.status(500).json({ message: "error registering user", error: err.message })
	}


};
exports.login = async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ message: "all fields are required" });
	}
	try {
		const user = await User.findOne({ email });
		if (!user || !(await user.comparePassword(password))) {
			return res.status(400).json({ message: "Invalid Credentials" });
		}
		res.status(200).json({
			message: "successfully logged in ",
			id: user._id,
			user,
			token: generateToken(user._id),
		})
	} catch (err) {
		res.status(500).json({ message: "error in logging user", error: err.message });
	}


};
exports.getUser = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select("-password");

		if (!user) {
			return res.status(404).json({ message: "user not found" });
		}

		res.status(200).json(user);
	} catch (err) {
		res.status(500).json({message:"Error getting user ",error:err.message});
	}
};
