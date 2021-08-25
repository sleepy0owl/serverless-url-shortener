const { expect, matchTemplate, MatchStyle } = require('@aws-cdk/assert');
const cdk = require('@aws-cdk/core');
const UrlShortner = require('../lib/url-shortner-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new UrlShortner.UrlShortnerStack(app, 'MyTestStack');
    // THEN
    expect(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
