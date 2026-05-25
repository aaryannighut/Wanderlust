const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema , reviewSchema} = require("../schema.js");
const Listing = require("../models/listing.js");


const validateListing = (req,res,next) =>{
    let { error } = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};

//Index Route
router.get("/", wrapAsync(async(req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings} );
}));

//New Route
router.get("/new", (req,res) => {
    res.render("listings/new.ejs");  
});

//Show Route
router.get("/:id", wrapAsync(async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing}); 
}));

//Create Route
router.post("/",validateListing, wrapAsync(async(req,res,next) => {
     let result = listingSchema.validate(req.body);
    console.log(result);
    if(result.error){
        throw new ExpressError(400, result.error);
    }
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
    })
);

//Edit Route
router.get("/:id/edit", wrapAsync(async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/edit", {listing}); 
}));

//Update Route
// router.put("/listings/:id", async(req,res) => {
//     let {id} = req.params;
//     await Listing.findByIdAndUpdate(id, {...req.body.listing});
//     res.redirect(`/listings/${id}`);
// })

//below gives from chatgpt 
router.put("/:id", validateListing, wrapAsync(async (req, res) => {

    let { id } = req.params;
    let data = req.body.listing;
    // ✅ CORRECT check for nested image object
    if (
        !data.image ||
        !data.image.url ||
        data.image.url.trim() === ""
    ) {
        delete data.image; // keep old image
    }

    await Listing.findByIdAndUpdate(id, data);
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
}));


//Delete Route
router.delete("/:id", wrapAsync(async(req,res) => {
    let{id} = req.params;
    let deletedListing= await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted!");
    return res.redirect("/listings");
}));

module.exports = router;