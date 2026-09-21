# SharePlate — Food Rescue Coordination Dashboard

**SharePlate** is an AngularJS + Bootstrap portfolio project that explores a real coordination problem: edible surplus food is often discarded while community organizations still need reliable food donations.

The app demonstrates how a lightweight web interface can help a coordinator:

**record surplus food → record community needs → rank compatible matches → confirm a handoff → track estimated impact**

> SharePlate is a portfolio prototype. It is not a production food-safety, logistics, or emergency-response system.

## Why this project

Food-rescue work involves more than displaying donation listings. Coordinators need to compare food type, quantity, location, urgency, storage requirements, and pickup windows before deciding where an offer should go.

SharePlate turns those details into a clear workflow while keeping the final decision with a person.

## Features

- Responsive, accessible dashboard built with Bootstrap 5 and custom CSS
- AngularJS 1.8 application structure
- Surplus-food intake form with validation
- Community-need intake form
- Explainable matching score based on category, distance zone, quantity, urgency, and cold-storage compatibility
- Human confirmation before a match is marked complete
- Search and status filters
- LocalStorage persistence
- Impact estimates for food rescued and meals supported
- Resettable sample data for portfolio demonstrations
- Empty states, validation messages, and mobile-friendly layouts

## AngularJS concepts demonstrated

- `angular.module()`
- controllers
- services and factories
- dependency injection
- `ng-model`
- `ng-submit`
- `ng-repeat`
- `ng-if`
- `ng-class`
- `ng-options`
- custom filters
- reusable directives
- form validation
- computed view-model state

## Matching model

The prototype uses transparent rules rather than hidden AI scoring.

A match score considers:

- food category compatibility
- quantity that can be accepted
- same-zone proximity
- request urgency
- refrigerated-storage compatibility

The interface shows **why** a suggested match ranked highly. A coordinator must still confirm the handoff.

## Tech stack

- AngularJS 1.8.2
- Bootstrap 5
- HTML5
- CSS3
- JavaScript
- Browser LocalStorage

No build step is required.

## Run locally

Clone the repository and open it through a local web server.

~~~bash
python -m http.server 8000
~~~

Then visit:

~~~text
http://localhost:8000
~~~

## Project structure

- `index.html` — accessible AngularJS interface and Bootstrap layout
- `styles.css` — custom responsive visual system
- `app.js` — AngularJS module, controller, services, filter, directive, sample data, and matching logic
- `docs/INTERVIEW_NOTES.md` — concise explanation for recruiters and interviews

## Responsible design notes

A real deployment would require:

- verified partner organizations
- food-safety procedures and expiry validation
- secure authentication and permissions
- a backend database
- audit logs
- geocoding and route planning
- privacy controls
- notification integrations
- organization-specific operating rules

The current version intentionally keeps matching explainable and requires human confirmation before a handoff is completed.

## Portfolio talking point

> I built SharePlate to learn and demonstrate AngularJS in a real-world coordination use case. The application uses AngularJS controllers, services, dependency injection, directives, filters, form validation, and state-driven UI, while Bootstrap and custom CSS provide a responsive interface. Its matching logic is transparent so the user can see why a food offer and community need are compatible.

## Author

**Charles Luke Templonuevo**

Portfolio: https://charles-luke-templonuevo.vercel.app/

GitHub: https://github.com/Arondith
