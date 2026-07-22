// Generated from: features/brand_venue.feature
import { test } from "../../steps/fixtures.ts";

test.describe('Brand venue management', () => {

  test('A brand sees an offer on its venue', async ({ Given, When, Then, page }) => { 
    await Given('I am signed in as the brand', null, { page }); 
    await When('I open my venue "E2E Test Venue"', null, { page }); 
    await Then('I see the offer "E2E Welcome Offer" listed', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('features/brand_venue.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":4,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Given I am signed in as the brand","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":6,"keywordType":"Action","textWithKeyword":"When I open my venue \"E2E Test Venue\"","stepMatchArguments":[{"group":{"start":16,"value":"\"E2E Test Venue\"","children":[{"start":17,"value":"E2E Test Venue","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":9,"gherkinStepLine":7,"keywordType":"Outcome","textWithKeyword":"Then I see the offer \"E2E Welcome Offer\" listed","stepMatchArguments":[{"group":{"start":16,"value":"\"E2E Welcome Offer\"","children":[{"start":17,"value":"E2E Welcome Offer","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
]; // bdd-data-end