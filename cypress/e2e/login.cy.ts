/// <reference types="cypress" />

describe('Authentification', () => {
  it('Login successful', () => {
    // ARRANGE
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'fake-token',
        type: 'Bearer',
        id: 1,
        username: 'userName',
        firstName: 'firstName',
        lastName: 'lastName',
        admin: true,
      },
    }).as('login');

    cy.intercept('GET', '**/api/session', {
      statusCode: 200,
      body: [],
    }).as('sessions');

    // ACT
    cy.visit('/login');

    cy.get('input[formControlName="email"]').type('yoga@studio.com');
    cy.get('input[formControlName="password"]').type('test!1234');
    cy.get('form.login-form').submit();

    // ASSERT
    cy.wait('@login');
    cy.wait('@sessions');
    cy.url().should('include', '/sessions');
  });

  it('Login error affiche un message', () => {
    // ARRANGE
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401,
      body: { message: 'Bad credentials' },
    }).as('loginError');

    // ACT
    cy.visit('/login');
    cy.get('input[formControlName="email"]').type('yoga@studio.com');
    cy.get('input[formControlName="password"]').type('wrong');
    cy.get('form.login-form').submit();

    // ASSERT
    cy.wait('@loginError');
    cy.get('.error').should('contain.text', 'An error occurred');
  });

  it('Register successful redirige vers /login', () => {
    // ARRANGE
    cy.intercept('POST', '**/api/auth/register', {
      statusCode: 201,
      body: {},
    }).as('register');

    // ACT
    cy.visit('/register');

    cy.get('input[formControlName="firstName"]').type('John');
    cy.get('input[formControlName="lastName"]').type('Doe');
    cy.get('input[formControlName="email"]').type('user@yoga.com');
    cy.get('input[formControlName="password"]').type('Secret123');

    cy.get('form.register-form').submit();

    // ASSERT
    cy.wait('@register');
    cy.url().should('include', '/login');
  });

  it('Register error affiche un message', () => {
    // ARRANGE
    cy.intercept('POST', '**/api/auth/register', {
      statusCode: 400,
      body: { message: 'Registration error' },
    }).as('registerError');

    // ACT
    cy.visit('/register');

    cy.get('input[formControlName="firstName"]').type('John');
    cy.get('input[formControlName="lastName"]').type('Doe');
    cy.get('input[formControlName="email"]').type('user@yoga.com');
    cy.get('input[formControlName="password"]').type('Secret123');

    cy.get('form.register-form').submit();

    // ASSERT
    cy.wait('@registerError');
    cy.get('.error').should('contain.text', 'An error occurred');
  });

  it('Logout via la toolbar déconnecte et réaffiche Login/Register', () => {
    // ARRANGE : même setup que le login successful
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'fake-token',
        type: 'Bearer',
        id: 1,
        username: 'userName',
        firstName: 'firstName',
        lastName: 'lastName',
        admin: true,
      },
    }).as('login');

    cy.intercept('GET', '**/api/session', {
      statusCode: 200,
      body: [],
    }).as('sessions');

    // ACT : on se connecte
    cy.visit('/login');

    cy.get('input[formControlName="email"]').type('yoga@studio.com');
    cy.get('input[formControlName="password"]').type('test!1234');
    cy.get('form.login-form').submit();

    cy.wait('@login');
    cy.wait('@sessions');

    // Vérifier que la toolbar affiche bien les liens pour user connecté
    cy.contains('span.link', 'Sessions').should('exist');
    cy.contains('span.link', 'Account').should('exist');
    cy.contains('span.link', 'Logout').should('exist');

    // ACT : on clique sur Logout
    cy.contains('span.link', 'Logout').click();

    // ASSERT : on voit les liens Login/Register (état non connecté)
    cy.contains('a.link', 'Login').should('exist');
    cy.contains('a.link', 'Register').should('exist');
  });

  it('le bouton Submit de register est désactivé tant que le formulaire est invalide', () => {
    // ARRANGE
    cy.visit('/register');

    // ASSERT initial : formulaire vide → bouton submit désactivé
    cy.get('button[type="submit"]').should('be.disabled');

    // ACT : on commence à remplir progressivement (toujours invalide au début)
    cy.get('input[formControlName="firstName"]').type('Jo'); // < 3 caractères → invalide
    cy.get('button[type="submit"]').should('be.disabled');

    cy.get('input[formControlName="firstName"]').clear().type('John');
    cy.get('input[formControlName="lastName"]').type('Doe');
    cy.get('input[formControlName="email"]').type('user@yoga.com');
    cy.get('input[formControlName="password"]').type('Secret123');

    // ASSERT final : tous les champs valides → bouton submit activé
    cy.get('button[type="submit"]').should('not.be.disabled');
  });
});
