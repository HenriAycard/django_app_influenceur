Feature: Account registration
  Applicants request an account that starts inactive and password-less.
  Influencers must declare at least one social handle.

  Scenario: An influencer registers with a social handle
    When someone registers as an influencer with Instagram handle "@newcomer"
    Then the request succeeds with status 201
    And the new account is inactive
    And the new account has no usable password
    And the new account is flagged as an influencer

  Scenario: An influencer cannot register without a social handle
    When someone registers as an influencer without a social handle
    Then the request is rejected with status 400

  Scenario: A brand registers
    When someone registers as a brand
    Then the request succeeds with status 201
    And the new account is inactive
