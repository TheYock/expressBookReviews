const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session.authorization) {
        const token = req.session.authorization.accessToken;
        jwt.verify(token, "secret_key", (err, user) => {
            if (!err) {
                req.user = user;
                next();
            } else if (err.name === 'TokenExpiredError') {
                return res.status(403).json({ message: "Token expired" });
            } else if (err.name === 'JsonWebTokenError') {
                return res.status(403).json({ message: "Invalid token" });
            } else {
                return res.status(403).json({ message: "Failed to authenticate token" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
