const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const config = require("../configuration/config");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
//note:check needs req.body to be existed and can only check req.body properties in it.
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Email format is incoorect"),
    check("password")
      .isLength({ min: 8 })
      .withMessage("Password must be 8 characters at least")
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); //400 bad request
    }
    bcrypt.hash(req.body.password, 10, function(err, hash) {
      // Store hash in your password DB.
      if (err) return next(err);
      else {
        const user = new User({
          email: req.body.email,
          password: hash
        });
        user
          .save()
          .then(user => {
            res.status(200).json({ message: "user created" });
          })
          .catch(err => next(err));
      }
    });
  }
);
router.post(
  "/login",
  [
    check("email")
      .isEmail()
      .withMessage("Email format is incoorect"),
    check("password")
      .isLength({ min: 8 })
      .withMessage("Password must be 8 characters at least")
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); //400 bad request
    }
    //check if email exist in DB
    User.find({ email: req.body.email })
      .then(user => {
        if (user.length === 0) {
          res.status(401).json({ message: "user doesn't exist" });
        } else {
          bcrypt
            .compare(req.body.password, user[0].password)
            .then(result => {
              // if res == true,then passwords matched
              if (result) {
                jwt.sign(
                  { email: user[0].email, id: user[0]._id }, //payload
                  config.secretKey,
                  { expiresIn: "1h" },
                  function(err, token) {
                    if (err) {
                      return next(err);
                    } else {
                      console.log(token);
                      res.status(200).json({
                        message: "You are logged in",
                        token: token
                      });
                    }
                  }
                );
              } else {
                res.status(401).json({ message: "Password is incorrect" });
              }
            })
            .catch(err => next(err));
        }
      })
      .catch(err => next(err));
  }
);

router.delete("/:userId", (req, res) => {
  User.remove({ _id: req.params.userId })
    .then(result => {
      res.status(200).json({
        message: "user deleted"
      });
    })
    .catch(err => next(err));
});
module.exports = router;
