const aws = require('aws-cdk');
aws.config.update({region:"us-east-1"})

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

async function create_shorturl(body, domain, path){
    let result = {};
    try {
        const dynamodb = new aws.Dynamodb.DocumentClient()
        let shortid = makeid(8);
        let putparam = {
            Tablename: process.env.TABLE_NAME,
            Item: {
                "id": shortid,
                "long_url": body.url
            }
        };
        let putresult = await dynamodb.put(putparam).promise();
        console.log(putresult);
        let shorturl = `https://${domain}/${path}/${id}`;
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

async function retrieve_long_url(param) {
    let result = {};
    try {
        const dynamodb = new aws.Dynamodb.DocumentClient();
        let getparam = {
            Tablename: process.env.TABLE_NAME,
            Key:{
                id: param
            }
        };
        let getresult = await dynamodb.get(getparam).promise();
        console.log(getresult);
        result = {
            success: true,
            longurl: getresult['long_url']
        }
    } catch (error) {
        console.error(error);
        result = {
            success: false,
            message: 'something went wrong'
        }
    }
}

module.exports.handler = async (event, context) => {
    let operation = event.requestContext.http.method;
    let domain = event.requestContext.domainName;
    let path = event.requestContext.path;
    console.log('operation : ', operation);
    console.log('domain : ', domain);
    console.log('path : ', path);
    try {
        if (operation === 'POST') {
            let body = JSON.parse(event.body);
            let result = await create_shorturl(body, domain, path);
            if (result.success) {
                return {
                    statusCode : 200,
                    shorturl: result.shorturl
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