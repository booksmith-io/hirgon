// middleware to verify secure routes

const protected = (req, res, next) => {
    if (
         req.session &&
         req.session.authenticated === true
    ) {
         next();
    } else {
        res.redirect('/login');
    }
};

module.exports.protected = protected;
