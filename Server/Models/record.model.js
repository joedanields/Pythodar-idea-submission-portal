import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
    fileName:{
        type: String,
        required: true,
    },
    recordTitle:{
        type: String,
        required: true,
    },
    aim:{
        type: String,
        required: true,
    },
    procedure:{
        type: [String],
        required: true,
    },
    program:{
        type: String,
        required: true,
    },
    output:{
        type: String,
        required: true,
    },
    result:{
        type: String,
        required: true,
    }
});

export default mongoose.model('Record', recordSchema);