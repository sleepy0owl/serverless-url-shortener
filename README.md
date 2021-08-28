# Welcome serverless url-shortener using CDK & JavaScript

This is a blank project for JavaScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app. The build step is not required when using JavaScript.

## Useful commands

 * `npm run test`         perform the jest unit tests
 * `cdk deploy`           deploy this stack to your default AWS account/region
 * `cdk diff`             compare deployed stack with current state
 * `cdk synth`            emits the synthesized CloudFormation template

## Useage
### Create short URL
* URL

```js
https://1q7b9lfsr3.execute-api.us-east-1.amazonaws.com/prod/short/
```
* Method

`POST`
* Payload
```json
{ "url" : <Your long url>}
```
* Response
    * Code: 200
    * Content
    ```json
    {
  "shorturl": "https://1q7b9lfsr3.execute-api.us-east-1.amazonaws.com/prod/short/<short_url_id>"
    }
    ```
****
### Goto original url
* URL <**Response from short URL create**>

```js
https://1q7b9lfsr3.execute-api.us-east-1.amazonaws.com/prod/short/<{short_url_id}>
```
* Params
    * Path parameter  `{short_id}`
* Response
    * Code: 301
    * Response header will have 
    ```js
    { Location: <original url> }
    ```