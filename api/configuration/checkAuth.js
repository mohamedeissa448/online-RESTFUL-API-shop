const config=require('./config');
const jwt=require('jsonwebtoken')

module.exports=(req,res,next) => {
    if(req.headers.authorization){
      const token=req.headers.authorization.split(" ")[1];
      jwt.verify(token, config.secretKey, function(err, decoded) {
      if(err){
        //invalid token
        err.message='Auth failed'
        err.status=401;
        return next(err)
      }
      req.userData=decoded;
      next();
    });
  }else{
    const err=new Error();
    err.message='Auth failed'
    err.status=401;
    return next(err)
  }

};
