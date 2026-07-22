Feature: Offer management
  The brand manages its offers from the venue screen: archiving retires an
  offer, duplicating opens a fresh editable copy, and a frozen offer routes
  editing to the duplicate path.

  Background:
    Given I am signed in as the brand
    When I open my venue "E2E Test Venue"

  Scenario: Archiving an offer removes it from the venue's list
    When I archive the offer "E2E Archive Offer"
    Then the offer "E2E Archive Offer" is no longer listed

  Scenario: Duplicating an offer opens the editable copy
    When I duplicate the offer "E2E Duplicate Offer"
    Then I land on the editor of the copy

  Scenario: Editing a frozen offer routes to the duplicate path
    When I try to edit the frozen offer "E2E Frozen Offer"
    Then I am told the terms are frozen
