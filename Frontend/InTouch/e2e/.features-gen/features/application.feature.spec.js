// Generated from: features/application.feature
import { test } from "../../steps/fixtures.ts";

test.describe('Applying to a collaboration', () => {

  test('An influencer applies to an open offer', async ({ Given, When, Then, And, page }) => { 
    await Given('I am signed in as the influencer', null, { page }); 
    await When('I open the venue "E2E Test Venue" from the feed', null, { page }); 
    await And('I open the offer "E2E Welcome Offer"', null, { page }); 
    await And('I apply for the collaboration', null, { page }); 
    await Then('my application is confirmed', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('features/application.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":4,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Given I am signed in as the influencer","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":6,"keywordType":"Action","textWithKeyword":"When I open the venue \"E2E Test Venue\" from the feed","stepMatchArguments":[{"group":{"start":17,"value":"\"E2E Test Venue\"","children":[{"start":18,"value":"E2E Test Venue","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":9,"gherkinStepLine":7,"keywordType":"Action","textWithKeyword":"And I open the offer \"E2E Welcome Offer\"","stepMatchArguments":[{"group":{"start":17,"value":"\"E2E Welcome Offer\"","children":[{"start":18,"value":"E2E Welcome Offer","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":10,"gherkinStepLine":8,"keywordType":"Action","textWithKeyword":"And I apply for the collaboration","stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":9,"keywordType":"Outcome","textWithKeyword":"Then my application is confirmed","stepMatchArguments":[]}]},
]; // bdd-data-end