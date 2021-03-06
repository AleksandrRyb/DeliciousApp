const mongoose = require('mongoose');
const slug = require('slugs');

mongoose.Promise = global.Promise;

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: "Please enter your name!"
    },
    slug: String,
    description: {
        type: String,
        trim: true
    },
    tags: [String],
    created: {
        type: Date,
        default: Date.now
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [{
            type: Number,
            required: 'You must supply coordinates'
        }],
        address: {
            type: String,
            required: 'You must supply an adress'
        }
    },
    photo: String,
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'You must supply u author!'
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

storeSchema.index({
    name: 'text',
    description: 'text'
});

storeSchema.index({
    location: '2dsphere'
});

storeSchema.pre('save', async function(next) {
    if(!this.isModified('name')){
        next(); //skip it
        return; // stop this function from running
    }
    this.slug = slug(this.name);
    // find other stores that have a slug of wes, wes-1, wes-2
    const slugRegExp = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`);
    const storesWithSlug = await this.constructor.find({ slug: slugRegExp});
    if(storesWithSlug.length){
        this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
    }
    next();
})

storeSchema.statics.getTagsList = function() {
    return this.aggregate([
        { $unwind: '$tags'},
        { $group: { _id: '$tags', count: { $sum: 1} }},
        { $sort: { count: -1 }}
    ]);  
};

storeSchema.statics.getTopStores = function() {
    return this.aggregate([
        { $lookup: { from: 'reviews', localField: '_id', foreignField: 'store', as: 'reviews'}}, 
        { $match: { 'reviews.1': { $exists: true } }},
        { $project: {
            photo: '$$ROOT.photo',
            name: '$$ROOT.name',
            reviews: '$$ROOT.reviews',
            slug: '$$ROOT.slug',
            averageRating: { $avg: '$reviews.rating'}
        }},
        { $sort: { averageRating: -1 }},
        { $limit: 10 }
    ]);
}

//Find reviews where the stores _id property  === reviews store property
storeSchema.virtual('reviews', {
    ref: 'Review', // what model to link?
    localField: '_id', //which field on the store model?
    foreignField: 'store' // which field on the review model? 
});

function autopopulate(next) {
    this.populate('reviews')
    next();
};

storeSchema.pre('find', autopopulate)
storeSchema.pre('findOne', autopopulate)

module.exports = mongoose.model('Store', storeSchema);