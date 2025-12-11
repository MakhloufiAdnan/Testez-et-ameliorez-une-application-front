/// <reference types="cypress" />

describe('Sessions (admin)', () => {
  const mockSession = {
    id: 1,
    name: 'Yoga doux',
    description: 'Relax',
    date: new Date().toISOString(),
    teacher_id: 4,
    users: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockTeacher = {
    id: 4,
    lastName: 'Doc',
    firstName: 'Gyneco',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockAdminSessionInfo = {
    token: 'token-123',
    type: 'Bearer',
    id: 1,
    username: 'admin@yoga.com',
    firstName: 'Admin',
    lastName: 'Admin',
    admin: true,
  };

  beforeEach(() => {
    // ARRANGE : simule un login admin avant chaque test
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: mockAdminSessionInfo,
    }).as('login');

    cy.intercept('GET', '**/api/session', {
      statusCode: 200,
      body: [mockSession],
    }).as('sessions');

    cy.visit('/login');

    cy.get('input[formControlName="email"]').type('admin@yoga.com');
    cy.get('input[formControlName="password"]').type('Secret123');
    cy.get('form.login-form').submit();

    cy.wait('@login');
    cy.wait('@sessions');
    cy.url().should('include', '/sessions');
  });

  it('liste les sessions', () => {
    // ACT : on est déjà sur /sessions

    // ASSERT
    cy.contains('mat-card-title', 'Rentals available').should('exist');
    cy.contains('mat-card-title', 'Yoga doux').should('exist');
  });

  it('affiche le détail d’une session', () => {
    // ARRANGE
    cy.intercept('GET', '**/api/session/1', {
      statusCode: 200,
      body: mockSession,
    }).as('sessionDetail');

    cy.intercept('GET', '**/api/teacher/4', {
      statusCode: 200,
      body: mockTeacher,
    }).as('teacher');

    // ACT : clic sur "Detail"
    cy.contains('button span', 'Detail').click();

    // ASSERT
    cy.wait('@sessionDetail');
    cy.wait('@teacher');

    cy.contains('h1', 'Yoga Doux').should('exist'); 
    cy.contains('.ml1', mockTeacher.lastName.toUpperCase()).should('exist');

    cy.get('button[mat-icon-button]').first().click();

    cy.url().should('include', '/sessions');
  });

  it('permet à un admin de créer une session', () => {
    // ARRANGE
    cy.intercept('GET', '**/api/teacher', {
      statusCode: 200,
      body: [mockTeacher],
    }).as('getTeachers');

    cy.intercept('POST', '**/api/session', {
      statusCode: 201,
      body: mockSession,
    }).as('createSession');

    // ACT : clic sur "Create"
    cy.contains('button span', 'Create').click();
    cy.wait('@getTeachers');

    cy.get('input[formControlName="name"]').type('Nouvelle session');
    cy.get('input[formControlName="date"]').type('2025-01-01');
    cy.get('mat-select[formControlName="teacher_id"]').click();
    cy.get('mat-option').first().click();
    cy.get('textarea[formControlName="description"]').type('Super session');

    cy.contains('button', 'Save').click();

    // ASSERT
    cy.wait('@createSession');
    cy.url().should('include', '/sessions');
  });

  it('permet à un admin de mettre à jour une session', () => {
    // ARRANGE
    cy.intercept('GET', '**/api/teacher', {
      statusCode: 200,
      body: [mockTeacher],
    }).as('getTeachers');

    cy.intercept('GET', '**/api/session/1', {
      statusCode: 200,
      body: mockSession,
    }).as('sessionDetail');

    cy.intercept('PUT', '**/api/session/1', {
      statusCode: 200,
      body: {
        ...mockSession,
        name: 'Yoga modifié',
      },
    }).as('updateSession');

    // ACT : clic sur "Edit"
    cy.contains('button span', 'Edit').click();
    cy.wait('@getTeachers');
    cy.wait('@sessionDetail');

    cy.get('input[formControlName="name"]').clear().type('Yoga modifié');
    cy.contains('button', 'Save').click();

    // ASSERT
    cy.wait('@updateSession');
    cy.url().should('include', '/sessions');
  });

  it('permet à un admin de supprimer une session depuis le détail', () => {
    // ARRANGE
    cy.intercept('GET', '**/api/session/1', {
      statusCode: 200,
      body: mockSession,
    }).as('sessionDetail');

    cy.intercept('GET', '**/api/teacher/4', {
      statusCode: 200,
      body: mockTeacher,
    }).as('teacher');

    cy.intercept('DELETE', '**/api/session/1', {
      statusCode: 200,
      body: {},
    }).as('deleteSession');

    // ACT : on va sur le détail
    cy.contains('button span', 'Detail').click();
    cy.wait('@sessionDetail');
    cy.wait('@teacher');

    // On clique sur le bouton "Delete"
    cy.contains('button span', 'Delete').click();

    // ASSERT
    cy.wait('@deleteSession');
    cy.url().should('include', '/sessions');
  });
});

