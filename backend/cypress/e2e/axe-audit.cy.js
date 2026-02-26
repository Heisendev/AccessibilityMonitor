import urls from '../fixtures/urls.json';

describe('Accessibility Audit', () => {
  urls.forEach(({ id, name, url }) => {
    it(`audits: ${name} (${url})`, () => {
      cy.visit(url, { failOnStatusCode: false });
      cy.injectAxe();
      cy.checkA11y(
        null,
        {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21aa'],
          },
        },
        (violations) => {
          if (violations.length > 0) {
            const slim = violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              description: v.description,
              help: v.help,
              helpUrl: v.helpUrl,
              nodesCount: v.nodes?.length ?? 1,
            }));
            cy.task('reportViolations', { urlId: id, violations: slim });
          }
        },
        // skipFailures = true: don't fail the test, just collect violations
        true
      );
    });
  });
});
