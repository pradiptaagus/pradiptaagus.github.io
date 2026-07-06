+++
title = 'Utilize a Component as Injection Token in Angular'
description = 'Using a parent component as an injection token to provide values to descendant components'
date = '2025-10-09'
draft = false
categories = ['article']
tags = ['angular', 'typescript', 'dependency-injection', 'frontend']

[cover]
  image = 'images/blog/component-as-injection-token.png'
  alt = 'Component as Injection Token in Angular'
+++

Dependency injection (DI) is a fundamental feature in Angular. Implementing DI helps adhere to the SOLID principle, specifically promoting loose-coupling between modules. This makes the codebase understandable, flexible, and maintainable. The core idea of DI is to separate business logic and view logic, allowing the business logic (in the form of service) to be easily reusable across components, as long as the Dependency Provider covers those components.

Normally, when you generate a service using Angular CLI, the resulting class includes the `@Injectable({provideIn: 'root'})` decorator. This service becomes a singleton and lives in the Environment Injector unless explicitly declared as a provider at the component or module level.

However, sometimes you need a simple DI mechanism to provide values to descendant components without creating a full, application-wide singleton service. Instead of a dedicated `@Injectable()` service, you can leverage a parent component as an injection token. This allows the parent component's instance to be injected directly into its children.

This demonstration uses a breadcrumb component to illustrate how a parent component's instance (and its properties) can be injected into its child components.

```typescript
import { Component, input } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
    selector: 'app-breadcrumb',
    standalone: true,
    template: '<ng-content />',
    styles: [
        `
            :host {
                display: block;
            }
        `
    ],
    providers: [
        { provide: BreadcrumbComponent, useExisting: forwardRef(() => BreadcrumbComponent) }
    ]
})
class BreadcrumbComponent {
    public readonly separator = input<string>('/')
}

@Component({
    selector: 'app-breadcrumb-item',
    standalone: true,
    imports: [CommonModule],
    template: `
        <ng-content />

        @if (separator()) {
            <span class="separator">{{ separator() }}</span>
        }
    `,
    styles: [
        `
            :host {
                display: inline-block;
            }

            .separator {
                margin: 0 8px;
            }

            :host:last-child .separator {
                display: none;
            }
        `
    ]
})
class BreadcrumbItemComponent {
    private readonly breadcrumbComponent = inject(BreadcrumbComponent, {optional: true})

    protected readonly separator = computed(() => this.breadcrumbComponent?.separator() ?? '');
}

@Component({
    selector: 'demo-breadcrumb',
    standalone: true,
    imports: [BreadcrumbItemComponent],
    template: `
        <!-- Example with custom separator -->
        <app-breadcrumb separator=">">
            <app-breadcrumb-item>Home</app-breadcrumb-item>
            <app-breadcrumb-item>Components</app-breadcrumb-item>
            <app-breadcrumb-item>Breadcrumb</app-breadcrumb-item>
        </app-breadcrumb>

        <!-- Example with default separator -->
        <app-breadcrumb>
            <app-breadcrumb-item>Default</app-breadcrumb-item>
            <app-breadcrumb-item>Separator</app-breadcrumb-item>
        </app-breadcrumb>
    `
})
```

This pattern allows the custom breadcrumb separator defined as an input on the `app-breadcrumb` component to be injected directly into the `BreadcrumbItemComponent`.

It works because the `BreadcrumbItemComponent`'s dependency injection relies on the `app-breadcrumb` component's local provider registration. The key points are:

1. **providers in BreadcrumbComponent**: This registers the component instance itself as a provider available to its descendants.

2. **inject(BreadcrumbComponent, { optional: true })**: The `optional: true` flag is crucial. It ensures the `BreadcrumbItemComponent` still works correctly even when it is used outside of an `app-breadcrumb` component, preventing an injection error.

3. **useExisting with forwardRef**: This ensures that when the dependency is resolved, Angular uses the existing instance of the component being created, avoiding a circular reference error.
