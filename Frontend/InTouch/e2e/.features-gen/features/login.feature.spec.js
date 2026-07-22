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

  test('Email capitalization does not block sign-in', async ({ Given, When, Then, page }) => { 
    await Given('the login screen is open', null, { page }); 
    await When('I sign in as "E2E-INFLUENCER@INTOUCH.TEST" with password "E2e-Pass-123!"', null, { page }); 
    await Then('I land on the influencer home', null, { page }); 
  });

  test('A wrong password keeps me on the login screen', async ({ Given, When, Then, page }) => { 
    await Given('the login screen is open', null, { page }); 
    await When('I sign in as "e2e-influencer@intouch.test" with password "Wrong-Pass-999!"', null, { page }); 
    await Then('I stay on the login screen', null, { page }); 
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
  {"pwTestLine":18,"pickleLine":14,"tags":[],"steps":[{"pwStepLine":19,"gherkinStepLine":15,"keywordType":"Context","textWithKeyword":"Given the login screen is open","stepMatchArguments":[]},{"pwStepLine":20,"gherkinStepLine":16,"keywordType":"Action","textWithKeyword":"When I sign in as \"E2E-INFLUENCER@INTOUCH.TEST\" with password \"E2e-Pass-123!\"","stepMatchArguments":[{"group":{"start":13,"value":"\"E2E-INFLUENCER@INTOUCH.TEST\"","children":[{"start":14,"value":"E2E-INFLUENCER@INTOUCH.TEST","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":57,"value":"\"E2e-Pass-123!\"","children":[{"start":58,"value":"E2e-Pass-123!","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":21,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"Then I land on the influencer home","stepMatchArguments":[]}]},
  {"pwTestLine":24,"pickleLine":19,"tags":[],"steps":[{"pwStepLine":25,"gherkinStepLine":20,"keywordType":"Context","textWithKeyword":"Given the login screen is open","stepMatchArguments":[]},{"pwStepLine":26,"gherkinStepLine":21,"keywordType":"Action","textWithKeyword":"When I sign in as \"e2e-influencer@intouch.test\" with password \"Wrong-Pass-999!\"","stepMatchArguments":[{"group":{"start":13,"value":"\"e2e-influencer@intouch.test\"","children":[{"start":14,"value":"e2e-influencer@intouch.test","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":57,"value":"\"Wrong-Pass-999!\"","children":[{"start":58,"value":"Wrong-Pass-999!","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":27,"gherkinStepLine":22,"keywordType":"Outcome","textWithKeyword":"Then I stay on the login screen","stepMatchArguments":[]}]},
]; // bdd-data-end