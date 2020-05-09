/**
 * @File Name          : mongoConfig.js
 * @Description        : mongodb connection configuration details
 * @Author             : Sharath Bashini
**/
exports.mongodbConfig = {
    // uriAtlas example - mongodb+srv://[USER_NAME]:[PASSWORD]@test-expense-app-cluster-tbiow.mongodb.net
    uriAtlas : 'mongodb+srv://'+process.env.MONGO_USERNAME+':'+process.env.MONGO_PASS+'@'+process.env.MONGO_CLUSTER_NAME,
    db: process.env.MONGO_DB
};