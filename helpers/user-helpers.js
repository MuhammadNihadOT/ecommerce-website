var db = require("../config/connection");
var collection = require("../config/collections");
var bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectId;
const { response, request } = require("express");
const { PRODUCT_COLLECTION } = require("../config/collections");
const collections = require("../config/collections");
const Razorpay  = require('razorpay')
var instance = new Razorpay({
  key_id: 'rzp_test_oRITPCrINBQtUV',
  key_secret: 'FQi5yj2UebvB95vcO2EJRgPf',
});

module.exports = {
  doSignup: (userData) => {

    return new Promise(async (resolve, reject) => {
      let objData = {
        name: userData.name,
        emailaddr: userData.emailaddr,
        date: new Date(),
        password: userData.password
      }
      objData.password = await bcrypt.hash(objData.password, 10);
      db.get().collection(collection.USER_COLLECTION).insertOne(objData).then((data) => {
        let proID = data.insertedId;

        db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(proID) }).then((response) => {
          resolve(response);
        });
      });
    });
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let user = await db.get().collection(collection.USER_COLLECTION).findOne({ emailaddr: userData.emailaddr });
      if (user) {
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
            console.log("login successfully (line 29.54)");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("login failed (line 34.48)");
            resolve({ status: false });
          }
        });
      } else {
        console.log("Email not fonud (line 39.49)");
        resolve({ status: false });
      }
    });
  },
  addToCart: (proId, userId) => {
    let proObj = {
      item: objectId(proId),
      quantity: 1
    }
    return new Promise(async (resolve, reject) => {
      let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) });
      if (userCart) {
        let proExist = userCart.products.findIndex(product => product.item == proId)
        if (proExist != -1) {
          db.get().collection(collection.CART_COLLECTION).updateOne(
            { 'products.item': objectId(proId) },
            {
              $inc: { 'products.$.quantity': 1 },
            }).then((response) => {
              resolve();
            });
        } else {
          db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) },
            {
              $push: { products: proObj }
            })
        }
      } else {
        let cartObj = {
          user: objectId(userId),
          products: [proObj],
        };
        db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
          resolve();
        });
      }
    });
  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
        { $match: { user: objectId(userId) } },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $project: {
            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
          }
        }
      ])
        .toArray();
      resolve(cartItems);
    });
  },
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) });
      if (cart) {
        count = cart.products.length;
      }
      resolve(count);
    });
  },
  changeProductQuantity: (details) => {
    details.count = parseInt(details.count)
    details.quantity = parseInt(details.quantity)
    return new Promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        db.get().collection(collection.CART_COLLECTION).updateOne(
          { _id: objectId(details.cartId) },
          {
            $pull: { products: { item: objectId(details.ProductId) } }
          }
        ).then((response) => {
          resolve({ RemoveProduct: true });
        })
      } else {
        db.get().collection(collection.CART_COLLECTION).updateOne(
          { _id: objectId(details.cartId), 'products.item': objectId(details.ProductId) },

          {
            $inc: { 'products.$.quantity': details.count },
          }
        ).then((response) => {
          resolve({ status: true });
        });
      }
    })
  },
  DeleteProductFromCart: (details, userId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.CART_COLLECTION).updateOne(
        { _id: objectId(details.cartId), user: objectId(userId) },
        {
          $pull: { products: { item: objectId(details.productId) } }
        }
      ).then((response) => {
        resolve({ RemoveProduct: true });
      })
    })
  },
  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      total = await db.get().collection(collection.CART_COLLECTION).aggregate([

        { $match: { user: objectId(userId) } },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $project: {
            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ['$quantity', { $convert: { input: '$product.price', to: 'int' } }] } }
          }
        }
      ])
        .toArray();
      resolve(total)

    });
  },
  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
      resolve(cart)

    })
    
  },
  placeOrder: (order, products, totalprice, userId) => {
    products = products.products
    return new Promise(async (resolve, reject) => {
      var today = new Date();
      var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = 'Date&Time '+date+' '+time;
      console.log(dateTime)
      let userData = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })
      let status = order.payment === 'COD' ? 'placed' : 'pending'
      let orderObj = {
        deliveryDetails: {
          mobile: order.mobile,
          address: order.address,
          pincode: order.pincode
        },
        email: userData.emailaddr,
        name: userData.name,
        userId: objectId(order.userId),
        paymentMethod: order.payment,
        products: products,
        totalAmount: totalprice[0].total,
        date: dateTime,
        status: status
      }
      db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {

        db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(userId) })
        resolve(response.insertedId)
      })
    })
  },
  getOrdersList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectId(userId) }).toArray()
      resolve(orders)
    })
  },
  getOrderProducts: (orsderCartId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        { $match: { _id: objectId(orsderCartId) } },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $project: {
            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
          }
        }
      ])
        .toArray();
      resolve(orders)
    })
  },
  getUserDetails: (userId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((response) => {
        resolve(response)
      })
    })
  },
  updateProfile: (userId, userData) => {
    console.log(userId, userData)
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
        $set: {
          name: userData.name,
          emailaddr: userData.emailaddr,
        }
      }).then((response) => {
        resolve(response)
      })
    })
  },
  getProduct: (productId) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(productId) }).then((response) => {
        resolve(response)
      })
    })
  },
  generateRazorpay:(orderId,total)=>{
    total = total[0].total
    return new Promise((resolve,reject)=>{
      instance.orders.create({
        amount: total*100,
        currency: "INR",
        receipt: ''+orderId,
        notes: {
          key1: "value3",
          key2: "value2"
        }
      },(err,order)=>{
        
        if(err){
          console.log(err)
        }else{
         resolve(order)
        }
      })
     
    })
  },
  verifyPayment:(details)=>{
    return new Promise(async(resolve,reject)=>{
      // const {
      //   createHash
      // } = await import('crypto');
      // let hash = createHash('sha256', 'FQi5yj2UebvB95vcO2EJRgPf');
      // // console.log()
      // hash.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
      // hash = hash.digest('hex');
      // 


      const {
        createHmac
      } = await import('crypto');
      
      let hmac = createHmac('sha256', 'FQi5yj2UebvB95vcO2EJRgPf');
      
      hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
      hmac = hmac.digest('hex');
      if(hmac==details['payment[razorpay_signature]']){
          resolve()
        }else{
          reject()
        }


    })
  },
  changePaymentStatus:(orderId)=>{
    console.log('order id : ',orderId)
    return new Promise(async(resolve,reject)=>{
      let shipped = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
      {
          $set: {
              status: 'placed'
          }
      }
  ).then(()=>{
    resolve()
  })
    })
  }

}


