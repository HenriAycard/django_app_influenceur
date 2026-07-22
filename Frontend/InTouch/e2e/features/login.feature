Feature: Login
  Users sign in from the login screen and are routed to their role's home.

  Scenario: An influencer signs in and lands on the influencer home
    Given the login screen is open
    When I sign in as "e2e-influencer@intouch.test" with password "E2e-Pass-123!"
    Then I land on the influencer home

  Scenario: A brand signs in and lands on the brand home
    Given the login screen is open
    When I sign in as "e2e-brand@intouch.test" with password "E2e-Pass-123!"
    Then I land on the brand home

  Scenario: Email capitalization does not block sign-in
    Given the login screen is open
    When I sign in as "E2E-INFLUENCER@INTOUCH.TEST" with password "E2e-Pass-123!"
    Then I land on the influencer home

  Scenario: A wrong password keeps me on the login screen
    Given the login screen is open
    When I sign in as "e2e-influencer@intouch.test" with password "Wrong-Pass-999!"
    Then I stay on the login screen