describe('Sessions (non admin)', () => {
  const mockSessionNoUsers = {
    id: 1,
    name: 'Yoga doux',
    description: 'Relax',
    date: new Date().toISOString(),
    teacher_id: 4,
    users: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockSessionWithUser = {
    ...mockSessionNoUsers,
    users: [1],
  };

  const mockTeacher = {
    id: 4,
    lastName: 'Doc',
    firstName: 'Gyneco',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockUserSessionInfo = {
    token: 'token-user',
    type: 'Bearer',
    id: 1,
    username: 'user@yoga.com',
    firstName: 'John',
    lastName: 'Doe',
    admin: false,
  };

  beforeEach(() => {
    // ARRANGE : login non-admin et arrivée sur /sessions
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: mockUserSessionInfo,
    }).as('login');

    cy.intercept('GET', '**/api/session', {
      statusCode: 200,
      body: [mockSessionNoUsers],
    }).as('sessions');

    // Pour couvrir le cas /sessions/create où FormComponent appelle TeacherService
    cy.intercept('GET', '**/api/teacher', {
      statusCode: 200,
      body: [mockTeacher],
    }).as('teachers');

    cy.visit('/login');
    cy.get('input[formControlName="email"]').type('user@yoga.com');
    cy.get('input[formControlName="password"]').type('Secret123');
    cy.get('form.login-form').submit();

    cy.wait('@login');
    cy.wait('@sessions');
  });

  it('affiche le bouton Participate et permet de participer', () => {
    // ARRANGE
    cy.intercept('GET', '**/api/session/1', {
      statusCode: 200,
      body: mockSessionNoUsers,
    }).as('sessionDetail');

    cy.intercept('GET', '**/api/teacher/4', {
      statusCode: 200,
      body: mockTeacher,
    }).as('teacher');

    cy.intercept('POST', '**/api/session/1/participate/1', {
      statusCode: 200,
      body: {},
    }).as('participate');

    // ACT
    cy.contains('button span', 'Detail').click();
    cy.wait('@sessionDetail');
    cy.wait('@teacher');

    // ASSERT intermédiaire : bouton Participate visible
    cy.contains('button span', 'Participate').should('exist');

    // ACT : clic sur Participate
    cy.contains('button span', 'Participate').click();

    // ASSERT : appel POST effectué
    cy.wait('@participate');
  });

  it('affiche le bouton Do not participate et permet de se désinscrire', () => {
    // ARRANGE
    cy.intercept('GET', '**/api/session/1', {
      statusCode: 200,
      body: mockSessionWithUser,
    }).as('sessionDetail');

    cy.intercept('GET', '**/api/teacher/4', {
      statusCode: 200,
      body: mockTeacher,
    }).as('teacher');

    cy.intercept('DELETE', '**/api/session/1/participate/1', {
      statusCode: 200,
      body: {},
    }).as('unParticipate');

    // ACT
    cy.contains('button span', 'Detail').click();
    cy.wait('@sessionDetail');
    cy.wait('@teacher');

    // ASSERT intermédiaire
    cy.contains('button span', 'Do not participate').should('exist');

    // ACT : clic sur "Do not participate"
    cy.contains('button span', 'Do not participate').click();

    // ASSERT
    cy.wait('@unParticipate');
  });

  describe('Protection des routes sessions', () => {
    it('redirige vers /login quand un utilisateur non connecté visite /sessions/create', () => {
      // ARRANGE : aucun login ici, on simule un user non connecté

      // ACT : on visite directement /sessions/create
      cy.visit('/sessions/create', { failOnStatusCode: false });

      // ASSERT : AuthGuard nous renvoie sur /login
      cy.url().should('include', '/login');
    });
  });
});
