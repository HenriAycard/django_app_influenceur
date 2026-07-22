// Generated from: features/offer_management.feature
import { test } from "../../steps/fixtures.ts";

test.describe('Offer management', () => {

  test.beforeEach('Background', async ({ Given, When, page }, testInfo) => { if (testInfo.error) return;
    await Given('I am signed in as the brand', null, { page }); 
    await When('I open my venue "E2E Test Venue"', null, { page }); 
  });
  
  test('Archiving an offer removes it from the venue\'s list', async ({ When, Then, page }) => { 
    await When('I archive the offer "E2E Archive Offer"', null, { page }); 
    await Then('the offer "E2E Archive Offer" is no longer listed', null, { page }); 
  });

  test('Duplicating an offer opens the editable copy', async ({ When, Then, page }) => { 
    await When('I duplicate the offer "E2E Duplicate Offer"', null, { page }); 
    await Then('I land on the editor of the copy', null, { page }); 
  });

  test('Editing a frozen offer routes to the duplicate path', async ({ When, Then, page }) => { 
    await When('I try to edit the frozen offer "E2E Frozen Offer"', null, { page }); 
    await Then('I am told the terms are frozen', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('features/offer_management.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":11,"pickleLine":10,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in as the brand","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Action","textWithKeyword":"When I open my venue \"E2E Test Venue\"","isBg":true,"stepMatchArguments":[{"group":{"start":16,"value":"\"E2E Test Venue\"","children":[{"start":17,"value":"E2E Test Venue","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":12,"gherkinStepLine":11,"keywordType":"Action","textWithKeyword":"When I archive the offer \"E2E Archive Offer\"","stepMatchArguments":[{"group":{"start":20,"value":"\"E2E Archive Offer\"","children":[{"start":21,"value":"E2E Archive Offer","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":13,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"Then the offer \"E2E Archive Offer\" is no longer listed","stepMatchArguments":[{"group":{"start":10,"value":"\"E2E Archive Offer\"","children":[{"start":11,"value":"E2E Archive Offer","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":16,"pickleLine":14,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in as the brand","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Action","textWithKeyword":"When I open my venue \"E2E Test Venue\"","isBg":true,"stepMatchArguments":[{"group":{"start":16,"value":"\"E2E Test Venue\"","children":[{"start":17,"value":"E2E Test Venue","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":17,"gherkinStepLine":15,"keywordType":"Action","textWithKeyword":"When I duplicate the offer \"E2E Duplicate Offer\"","stepMatchArguments":[{"group":{"start":22,"value":"\"E2E Duplicate Offer\"","children":[{"start":23,"value":"E2E Duplicate Offer","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":18,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"Then I land on the editor of the copy","stepMatchArguments":[]}]},
  {"pwTestLine":21,"pickleLine":18,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in as the brand","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Action","textWithKeyword":"When I open my venue \"E2E Test Venue\"","isBg":true,"stepMatchArguments":[{"group":{"start":16,"value":"\"E2E Test Venue\"","children":[{"start":17,"value":"E2E Test Venue","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":22,"gherkinStepLine":19,"keywordType":"Action","textWithKeyword":"When I try to edit the frozen offer \"E2E Frozen Offer\"","stepMatchArguments":[{"group":{"start":31,"value":"\"E2E Frozen Offer\"","children":[{"start":32,"value":"E2E Frozen Offer","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":23,"gherkinStepLine":20,"keywordType":"Outcome","textWithKeyword":"Then I am told the terms are frozen","stepMatchArguments":[]}]},
]; // bdd-data-end