// Generated from: features/collaboration.feature
import { test } from "../../steps/fixtures.ts";

test.describe('Collaboration lifecycle', () => {

  test('The brand accepts a pending application', async ({ Given, When, Then, And, page }) => { 
    await Given('I am signed in as the brand', null, { page }); 
    await When('I open the brand calendar', null, { page }); 
    await And('I open the waiting application from "Noa"', null, { page }); 
    await And('I accept the application', null, { page }); 
    await Then('the collaboration is scheduled', null, { page }); 
  });

  test('The influencer shares their post link', async ({ Given, When, Then, And, page }) => { 
    await Given('I am signed in as the influencer', null, { page }); 
    await When('I open the influencer calendar', null, { page }); 
    await And('I open my past collaboration on "E2E Post Offer"', null, { page }); 
    await And('I submit the post link "https://instagram.com/p/e2e-proof"', null, { page }); 
    await Then('the post is shared with the venue', null, { page }); 
  });

  test('The brand validates a finished collaboration', async ({ Given, When, Then, And, page }) => { 
    await Given('I am signed in as the brand', null, { page }); 
    await When('I open the brand calendar', null, { page }); 
    await And('I open the past collaboration with "Mia"', null, { page }); 
    await And('I validate the collaboration', null, { page }); 
    await Then('the collaboration is marked as validated', null, { page }); 
  });

  test('The brand reports a no-show', async ({ Given, When, Then, And, page }) => { 
    await Given('I am signed in as the brand', null, { page }); 
    await When('I open the brand calendar', null, { page }); 
    await And('I open the past collaboration with "Leo"', null, { page }); 
    await And('I report a no-show', null, { page }); 
    await Then('the collaboration is marked as a no-show', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('features/collaboration.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":6,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am signed in as the brand","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Action","textWithKeyword":"When I open the brand calendar","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":9,"keywordType":"Action","textWithKeyword":"And I open the waiting application from \"Noa\"","stepMatchArguments":[{"group":{"start":36,"value":"\"Noa\"","children":[{"start":37,"value":"Noa","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":10,"gherkinStepLine":10,"keywordType":"Action","textWithKeyword":"And I accept the application","stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"Then the collaboration is scheduled","stepMatchArguments":[]}]},
  {"pwTestLine":14,"pickleLine":13,"tags":[],"steps":[{"pwStepLine":15,"gherkinStepLine":14,"keywordType":"Context","textWithKeyword":"Given I am signed in as the influencer","stepMatchArguments":[]},{"pwStepLine":16,"gherkinStepLine":15,"keywordType":"Action","textWithKeyword":"When I open the influencer calendar","stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":16,"keywordType":"Action","textWithKeyword":"And I open my past collaboration on \"E2E Post Offer\"","stepMatchArguments":[{"group":{"start":32,"value":"\"E2E Post Offer\"","children":[{"start":33,"value":"E2E Post Offer","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":18,"gherkinStepLine":17,"keywordType":"Action","textWithKeyword":"And I submit the post link \"https://instagram.com/p/e2e-proof\"","stepMatchArguments":[{"group":{"start":23,"value":"\"https://instagram.com/p/e2e-proof\"","children":[{"start":24,"value":"https://instagram.com/p/e2e-proof","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":19,"gherkinStepLine":18,"keywordType":"Outcome","textWithKeyword":"Then the post is shared with the venue","stepMatchArguments":[]}]},
  {"pwTestLine":22,"pickleLine":20,"tags":[],"steps":[{"pwStepLine":23,"gherkinStepLine":21,"keywordType":"Context","textWithKeyword":"Given I am signed in as the brand","stepMatchArguments":[]},{"pwStepLine":24,"gherkinStepLine":22,"keywordType":"Action","textWithKeyword":"When I open the brand calendar","stepMatchArguments":[]},{"pwStepLine":25,"gherkinStepLine":23,"keywordType":"Action","textWithKeyword":"And I open the past collaboration with \"Mia\"","stepMatchArguments":[{"group":{"start":35,"value":"\"Mia\"","children":[{"start":36,"value":"Mia","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":26,"gherkinStepLine":24,"keywordType":"Action","textWithKeyword":"And I validate the collaboration","stepMatchArguments":[]},{"pwStepLine":27,"gherkinStepLine":25,"keywordType":"Outcome","textWithKeyword":"Then the collaboration is marked as validated","stepMatchArguments":[]}]},
  {"pwTestLine":30,"pickleLine":27,"tags":[],"steps":[{"pwStepLine":31,"gherkinStepLine":28,"keywordType":"Context","textWithKeyword":"Given I am signed in as the brand","stepMatchArguments":[]},{"pwStepLine":32,"gherkinStepLine":29,"keywordType":"Action","textWithKeyword":"When I open the brand calendar","stepMatchArguments":[]},{"pwStepLine":33,"gherkinStepLine":30,"keywordType":"Action","textWithKeyword":"And I open the past collaboration with \"Leo\"","stepMatchArguments":[{"group":{"start":35,"value":"\"Leo\"","children":[{"start":36,"value":"Leo","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":34,"gherkinStepLine":31,"keywordType":"Action","textWithKeyword":"And I report a no-show","stepMatchArguments":[]},{"pwStepLine":35,"gherkinStepLine":32,"keywordType":"Outcome","textWithKeyword":"Then the collaboration is marked as a no-show","stepMatchArguments":[]}]},
]; // bdd-data-end