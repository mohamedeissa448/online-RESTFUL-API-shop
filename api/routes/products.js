const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const checkAuth = require("../configuration/checkAuth");

//to upload files
var multer = require("multer");

router.get("/", (req, res, next) => {
  Product.find()
    .select("_id name price productImage") //which fields you want to retrieve
    .then(docs => {
      if (docs.length > 0) {
        //send docs with some meta data
        const response = {
          count: docs.length,
          products: docs.map(doc => {
            return {
              _id: doc._id,
              name: doc.name,
              price: doc.price,
              productImage: doc.productImage,
              request: {
                type: "GET",
                url: "http://localhost:3000/products/" + doc._id
              }
            };
          })
        };
        res.status(200).json(response);
      } else res.status(200).json({ err: "no products" });
    })
    .catch(err => next(err));
});
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
function fileFilter(req, file, cb) {
  // The function should call `cb` with a boolean
  // to indicate if the file should be accepted
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    // To accept the file pass `true`, like so:
    cb(null, true);
  } else {
    // To reject this file pass `false`, like so:
    cb(new Error("Please provide an image file"), false);
  }
}
var upload = multer({
  storage: storage,
  limits: {
    fieldSize: 1024 * 1024 * 5 //max size 5 mega bytes
  },
  fileFilter: fileFilter
});
router.post("/", checkAuth, upload.single("productImage"), (req, res, next) => {
  const product = new Product({
    name: req.body.name,
    price: req.body.price,
    productImage: "products/uploads/" + req.file.filename
  });
  product
    .save()
    .then(product => {
      res.status(201).json({
        //201  created
        createdProduct: {
          name: product.name,
          id: product._id,
          price: product.price,
          productImage: product.productImage,
          request: {
            type: "GET",
            url: "http://localhost:3000/products/" + product._id
          }
        }
      });
    })
    .catch(err => next(err));
});
router.get("/:productId", (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .select("_id name price productImage")
    .then(doc => {
      if (doc) res.status(200).json({ product: doc });
      else res.status(404).json({ err: "not found" });
    })
    .catch(err => next(err));
});
router.patch("/:productId", checkAuth, (req, res, next) => {
  const id = req.params.productId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  console.log(updateOps);
  Product.update({ _id: id }, { $set: updateOps })
    .then(res => {
      res.status(200).json({
        message: "product updated",
        request: {
          type: "GET",
          url: "http://localhost:3000/products/" + id
        }
      });
    })
    .catch(err => next(err));
});
router.delete("/:productId", checkAuth, (req, res, next) => {
  const id = req.params.productId;
  Product.remove({ _id: id })
    .then(result => {
      res.status(200).json({
        message: "product deleted",
        request: {
          type: "POST",
          url: "http://localhost:3000/products/" + id,
          data: { name: "string", price: "number" }
        }
      });
    })
    .catch(err => next(err));
});
module.exports = router;
