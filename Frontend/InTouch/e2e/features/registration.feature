Feature: Registration
  New users apply for an account from the sign-up screen. The application is
  reviewed before the account is activated.

  Scenario: An influencer applies for an account
    Given the registration screen is open
    When I apply as an influencer with a social handle
    Then I see the application confirmation
