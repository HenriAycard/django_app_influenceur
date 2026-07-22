Feature: Applying to a collaboration
  A signed-in influencer browses from the feed to a venue's offer and applies.

  Scenario: An influencer applies to an open offer
    Given I am signed in as the influencer
    When I open the venue "E2E Test Venue" from the feed
    And I open the offer "E2E Welcome Offer"
    And I apply for the collaboration
    Then my application is confirmed

  Scenario: The follower gate blocks an under-qualified influencer
    Given I am signed in as the influencer
    When I open the venue "E2E Test Venue" from the feed
    And I open the offer "E2E Gated Offer"
    And I apply for the collaboration
    Then I am told I do not meet the follower requirements
