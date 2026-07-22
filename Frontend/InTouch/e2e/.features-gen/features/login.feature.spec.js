// Generated from: features/login.feature
import { test } from "../../steps/fixtures.ts";

test.describe('Login', () => {

  test('An influencer signs in and lands on the influencer home', async ({ Given, When, Then, page }) => { 
    await Given('the login screen is open', null, { page }); 
    await When('I sign in as "e2e-influencer@intouch.test" with password "E2e-Pass-123!"', null, { page }); 
    await Then('I land on the influencer home', null, { page }); 
  });

  test('A brand signs in and lands on the brand home', async ({ Given, When, Then, page }) => { 
    await Given('the login screen is open', null, { page }); 
    await When('I sign in as "e2e-brand@intouch.test" with password "E2e-Pass-123!"', null, { page }); 
    await Then('I land on the brand home', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('features/login.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":4,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Given the login screen is open","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":6,"keywordType":"Action","textWithKeyword":"When I sign in as \"e2e-influencer@intouch.test\" with password \"E2e-Pass-123!\"","stepMatchArguments":[{"group":{"start":13,"value":"\"e2e-influencer@intouch.test\"","children":[{"start":14,"value":"e2e-influencer@intouch.test","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":57,"value":"\"E2e-Pass-123!\"","children":[{"start":58,"value":"E2e-Pass-123!","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":9,"gherkinStepLine":7,"keywordType":"Outcome","textWithKeyword":"Then I land on the influencer home","stepMatchArguments":[]}]},
  {"pwTestLine":12,"pickleLine":9,"tags":[],"steps":[{"pwStepLine":13,"gherkinStepLine":10,"keywordType":"Context","textWithKeyword":"Given the login screen is open","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":11,"keywordType":"Action","textWithKeyword":"When I sign in as \"e2e-brand@intouch.test\" with password \"E2e-Pass-123!\"","stepMatchArguments":[{"group":{"start":13,"value":"\"e2e-brand@intouch.test\"","children":[{"start":14,"value":"e2e-brand@intouch.test","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":52,"value":"\"E2e-Pass-123!\"","children":[{"start":53,"value":"E2e-Pass-123!","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":15,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"Then I land on the brand home","stepMatchArguments":[]}]},
]; // bdd-data-end