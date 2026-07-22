Feature: Collaboration lifecycle
  From a pending application to a validated (or failed) collaboration:
  the brand accepts, the influencer shares their published post, and the
  brand validates — or reports that nobody showed up.

  Scenario: The brand accepts a pending application
    Given I am signed in as the brand
    When I open the brand calendar
    And I open the waiting application from "Noa"
    And I accept the application
    Then the collaboration is scheduled

  Scenario: The influencer shares their post link
    Given I am signed in as the influencer
    When I open the influencer calendar
    And I open my past collaboration on "E2E Post Offer"
    And I submit the post link "https://instagram.com/p/e2e-proof"
    Then the post is shared with the venue

  Scenario: The brand validates a finished collaboration
    Given I am signed in as the brand
    When I open the brand calendar
    And I open the past collaboration with "Mia"
    And I validate the collaboration
    Then the collaboration is marked as validated

  Scenario: The brand reports a no-show
    Given I am signed in as the brand
    When I open the brand calendar
    And I open the past collaboration with "Leo"
    And I report a no-show
    Then the collaboration is marked as a no-show
