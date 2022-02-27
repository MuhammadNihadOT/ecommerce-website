var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectId
var bcrypt = require("bcrypt");
const { Db } = require('mongodb')
const { response } = require('express')
module.exports = {

    AddCategories: (data, callback) => {
        db.get().collection(collection.CATEGORY_COLLECTION).insertOne(data).then((data) => {
            callback(data.insertedId)
        })
    },
    getAllCategories: () => {
        return new Promise(async (resolve, reject) => {
            let categories = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(categories)
        })
    },
    deleteCategory: (categoryID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: objectId(categoryID) }).then((response) => {
                db.get().collection(collection.SUBCATEGORY_COLLECTION).deleteMany({ category: objectId(categoryID) }).then((response) => {
                    resolve(response)
                })
            })
        })
    },
    deleteSubCategory: (subcategoryID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.SUBCATEGORY_COLLECTION).deleteOne({ _id: objectId(subcategoryID) }).then((response) => {
                resolve(response)
            })
        })
    },
    getCategoryDetails: (CategoryID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id: objectId(CategoryID) }).then((response) => {
                resolve(response)
            })
        })
    },
    updateCategory: (CategoryID, CategoryDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: objectId(CategoryID) }, {
                $set: {
                    name: CategoryDetails.name,
                    description: CategoryDetails.description,
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    getUserDetails: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    },
    addSubcategories: (data, CatID) => {
        let obj = {
            name: data.name,
            link: data.link,
            description: data.description,
            category: objectId(CatID)
        }
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.SUBCATEGORY_COLLECTION).insertOne(obj).then((data) => {
                resolve(data.insertedId)
            })
        })
    },
    getSubCategoryDetails: (suCategoryID) => {
        return new Promise(async (resolve, reject) => {
            let response = await db.get().collection(collection.SUBCATEGORY_COLLECTION).find({ category: objectId(suCategoryID) }).toArray()
            if (response.length > 0) {
                resolve(response)
            } else {
                resolve(false)
            }
        })
    },
    getSubcategory: (id) => {
        return new Promise(async (resolve, reject) => {
            let result = await db.get().collection(collection.SUBCATEGORY_COLLECTION).findOne({ _id: objectId(id) })
            resolve(result)
        })

    },
    updateSubcategory: (id, data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.SUBCATEGORY_COLLECTION).updateOne({ _id: objectId(id) }, {
                $set: {
                    name: data.name,
                    description: data.description,
                    link: data.link
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    getAdminData: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ADMIN_COLLECTION).findOne({ _id: objectId(id) }).then((response) => {
                resolve(response)
            })
        })
    },
    updateProfile: (data, id) => {
        return new Promise(async (resolve, reject) => {
            if (data.password) {
                let obj = {
                    name: data.name,
                    email: data.email,
                    password: data.password
                }
                obj.password = await bcrypt.hash(obj.password, 10);
                db.get().collection(collection.ADMIN_COLLECTION).updateOne({ _id: objectId(id) }, {
                    $set: {
                        email: obj.email,
                        password: obj.password,
                        name: obj.name
                    }
                }).then((response) => {
                    resolve(response)
                })
            } else {
                db.get().collection(collection.ADMIN_COLLECTION).updateOne({ _id: objectId(id) }, {
                    $set: {
                        email: data.email,
                        name: data.name
                    }
                }).then((response) => {
                    resolve(response)
                })
            }
        })
    },
    FoundEmail: (data) => {
        return new Promise(async (resolve, reject) => {
            let result = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: data.email })
            if (result !== null) {
                resolve({ status: true })
            }
            else {
                resolve({ status: false })
            }
        })
    },
    ForgotPassword: (data, email) => {
        return new Promise(async (resolve, reject) => {
            let obj = {
                password: data.password
            }
            obj.password = await bcrypt.hash(obj.password, 10);
            db.get().collection(collection.ADMIN_COLLECTION).updateOne({ email: email }, {
                $set: {
                    password: obj.password,
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let response = {};
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: userData.email });
            if (admin) {
                bcrypt.compare(userData.password, admin.password).then((status) => {
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

    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            let objData = {
                email: userData.email,
                password: userData.password
            }
            objData.password = await bcrypt.hash(objData.password, 10);
            db.get().collection(collection.ADMIN_COLLECTION).insertOne(objData).then((data) => {
            });
        });
    },
}