module.exports = function (app) {
    app.get('/api/user', findAllUsers);
    app.get('/api/user/:userId', findUserById);
    app.post('/api/user', createUser);
    app.get('/api/profile', profile);
    app.post('/api/logout', logout);
    app.post('/api/login', login);
    app.put('/api/profile', updateUser);

    var userModel = require('../models/user/user.model.server');

    function login(req, res) {
        var credentials = req.body;
        userModel
            .findUserByCredentials(credentials)
            .then(function(user) {
                if (!user){
                    res.json({err: 'Username not exist!'})
                } else {
                    req.session['currentUser'] = user;
                    res.json(user);
                }
            })
    }

    function logout(req, res) {
        req.session.destroy();
        res.send(200);
    }

    function findUserById(req, res) {
        var id = req.params['userId'];
        userModel.findUserById(id)
            .then(function (user) {
                res.json(user);
            })
    }

    function updateUser(req, res) {
        var user = req.body;
        req.session['currentUser'] = user;
        userModel.updateUser(user)
            .then(response => res.json(response));
    }

    function profile(req, res) {
        res.send(req.session['currentUser']);
    }


    function createUser(req, res) {
        var user = req.body;
        req.session['currentUser'] = user;
        userModel.findUserByUsername(user.username)
            .then(response => {
                if(response) {
                    res.json({err: 'Username already exist!'})
                } else {
                    userModel.createUser(user)
                        .then(response => res.json(response));
                }
            })
    }

    function findAllUsers(req, res) {
        userModel.findAllUsers()
            .then(function (users) {
                res.send(users);
            })
    }
};