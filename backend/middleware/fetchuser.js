var jwt = require('jsonwebtoken');
const JWT_SECRET = 'ViVeK@08$';

const fetchuser = (req, res, next) => {
    //Get user from JWT TOKEN and add ID to req  object
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ Error: "Unauthorized" })
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next()

    } catch (error) {
        res.status(401).send({ Error: "Unauthorized" })

    }

}
module.exports = fetchuser;