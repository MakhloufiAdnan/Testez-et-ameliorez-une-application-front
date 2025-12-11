/// <reference types="cypress" />

describe('Compte utilisateur (non admin)', () => {
  const mockUser = {
    id: 1,
    email: 'user@yoga.com',
    lastName: 'Doe',
    firstName: 'John',
    admin: false,
    password: 'Secret123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockSessionInfo = {
    token: 'token-123',
    type: 'Bearer',
    id: 1,
    username: 'user@yoga.com',
    firstName: 'John',
    lastName: 'Doe',
    admin: false,
  };

  beforeEach(() => {
    // ARRANGE : login utilisateur non admin
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: mockSessionInfo,
    }).as('login');

    cy.intercept('GET', '**/api/user/1', {
      statusCode: 200,
      body: mockUser,
    }).as('getMe');

    cy.visit('/login');
    cy.get('input[formControlName="email"]').type('user@yoga.com');
    cy.get('input[formControlName="password"]').type('Secret123');
    cy.get('form.login-form').submit();
    cy.wait('@login');
  });

  it('affiche les informations utilisateur et permet la suppression du compte', () => {
    // ACT : on va sur la page Account
    cy.contains('span.link', 'Account').click();
    cy.wait('@getMe');

    // ASSERT : les infos sont visibles
    cy.contains('p', 'Name: John DOE').should('exist');
    cy.contains('p', 'Email: user@yoga.com').should('exist');

    // ARRANGE : mock de la suppression
    cy.intercept('DELETE', '**/api/user/1', {
      statusCode: 200,
      body: {},
    }).as('deleteUser');

    // ACT : clic sur le bouton "Delete my account"
    cy.contains('button span', 'Detail').click();

    // ASSERT : DELETE appelé et redirection
    cy.wait('@deleteUser');
    cy.url().should('include', '/');
  });

  it('permet de revenir en arrière depuis la page compte', () => {
    // ACT : aller sur Account
    cy.contains('span.link', 'Account').click();
    cy.wait('@getMe');

    // ASSERT intermédiaire
    cy.contains('p', 'Email: user@yoga.com').should('exist');

    // ACT : clic sur la flèche back (MeComponent.back())
    cy.get('button[mat-icon-button]').first().click();

    // ASSERT : on revient sur la liste des sessions
    cy.url().should('include', '/sessions');
  });
});

describe('Compte utilisateur (admin)', () => {
  const mockAdminUser = {
    id: 1,
    email: 'admin@yoga.com',
    lastName: 'Admin',
    firstName: 'Admin',
    admin: true,
    password: 'Secret123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockAdminSessionInfo = {
    token: 'token-admin',
    type: 'Bearer',
    id: 1,
    username: 'admin@yoga.com',
    firstName: 'Admin',
    lastName: 'Admin',
    admin: true,
  };

  beforeEach(() => {
    // ARRANGE : login en tant qu'admin
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: mockAdminSessionInfo,
    }).as('loginAdmin');

    cy.intercept('GET', '**/api/user/1', {
      statusCode: 200,
      body: mockAdminUser,
    }).as('getMeAdmin');

    cy.visit('/login');
    cy.get('input[formControlName="email"]').type('admin@yoga.com');
    cy.get('input[formControlName="password"]').type('Secret123');
    cy.get('form.login-form').submit();
    cy.wait('@loginAdmin');
  });

  it('affiche le message "You are admin" pour un compte administrateur', () => {
    // ACT : aller sur Account
    cy.contains('span.link', 'Account').click();
    cy.wait('@getMeAdmin');

    // ASSERT : branche user.admin du template
    cy.contains('p.my2', 'You are admin').should('exist');
    cy.contains('p', 'Delete my account:').should('not.exist');
  });
});
