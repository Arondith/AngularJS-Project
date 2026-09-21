# SharePlate — Interview Notes

## 30-second explanation

SharePlate is an AngularJS food-rescue coordination dashboard. It lets a coordinator record surplus food and community needs, then ranks compatible matches using transparent rules such as food category, service zone, quantity fit, urgency, and cold-storage compatibility. A person still confirms the final handoff.

## What I built

- AngularJS module and controller
- dependency-injected services
- LocalStorage persistence factory
- matching service with explainable scoring
- custom search and text filters
- reusable status and metric directives
- AngularJS form validation
- dynamic list rendering with ng-repeat
- state-driven UI with ng-if, ng-class, ng-model, and ng-options
- Bootstrap 5 responsive layout
- custom responsive CSS and accessibility details

## Why AngularJS

The project was intentionally built with AngularJS 1.8 to demonstrate hands-on understanding of legacy frontend applications that still exist in production environments. The code separates UI state, business logic, and persistence so it is easier to maintain than putting everything in one controller.

## Matching logic

A candidate match must:

1. still be open
2. use the same food category
3. support cold storage when the donated food requires it

Eligible matches are then scored using:

- category compatibility
- same-zone proximity
- quantity fit
- urgency
- cold-chain compatibility

The interface displays the matching reasons so the coordinator can understand why a request was suggested.

## Why human confirmation matters

The application does not automatically assign or dispatch food. A real coordinator still needs to verify food safety, collection timing, organization eligibility, transport availability, and local procedures.

## Production improvements

If this were turned into a real system, I would add:

- authenticated partner accounts
- API/backend service
- persistent database
- audit logs
- food-safety and expiry checks
- geocoding and route optimization
- email/SMS notifications
- organization roles and permissions
- server-side validation
- privacy and data-retention controls
- automated tests and CI

## Strong interview statement

> I used AngularJS for more than a static demo. I structured SharePlate around a controller, reusable services, a persistence factory, custom filters, directives, validation, and state-driven UI. The project also gave me practical experience working with Bootstrap in an AngularJS application.

## Important accuracy note

This project demonstrates current hands-on AngularJS experience. It does **not** represent multiple years of professional AngularJS employment.
