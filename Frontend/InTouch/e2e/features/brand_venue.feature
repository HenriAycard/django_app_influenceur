Feature: Brand venue management
  A brand reviews the offers published on its own venue.

  Scenario: A brand sees an offer on its venue
    Given I am signed in as the brand
    When I open my venue "E2E Test Venue"
    Then I see the offer "E2E Welcome Offer" listed
