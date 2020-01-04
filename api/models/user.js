const mongoose= require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const userSchema=mongoose.Schema({
  email:{
    type:String,
    unique:true,
    required:true
  },
  password:{
    type:String,
    required:true
  }
});
// Apply the uniqueValidator plugin to enforce uniqueness
userSchema.plugin(uniqueValidator);
module.exports=mongoose.model('user',userSchema);
