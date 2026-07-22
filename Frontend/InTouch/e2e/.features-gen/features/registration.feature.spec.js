// Generated from: features/registration.feature
import { test } from "../../steps/fixtures.ts";

test.describe('Registration', () => {

  test('An influencer applies for an account', async ({ Given, When, Then, page }) => { 
    await Given('the registration screen is open', null, { page }); 
    await When('I apply as an influencer with a social handle', null, { page }); 
    await Then('I see the application confirmation', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('features/registration.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":5,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"Given the registration screen is open","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":7,"keywordType":"Action","textWithKeyword":"When I apply as an influencer with a social handle","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":8,"keywordType":"Outcome","textWithKeyword":"Then I see the application confirmation","stepMatchArguments":[]}]},
]; // bdd-data-end