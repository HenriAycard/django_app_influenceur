Feature: Offer lifecycle
  A brand posts an offer; its terms freeze the moment an influencer applies;
  the brand duplicates it to change a frozen deal, and archives it when done.

  Background:
    Given a brand with a venue
    And an influencer with 5000 Instagram followers

  Scenario: A brand posts an offer on its own venue
    When the brand creates an offer named "Summer tasting"
    Then the request succeeds with status 201
    And the new offer is editable

  Scenario: An offer freezes once an influencer has applied
    Given an open offer
    And the influencer has applied to the offer
    When the brand renames the offer to "New terms"
    Then the request is rejected with status 400
    And the offer keeps its name

  Scenario: Duplicating a frozen offer yields a fresh editable copy
    Given an open offer
    And the influencer has applied to the offer
    When the brand duplicates the offer
    Then the request succeeds with status 201
    And the copy is editable
    And the original offer is still frozen

  Scenario: Archiving hides an offer from influencers but keeps it for the brand
    Given an open offer
    When the brand archives the offer
    Then the request succeeds with status 204
    And the offer is hidden from the influencer's catalog
    And the offer still appears in the brand's listing
