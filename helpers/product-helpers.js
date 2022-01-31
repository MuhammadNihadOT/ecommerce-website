var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectId
var bcrypt = require("bcrypt");
const { Db } = require('mongodb')
const { response } = require('express')
module.exports = {

    addProduct: (product, callback) => {
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
            callback(data.insertedId)
        })
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct: (prodID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(prodID) }).then((response) => {
                resolve(response)
            })
        })
    },
    getProductDetails: (prodID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(prodID) }).then((response) => {
                resolve(response)
            })
        })
    },
    updateProduct: (proID, proDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(proID) }, {
                $set: {
                    name: proDetails.name,
                    description: proDetails.description,
                    price: proDetails.price,
                    category: proDetails.category
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    getUserDetails: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectId(userId), status: 'placed' }).toArray()
            resolve(orders)
        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let response = {};
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: userData.email });
            console.log('email true', admin)
            if (admin) {
                bcrypt.compare(userData.password, admin.password).then((status) => {
                    console.log('status', status)
                    if (status) {
                        console.log("login successfully (line 29.54)");
                        response.admin = admin;
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
    getShipping: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let shipped = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
                {
                    $set: {
                        status: 'shipped'
                    }
                }
            )
            resolve(shipped)
        })
    },
    getUserShippedOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectId(userId), status: 'shipped' }).toArray()
            resolve(orders)
        })
    },
}