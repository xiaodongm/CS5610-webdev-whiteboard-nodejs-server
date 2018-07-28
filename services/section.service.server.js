module.exports = function (app) {

    app.post('/api/course/:courseId/section', createSection);
    app.get('/api/course/:courseId/section', findSectionsForCourse);
    app.post('/api/student/:sid/section/:kid', enrollStudentInSection);
    app.get('/api/student/:sid/section', findSectionsForStudent);
    app.delete('/api/section/:sectionId', deleteSection);
    app.delete('/api/student/:sid/section/:kid', unEnrollSection);

    var sectionModel = require('../models/section/section.model.server');
    var enrollmentModel = require('../models/enrollment/enrollment.model.server');

    function findSectionsForStudent(req, res) {
        var currentUser = req.session.currentUser;
        var studentId = currentUser._id;
        enrollmentModel
            .findSectionsForStudent(studentId)
            .then(function(enrollments) {
                res.json(enrollments);
            });
    }

    function enrollStudentInSection(req, res) {
        var sectionId = req.params.kid;
        var currentUser = req.session.currentUser;
        if(!currentUser) {
            res.json({err: 'No logged in user!'});
            return;
        }
        var studentId = currentUser._id;
        var enrollment = {
            student: studentId,
            section: sectionId
        };

        sectionModel
            .decrementSectionSeats(sectionId)
            .then(function () {
                return enrollmentModel
                    .enrollStudentInSection(enrollment)
            })
            .then(function (enrollment) {
                res.json(enrollment);
            })
    }

    function findSectionsForCourse(req, res) {
        var courseId = req.params['courseId'];
        sectionModel
            .findSectionsForCourse(courseId)
            .then(function (sections) {
                res.json(sections);
            })
    }

    function createSection(req, res) {
        var section = req.body;
        sectionModel
            .createSection(section)
            .then(function (section) {
                res.json(section);
            })
    }

    function deleteSection(req, res) {
        var sectionId = req.params['sectionId'];
        enrollmentModel.deleteEnrollmentSection(sectionId)
            .then(() => sectionModel.deleteSection(sectionId)
                .then(res.send(200)));

    }

    function unEnrollSection(req, res) {
        var sectionId = req.params['kid'];
        var currentUser = req.session['currentUser'];
        var studentId = currentUser._id;
        const enrollment = {
            student: studentId,
            section: sectionId
        };
        console.log(sectionId);
        console.log(studentId);
        enrollmentModel.unEnrollSection(enrollment)
            .then(() => sectionModel.incrementSectionSeats(sectionId))
            .then(res.send(200));
    }

};