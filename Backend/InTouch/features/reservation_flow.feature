Feature: Reservation flow
  The full collaboration: an influencer applies, the brand accepts, the
  influencer submits proof of their post, and the brand validates it — or
  reports that nobody showed up.

  Background:
    Given a brand with a venue
    And an open offer
    And an influencer with 5000 Instagram followers

  Scenario: An influencer applies and the brand validates the collaboration
    When the influencer applies to the offer
    Then the application is pending
    When the brand accepts the application
    Then the application is accepted
    Given the collaboration date has passed
    When the influencer submits their post link
    And the brand validates the collaboration
    Then the collaboration is marked as completed

  Scenario: The brand reports a no-show
    Given the influencer has an accepted collaboration in the past
    When the brand reports a no-show
    Then the collaboration is marked as a no-show

  Scenario: An influencer below the follower gate cannot apply
    Given the offer requires 10000 Instagram followers
    When the influencer applies to the offer
    Then the application is rejected
