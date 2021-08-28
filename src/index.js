const aws = require('aws-sdk');
aws.config.update({region:"us-east-1"})

/**
 * Creates a uid of a certain length
 * COPIED from SO
 * @param {Number} length 
 * @returns n characts long alpha-numeric string
 */
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

/**
 * Creates a short url from body object
 * 
 * @param {Object} body 
 * @param {string} domain 
 * @param {path} path 
 * @returns Object with success and short url 
 */
async function create_shorturl(body, domain, path){
    let result = {};
    try {
        const dynamodb = new aws.DynamoDB.DocumentClient();
        let shortid = makeid(8);
        console.log('body : ', body);
        let putparam = {
            TableName: process.env.TABLE_NAME,
            Item: {
                "id": shortid,
                "long_url": body.url
            }
        };
        let putresult = await dynamodb.put(putparam).promise();
        console.log(putresult);
        let shorturl = `https://${domain}${path}${shortid}`;
        result = {
            success: true,
            shorturl: shorturl
        }
    } catch (error) {
        console.error(error);
        result = {
            success: false,
            message: 'something went wrong'
        }
    }
    return result
}

/**
 * Gets the original long url
 * 
 * @param {string} param 
 * @returns Object with success and long/original url
 */
async function retrieve_long_url(param) {
    let result = {};
    try {
        const dynamodb = new aws.DynamoDB.DocumentClient();
        let getparam = {
            TableName: process.env.TABLE_NAME,
            Key:{
                id: param
            }
        };
        let getresult = await dynamodb.get(getparam).promise();
        console.log('get result : ',getresult);
        result = {
            success: true,
            longurl: getresult.Item.long_url
        };
    } catch (error) {
        console.error(error);
        result = {
            success: false,
            message: 'something went wrong'
        };
    }
    return result;
}

module.exports.handler = async (event, context) => {
    let operation = event.requestContext.httpMethod;
    let domain = event.requestContext.domainName;
    let path = event.requestContext.path;
    console.log('operation : ', operation);
    console.log('domain : ', domain);
    console.log('path : ', path);
    try {
        if (operation === 'POST') {
            let reqbody = JSON.parse(event.body);
            let result = await create_shorturl(reqbody, domain, path);
            console.log('create short url result : ',result);
            if (result.success) {
                return {
                    statusCode : 200,
                    body: JSON.stringify({"shorturl": result.shorturl})
                }
            } else {
                return {
                    statusCode: 500,
                    message: result.message
                }
            }
        }else if (operation === 'GET'){
            let param = event.pathParameters.short_id
            let result = await retrieve_long_url(param);
            console.log(result);
            if (result.success) {
                return {
                    statusCode: 301,
                    headers:{
                        Location: result.longurl
                    }
                }
            } else {
                return {
                    statusCode: 500,
                    message: result.message
                }
            }
        }  
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            message: 'something went wrong in event handler'
        }
    }
}