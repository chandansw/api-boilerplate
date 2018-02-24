import * as EmailValidator from "email-validator";
import { NextFunction, Request, Response, Router } from "express";
import { BadRequest, NotFound, Unauthorized } from "http-errors";
import { requireJWTAuth } from "../../middleware/authorisation.middleware";
import { IUser, User } from "../../model/user.model";

const router = Router() as Router;

// Admin only access for all routes
router.use(requireJWTAuth, (req, res, next) => {
    if (!req.jwt.admin) { throw new Unauthorized("Administrator access required"); }
    next();
});

router.get("/", (req, res, next) => {
    // TODO Pagination
    // TODO Search
    // TODO Filters
    const conditions = { customerId: req.jwt.cid };
    User.find(conditions)
        .then((users) => res.jsonp({ data: users }))
        .catch(next);
});

router.post("/", (req, res, next) => {

    // Validated submitted data
    if (!req.body.name) { throw new BadRequest("You must provide a name"); }
    if (!req.body.login) { throw new BadRequest("You must provide a login"); }
    if (!req.body.password) { throw new BadRequest("You must provide a password"); }
    if (!EmailValidator.validate(req.body.login)) { throw new BadRequest("Your login must be an email address"); }

    const data = {
        admin: !!req.body.admin,
        customerId: req.jwt.cid,
        login: req.body.login,
        name: req.body.name,
        password: req.body.password,
    };

    new User(data).save()
        .then((user) => res.jsonp({ data: user }))
        .catch(next);
});

router.get("/:id", (req, res, next) => {
    const conditions = { _id: req.params.id, customerId: req.jwt.cid };
    User.findOne(conditions)
        .then((user) => {
            if (!user) { throw new NotFound("No User exists with that ID"); }
            res.json({ data: user });
        })
        .catch(next);
});

router.patch("/:id", (req, res, next) => {
    if (!req.body.name) { throw new BadRequest("You must provide a name"); }
    if (!req.body.login) { throw new BadRequest("You must provide a login"); }
    if (!EmailValidator.validate(req.body.login)) { throw new BadRequest("Your login must be an email address"); }

    const data: any = {
        admin: !!req.body.admin,
        login: req.body.login,
        name: req.body.name,
    };

    // Assign password, iff provided, to prevent empty overwrites
    if (req.body.password) { data.password = req.body.password; }

    const conditions = { _id: req.params.id, customerId: req.jwt.cid };

    User.findOneAndUpdate(conditions, data, { new: true })
        .then((user) => {
            if (!user) { throw new NotFound("No User exists with that ID"); }
            res.json({ data: user });
        })
        .catch(next);
});

router.delete("/:id", (req, res, next) => {
    const conditions = { _id: req.params.id, customerId: req.jwt.cid };
    User.findOneAndRemove(conditions)
        .then((user) => {
            if (!user) { throw new NotFound("No User exists with that ID"); }
            res.json({ data: user });
        })
        .catch(next);
});

export = router;