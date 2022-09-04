const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../model/User");
const { client } = require("../config/database");
const { sendMailConfirmation } = require("../config/mailer");

const register = async (req, res) => {
    try {
        client.get(
            "SELECT * FROM users WHERE email=?",
            [req.body.email],
            (error, user) => {
                if (error) throw error;
                if (user) {
                    res.status(403).json({message: "There is already an account associated with this email."});
                } else {
                    const token = jwt.sign( { data: req.body.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "10m" } );
                    User.create(
                        { email: req.body.email, password: req.body.password, role: "user", confirmation_token: token },
                        async () => {
                            sendMailConfirmation(token, req.body.email, () => {
                                res.status(200).json({message: "Your registration is done successfully."});
                            });
                        }
                    );
                }
            }
        );
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

const verify = (req, res) => {
    try {
        const token = req.params.token;
        if (!token) {
            return res.sendStatus(401);
        }
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
            if ( error && error.name !== 'TokenExpiredError') {
                return res.status(401).json({message: "Invalid Token."});
            } else if ( error && error.name === 'TokenExpiredError') {
                return res.status(401).json({message: "Token expired."});
            }
            client.get("SELECT * FROM users WHERE email=?", [user.data], (error, userDB) => {
                if (error) throw error;
                if (userDB.confirmation_token == token && !userDB.confirmed) {
                    User.updateConfirmationToken({id: userDB.id, confirmationToken: null, confirmed: 1}, async () => {
                        delete userDB.password;
                        const accessToken = await jwt.sign(userDB, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1800s" });
                        const refreshToken = await jwt.sign(userDB, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1y" });
                        return  res.status(200).json({ accessToken, refreshToken, message: "Your Confirmation is done successfully."});
                    })
                } else {
                    if ( userDB.confirmation_token != token ) {
                        return res.status(401).json({message: "Invalid Token."});
                    }
                    if (userDB.confirmed) {
                        return res.status(401).json({message: "User is already confirmed."});
                    }
                }
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
};

const login = (req, res) => {
    try {
        client.get(
            "SELECT * FROM users WHERE email=?",
            [req.body.email], 
            (error, user) => {
                if (error || !user) return res.status(401).json({ message: "invalids credentials."})
                bcrypt.compare(req.body.password, user.password,
                    function (err, result) {
                        if (error || !result) return res.status(401).json({ message: "invalids credentials."})
                        if ( user.confirmed) {
                            delete user.password;
                            const accessToken = jwt.sign( user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1800s" } );
                            const refreshToken = jwt.sign( user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1y" } );
                            return res.status(200).send({ accessToken, refreshToken });
                        } else {
                            const confirmationToken = jwt.sign( { data: req.body.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "10m" } );
                            User.updateConfirmationToken({id: user.id, confirmationToken, confirmed: null }, () => {
                                sendMailConfirmation(confirmationToken, user.email, () => {
                                    res.status(200).json({message: "Your registration is done successfully."});
                                });
                                return res.status(401).json({ message: "User not confirmed, Please confirm your subscription with email."})
                            })
                        }
                    }
                );
            }
        );
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
};

const refreshToken = (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(` `)[1];
    if (!token) { return res.sendStatus(401); }
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
        if (error) {
            return res.sendStatus(401);
        } else {
            client.get(
                "SELECT * FROM users WHERE email=?",
                [user.email],
                (error, userDB) => {
                    if (error || !userDB) return res.status(401).send("User not existe.");
                    if (userDB.confirmed){
                        delete userDB.password;
                        const accessToken = jwt.sign( userDB, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1800s" } );
                        return res.status(200).send({ accessToken });
                    } else {
                        const confirmationToken = jwt.sign( { data: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "10m" } );
                        User.updateConfirmationToken({id: user.id, confirmationToken, confirmed: 0 }, () => {
                            sendMailConfirmation(confirmationToken, user.email, () => {
                                res.status(200).json({message: "Your registration is done successfully."});
                            });
                            return res.status(401).json({ message: "User not confirmed, Please confirm your subscription with email."})
                        })
                    }
                }
            );
        }
    });
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(` `)[1];
    if (!token) { return res.sendStatus(401); }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
        if (error) {
            return res.sendStatus(401);
        } else {
            client.get(
                "SELECT * FROM users WHERE email=?",
                [user.email],
                (error, userDB) => {
                    if (error) throw error;
                    if (userDB && userDB.confirmed) {
                        req.user = user;
                        next();
                    } else if (userDB && !userDB.confirmed) {
                        res.status(401).send("User not confirmed.");
                        return;
                    } else {
                        res.status(401).send("User not existe.");
                        return;
                    }
                }
            );
        }
    });
};

module.exports = { register, login, refreshToken, authenticateToken, verify };
