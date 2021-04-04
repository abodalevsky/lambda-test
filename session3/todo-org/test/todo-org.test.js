const { expect, matchTemplate, MatchStyle } = require('@aws-cdk/assert');
const cdk = require('@aws-cdk/core');
const TodoOrg = require('../lib/todo-org-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new TodoOrg.TodoOrgStack(app, 'MyTestStack');
    // THEN
    expect(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
