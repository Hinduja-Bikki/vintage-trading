const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tradeSchema = new Schema({
    category: {type: String, required: [true, 'category is required']},
    title: {type: String, required: [true, 'Title is required']},
    host: {type: Schema.Types.ObjectId, ref: 'User'},
    author: {type: String, required: [true, 'Author is required']},
    details: {type: String, required: [true, 'Details is required'],
              minLength: [10, 'Atleast 10 characters is required for details']},
    image: {type: String, required: [true, 'Image is required']},
    status: {
        type: String,
        enum: ["Available", "Traded","Pending"],
        required: [true, "Status has to be mentioned"],
      },
    watchList: [{ type: Schema.Types.ObjectId, ref: "User" }],
    offerItemId: { type: Schema.Types.ObjectId, ref: "Trade" },
    offerItemOwner: { type: Schema.Types.ObjectId, ref: "User" }

},
    {timestamps: true}
);

module.exports = mongoose.model('Trade', tradeSchema);