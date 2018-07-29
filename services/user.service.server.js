module.exports = function (app) {
    app.get('/api/user', findAllUsers);
    app.get('/api/user/:userId', findUserById);
    app.post('/api/register', createUser);
    app.get('/api/profile', profile);
    app.post('/api/logout', logout);
    app.post('/api/login', login);
    app.put('/api/profile', updateUser);
    app.delete('/api/profile', deleteUser);

    var userModel = require('../models/user/user.model.server');
    var enrollmentModel = require('../models/enrollment/enrollment.model.server');
    var sectionModel = require('../models/section/section.model.server');

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
        var currentUser = req.session['currentUser'];
        if (currentUser) {
            res.send(req.session['currentUser']);
        } else {
            res.json({err: 'No user logged in!'});
        }

    }

    function deleteUser(req, res) {
        var currentUser = req.session['currentUser'];
        var studentSections;
        enrollmentModel.findSectionsForStudent(currentUser._id)
            .then(sections => studentSections = sections )
            .then(() => {
                enrollmentModel.deleteEnrollmentUser(currentUser._id)
                    .then(() => userModel.deleteUser(currentUser._id))
            })
            .then(() => {
                for (let i = 0; i < studentSections.length; i++) {
                    sectionModel.incrementSectionSeats(studentSections[i].section._id)
                        .then((response) => console.log(response));
                }
            }).then(response => res.json(response));
    }


    function createUser(req, res) {
        var user = req.body;
        userModel.findUserByUsername(user.username)
            .then(response => {
                if(response) {
                    res.json({err: 'Username already exist!'})
                } else {
                    userModel.createUser(user)
                        .then(response => {
                            req.session['currentUser'] = response;
                            res.json(response);
                        });
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