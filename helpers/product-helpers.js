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





    getAllBanners:()=>{
        return new Promise(async (resolve, reject) => {
            let banners = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            // console.log('server',banners.length)
            // let lengthForBanner = banners.length
            // let obj ={
            //     banners:banners,
            //     lengthForBanner:lengthForBanner
            // }
            resolve(banners)
        })
    },
    deleteCategory: (categoryID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: objectId(categoryID) }).then((response) => {
                db.get().collection(collection.SUBCATEGORY_COLLECTION).deleteMany({ category: objectId(categoryID) }).then((response) => {
                    db.get().collection(collection.LINK_COLLECTION).deleteOne({ category: objectId(categoryID) }).then((response) => {
                        resolve(response)
                    })
                })
            })
        })
    },
    deleteSubCategory: (subcategoryID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.SUBCATEGORY_COLLECTION).deleteOne({ _id: objectId(subcategoryID) }).then((response) => {
                db.get().collection(collection.LINK_COLLECTION).deleteOne({ subcategoryId: objectId(subcategoryID) }).then((response) => {
                    resolve(response)
                })
            })
        })
    },
    deleteLink:(linkID)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.LINK_COLLECTION).deleteOne({ _id: objectId(linkID) }).then((response) => {
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
                    // price: proDetails.price,
                    // category: proDetails.category
                }
            }).then((response) => {
                resolve(response)
                // console.log(response)
            })
        })
    },







    getUserDetails: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    },

    addSubcategories:(data, CatID) => {
        console.log('server dash ',data)
        console.log('server',CatID)
        let obj ={
            name:data.name,
            link:data.link,
            description:data.description,
            category: objectId(CatID)
        }
        
        // console.log(obj)
        return new Promise(async (resolve, reject) => {
            console.log(obj)
            db.get().collection(collection.SUBCATEGORY_COLLECTION).insertOne(obj).then((data) => {
                    // console.log('ggggggggg',data.insertedId)
                    resolve(data.insertedId)
                })
        })
    },
    getSubCategoryDetails:(suCategoryID)=>{
        return new Promise (async(resolve,reject)=>{
            let response = await db.get().collection(collection.SUBCATEGORY_COLLECTION).find({ category: objectId(suCategoryID) }).toArray()
            // .then((response) => {
                // resolve(response)
                console.log('innnnnnnnnnnnnnnnnnnnsssssssssseeeeeer',response.length)
                if(response.length>0){
                    console.log('available')
                    resolve(response)

                }else{
                    resolve(false)
                    console.log('not available')
                }
            // })
        })
    },
    addLink:(id,data)=>{
        let obj = {
            link: data.link,
            description:data.description,
            subcategoryId : objectId(id)
        }
        console.log('hy',obj)
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.LINK_COLLECTION).insertOne(obj).then((data) => {
                // console.log('ggggggggg',data.insertedId)
                // resolve(data.insertedId)
                resolve(data)
            })
        })
    },
    ViewLinks:(id)=>{
        return new Promise (async(resolve,reject)=>{
            let response = await db.get().collection(collection.LINK_COLLECTION).find({ subcategoryId: objectId(id) }).toArray()
            // .then((response) => {
                // resolve(response)



                console.log('innnnnnnnnnnnnnnnnnnnsssssssssseeeeeer',response.length)
                if(response.length>0){
                    console.log('available')
                    resolve(response)

                }else{
                    resolve(false)
                    console.log('not available')
                }


            // })
        })
    },
    checkHasLink:(id,data,IDforCat_AtatchLink)=>{
        let obj = {
            link: data.link,
            description:data.description,
            subcategoryId : objectId(id),
            category: objectId(IDforCat_AtatchLink)
        }
        return new Promise (async(resolve,reject)=>{
            let response = await db.get().collection(collection.LINK_COLLECTION).find({ subcategoryId: objectId(id) }).toArray()
            // .then((response) => {
                // resolve(response)


                // console.log('innnnnnnnn',response)
                // console.log('innnnnnnnnnnnnnnnnnnnsssssssssseeeeeer',response.length)
                if(response.length === 0){
                    // console.log('link is not available')
                    db.get().collection(collection.LINK_COLLECTION).insertOne(obj).then((data) => {
                        // console.log('ggggggggg',data.insertedId)
                        // resolve(data.insertedId)
                        resolve(data)
                    })
                //     resolve(response)

                }else{
                    resolve(false)
                    // console.log('alaredy link available')
                }


            // })
        })
    },
    getLink:(id)=>{
        return new Promise (async(resolve,reject)=>{
            let response = await db.get().collection(collection.LINK_COLLECTION).find({ _id: objectId(id) }).toArray()
            // .then((response)=>{
                console.log(response)
            // })
            // .toArray()
            // .then((response) => {
                resolve(response)



                // console.log('innnnnnnnnnnnnnnnnnnnsssssssssseeeeeer',response.length)
                // if(response.length>0){
                //     console.log('available')
                //     resolve(response)

                // }else{
                //     resolve(false)
                //     console.log('not available')
                // }


            // })
        })
    },
    updateLink:(id,data)=>{
        return new Promise ((resolve,reject)=>{
            db.get().collection(collection.LINK_COLLECTION).updateOne({ _id: objectId(id) }, {
                $set: {
                    link: data.link,
                    description: data.description,
                    // price: proDetails.price,
                    // category: proDetails.category
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    getSubcategory:(id)=>{
        return new Promise(async(resolve,reject)=>{
            let result = await db.get().collection(collection.SUBCATEGORY_COLLECTION).findOne({_id:objectId(id)})
            // console.log(result,'result is ')
            resolve(result)
        })

    },
    updateSubcategory:(id,data)=>{
        return new Promise ((resolve,reject)=>{
            db.get().collection(collection.SUBCATEGORY_COLLECTION).updateOne({ _id: objectId(id) }, {
                $set: {
                    name: data.name,
                    description: data.description,
                    link:data.link
                    // price: proDetails.price,
                    // category: proDetails.category
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    doSignup: (userData) => {

        // console.log(userData)
    
        return new Promise(async (resolve, reject) => {
    
    
    
        //   var today = new Date();
    
        //   var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    
        //   var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    
        //   var dateTime = date + ' ' + time;
    
    
          let objData = {
            // name: userData.name,
            email: userData.email,
            // date: dateTime,
            password: userData.password
          }
          // console.log(objData.email)
        //   db.get().collection(collection.USER_COLLECTION).findOne({ email: objData.email }).then(async(response) => {
            // console.log(response.email)
            // if (response == null) {
              objData.password = await bcrypt.hash(objData.password, 10);
              db.get().collection(collection.ADMIN_COLLECTION).insertOne(objData).then((data) => {
                // let proID = data.insertedId;
                // db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(proID) }).then((user) => {
                //   response ={
                //     user:user,
                //     login:true
                //   }
    
                //   resolve(response);
                // });
              });
            // } else {
            //   console.log('email is already registerded')
            //   resolve({login:false})
            // }
        //   })
    
        });
      },
      getAdminData:(id)=>{
          return new Promise((resolve,reject)=>{
            db.get().collection(collection.ADMIN_COLLECTION).findOne({_id : objectId(id)}).then((response)=>{
                // console.log(response)res
                resolve(response)
            })
          })
      },
      updateProfile:(data,id)=>{
        //  let data
          return new Promise(async(resolve,reject)=>{
            if(data.password){
                let obj={
                    password:data.password,
                    email:data.email
                }
                console.log('password has')
                obj.password = await bcrypt.hash(obj.password, 10);
                db.get().collection(collection.ADMIN_COLLECTION).updateOne({ _id: objectId(id) }, {
                    $set: {
                        email: obj.email,
                        password:obj.password
                        // description: CategoryDetails.description,
                        // price: proDetails.price,
                        // category: proDetails.category
                    }
                }).then((response) => {
                    resolve(response)
                    // console.log(response)
                })
              }

            db.get().collection(collection.ADMIN_COLLECTION).updateOne({ _id: objectId(id) }, {
                $set: {
                    email: data.email,
                    
                    // description: CategoryDetails.description,
                    // price: proDetails.price,
                    // category: proDetails.category
                }
            }).then((response) => {
                resolve(response)
                // console.log(response)
            })
          })
      },
      FoundEmail:(data)=>{
          return new Promise(async(resolve,reject)=>{
            let result =await db.get().collection(collection.ADMIN_COLLECTION).findOne({email:data.email})
        //     let length = result.length
            if(result !== null){
                console.log('email und')
                resolve({status:true})
            }
            else{
                console.log('email not found!!')
                resolve({status:false})
            }
            // console.log(result)
          })
      },
      ForgotPassword:(data,email)=>{
        return new Promise(async(resolve,reject)=>{
            let obj = {
                password:data.password
            }
            obj.password = await bcrypt.hash(obj.password, 10);
            db.get().collection(collection.ADMIN_COLLECTION).updateOne({ email:email}, {
                $set: {
                    password: obj.password,
                    
                    // description: CategoryDetails.description,
                    // price: proDetails.price,
                    // category: proDetails.category
                }
            }).then((response) => {
                resolve(response)
                // console.log(response)
            })
        })
      },











    
    // let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
    // resolve(users)
    // getUserOrders: (userId) => {
    //     return new Promise(async (resolve, reject) => {
    //         let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectId(userId), status: 'placed' }).toArray()
    //         resolve(orders)
    //     })
    // },
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
    addBanner: (product, callback) => {
        db.get().collection(collection.BANNER_COLLECTION).insertOne(product).then((data) => {
            callback(data.insertedId)
        })
    },
}