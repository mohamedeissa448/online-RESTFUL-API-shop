const express= require('express');
const router=express.Router();
const mongoose=require('mongoose');
const Order=require('../models/order');
const Product=require('../models/product');
const checkAuth=require('../configuration/checkAuth');

router.get('/',checkAuth,(req,res,next) => {
  Order.find()
      .select("_id product quantity")
      .populate('product','name price')
      .then(orders =>{
        res.status(200).json({
          count:orders.length,
          orders:orders.map(order=>{
            return  {
             id:order._id ,
             productId:order.product,
             quantity:order.quantity,
             request:{
               type:'GET',
               url:"http://localhost:3000/orders/" + order._id
             }
           }
          })

        });
      })
      .catch(err=>next(err))
});
router.post('/',checkAuth,(req,res,next) => {
  //check if req.body.productId is an actual productId in our DB
  Product.findById(req.body.productId )
         .then(product=>{
           if(product){
             const order=new Order({
               quantity:req.body.quantity,
               product:req.body.productId
             })
             order.save()
                  .then((order)=>{
                    res.status(201).json({
                      message:"order created",
                      order: order
                    });  //201 created
                  })
                  .catch(err=>next(err))
           }else{
          res.status(404).json({message:"product not found"})
           }
         })
         .catch(err=>next(err))
})
router.get('/:orderId',checkAuth,(req,res,next) => {
  Order.findById(req.params.orderId )
       .populate('product','name price')
        .then((order)=>{
          if(order){
            res.status(200).json({
              order:order,
              request:{
                type:"GET",
                url:"http://localhost:3000/orders"
              }
            });
          }else{
            res.status(404).json({
              message:"order doesn't exist"
            })
          }
        })
        .catch(err=>next(err))
});
router.delete('/:orderId',checkAuth,(req,res,next) => {
  Order.remove({ _id : req.params.orderId })
       .then((result)=>{
         res.status(200).json({
           message:"order deleted",
           request:{
             type:"POST",
             url:"http://localhost:3000/orders/",
             body:{
               productId:"ObjectId",
               quantity:"Number"
             }
           }
         })
       })
       .catch(err=>next(err))
});


module.exports=router;
