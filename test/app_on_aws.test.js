const { expect, matchTemplate, MatchStyle } = require('@aws-cdk/assert');
const cdk = require('@aws-cdk/core');
const AppOnAws = require('../lib/app_on_aws-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new AppOnAws.AppOnAwsStack(app, 'MyTestStack');
    // THEN
    expect(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
