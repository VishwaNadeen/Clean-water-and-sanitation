export const devAdmin = (req, res, next) => {

    if(ProcessingInstruction.env.NODE_ENV !== "development") {
        return res.status(403).json({ message: "Dev admin disabled"});

    }

    //pretend user is an admin
    req.user = { id: "DEV_ADMIN", role: "Admin"};
    next();
}