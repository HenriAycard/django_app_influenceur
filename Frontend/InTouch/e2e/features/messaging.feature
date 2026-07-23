Feature: Messaging
  The influencer opens a conversation with a venue, reads the venue's message
  and replies — the reply shows up in the thread.

  Scenario: The influencer reads and replies in a conversation
    Given I am signed in as the influencer
    When I open my messages
    And I open the conversation with "E2E Test Venue"
    Then I see the message "Hi Ivy, welcome!" in the thread
    When I send the message "See you Friday!"
    Then I see the message "See you Friday!" in the thread
