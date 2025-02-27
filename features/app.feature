Feature: Basic App Functionality
  As a user
  I want to interact with the app
  So that I can use its features

  Scenario: App loads successfully
    Given I am on the homepage
    Then I should see the app content

  Scenario: Button click interaction
    Given I am on the homepage
    When I click the button
    Then I should see the count increase to "1" 