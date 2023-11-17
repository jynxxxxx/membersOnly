const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const passport = require("../passport-config");
const bcrypt = require("bcryptjs");
const User = require("../models/users")
const Message = require("../models/messages")
require('dotenv').config()

exports.home_page = asyncHandler(async (req, res) => {
  const messages = await Message.find().populate('user').sort({ post_date: -1 }).exec();

  if (messages.length === 0) {
    res.render("index", {
      title: "Message Board",
      user: req.user,
      messages: "There are no messages"
    });
  }
  
  res.render("index", {
    title: "Message Board",
    user: req.user,
    messages: messages,
    errors: ''
  });
});

exports.secret_post = [
  body('secretcode')
    .custom((value) => {
      return value === process.env.SECRET_CODE;
    })
    .withMessage('Code is incorrect'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const messages = await Message.find().populate('user').sort({ post_date: -1 }).exec();
    const user = req.user;

    if (!errors.isEmpty()) {
      res.render("index", {
        title: "Message Board",
        user: user,
        messages: messages,
        errors: errors.array(),
      });
      return ;
    }

    // Update only the member_status field
    await User.findByIdAndUpdate(user._id, { $set: { member_status: true } });

    return res.redirect("/");
  })
];



exports.signup_page_get = asyncHandler(async (req, res) => {
  res.render("sign-up", {
    title: "Sign Up",
    userExists: false,
    errors: ''
  });
});

exports.signup_page_post = [
  // Validate and sanitize fields.
  body("username")
    .trim()
    .isLength({ min: 1 })
    .withMessage("UserName is required.")
    .custom((value) => !/\s/.test(value)) 
    .withMessage("UserName must not contain spaces.")
    .custom(async value => {
      const userExists = await User.findOne({ username: value })
        .collation({ locale: "en", strength: 2 })
        .exec();
      if (userExists) {
        throw new Error('This username already exists');
      }
    }),
  body("password")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Password is Required.")
    .matches(/^(?=.*[0-9])(?=.*[A-Z])/) 
    .withMessage("Password must contain at least one number and one uppercase letter."),
  body('confirmPassword')
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage('Passwords do not match.'),
    
  asyncHandler(async (req, res, next) => {
    // Extract the validation trueerrors from a request.
    const errors = validationResult(req);
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      username: req.body.username,
      password: hashedPassword,  // Use the hashed password
    });

    if (!errors.isEmpty()) {
      res.render("sign-up", {
        title: "Sign Up",
        userExists: false,
        errors: errors.array(),
      })
      return;
    } else {
      await user.save();

      // Log in the user after signup
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.redirect("/");
      });
    }
  })
];

exports.login_page_get = (req, res, next) => {
  res.render("login", {
    title: "Login",
    errors: false,
  });
};

exports.login_page_post = asyncHandler(async (req, res, next) => {
  await passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err); // Pass any errors to the next middleware
    }

    if (!user) {
      res.render("login", {
        title: "Login",
        errors: true,
        errormsg: info.message
      });
    }
    
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/");
    });
  })(req, res, next);
});

exports.logout_page_get = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

// exports.message_form_get = asyncHandler(async (req, res) => {
//   const messages = await Message.find().sort({post_date: -1}).exec()

//   res.render("messageboard", {
//     title: "Message Board",
//     messages: messages,
//     user: req.user,
//   });
// });

exports.message_form_post = [
  // Validate and sanitize fields.
  body("message")
    .isLength({ min: 1 })
    .withMessage("Cannot be Blank"),
  
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const messages = await Message.find().sort({post_date: -1}).exec()
    const user = req.user
  
    const message = new Message({
      user: user,
      message: req.body.message,
      post_date: Date.now()
    });

    if (!errors.isEmpty()) {
      res.render("messageboard", {
        title: "Message Board",
        user: req.user,
        messages: messages,
        errors: errors.array(),
      })
      return;
    } else {
      await message.save();

      res.redirect("/")
    }
  })
];
