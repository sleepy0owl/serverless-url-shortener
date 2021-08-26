const cdk = require('@aws-cdk/core');
const dynamodb = require('@aws-cdk/aws-dynamodb');
const lambda = require('@aws-cdk/aws-lambda');
const apigw = require('@aws-cdk/aws-apigateway');
const path = require('path');

class UrlShortnerStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const table = new dynamodb.Table(this, 'sm-url-shortner', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING}
    });

    const fn = new lambda.Function(this, 'sm-url-shortner', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, './src'))
    })

    table.grantReadWriteData(fn);
    fn.addEnvironment('TABLE_NAME', table.tableName);

    const api = apigw.LambdaRestApi(this, 'sm-url-shortner', {
      handler: fn,
      proxy: false
    });

    const short = api.root.addResource('short');
    short.addMethod('POST');
    
    const fetch = short.addResource('{short_id}');
    fetch.addMethod('GET');
  
  }
}

module.exports = { UrlShortnerStack }
