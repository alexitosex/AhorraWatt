# AGENTS.md — AhorraWatt

## 1. Project Overview

**Project:** AhorraWatt  
**Type:** Cross-platform electricity consumption and savings application  
**Platforms:** Android, iOS, Web  
**Framework:** React Native + Expo  
**Language:** TypeScript  
**Primary market:** Mexico  
**Primary language:** Spanish (es-MX)  
**Currency:** MXN

### Product Vision

AhorraWatt is a modern, clean, user-friendly application that helps people understand their electricity consumption, track electricity expenses, monitor savings, and receive practical recommendations to reduce their energy bills.

The experience should feel polished, intuitive, fast, and trustworthy.

The visual direction takes inspiration from Apple's Human Interface Guidelines, while maintaining an original identity based on sustainability, energy efficiency, and simplicity.

The product is inspired by electricity billing experiences such as CFE in Mexico, but is not an official CFE application.

### Core Product Principles

1. Simplicity over complexity.
2. Clear information over excessive data.
3. Useful recommendations over generic advice.
4. Minimal manual input.
5. Responsive design across all supported platforms.
6. Accurate calculations and transparent data.
7. Consistent visual and interaction patterns.
8. Accessibility and usability.
9. Maintainable architecture.
10. No unnecessary features.

---

# 2. Core Features

## 2.1 Dashboard

The dashboard is the application's main screen.

It should display:

- A personalized greeting.
- The latest electricity bill.
- Total amount in MXN.
- Electricity consumption in kWh.
- Comparison with the previous billing period.
- Savings progress.
- Consumption trends.
- A useful energy-saving recommendation.
- A clear action to register a new bill.

The dashboard should prioritize meaningful information rather than decorative elements.

### Example

Latest bill: $850 MXN  
Previous bill: $1,050 MXN  
Difference: $200 MXN less  
Current consumption: 420 kWh

These are demonstration values, not actual user data.

The application must distinguish between paying less money and consuming less electricity.

A lower bill does not necessarily mean lower electricity consumption.

## 2.2 Electricity Bill Registration

Users must be able to manually register their electricity bills.

### Required fields

- Bill amount in MXN.
- Electricity consumption in kWh.
- Billing period start date.
- Billing period end date.

### Optional fields

- Billing tariff.
- Notes.
- Bill image or PDF, reserved for a future version.

### Requirements

- Validate all inputs.
- Reject negative monetary and consumption values.
- Validate date ranges.
- Prevent accidental duplicate records.
- Allow users to edit and delete existing records.
- Store historical bills.
- Display understandable validation errors.
- Use appropriate numeric inputs.
- Keep the registration flow short and intuitive.

Do not assume all electricity bills cover the same number of days.

## 2.3 Consumption Statistics

Provide clear visualizations of historical electricity usage.

### Charts

- Electricity expenses over time.
- kWh consumption over time.
- Comparison between billing periods.
- Savings trends.

### Requirements

- Use actual recorded data.
- Never fabricate daily consumption from a single monthly or bimonthly bill.
- Label units clearly.
- Distinguish MXN from kWh.
- Support empty states.
- Handle incomplete historical data.
- Display billing periods accurately.
- Consider differences in billing period duration.

Charts must be responsive and accessible.

## 2.4 Savings Progress

Users can define electricity-saving goals.

### Example

Previous consumption: 420 kWh  
Target reduction: 15%  
Target consumption: 357 kWh

### Requirements

- Allow users to define a reduction target.
- Calculate target consumption.
- Compare actual consumption against the baseline.
- Display progress visually.
- Distinguish target progress from achieved savings.
- Avoid misleading financial savings predictions.
- Explain when there is insufficient historical data.

Savings calculations should use comparable billing periods.

## 2.5 Energy-Saving Tips

Provide useful, actionable recommendations.

### Initial categories

- Air conditioning.
- Lighting.
- Refrigeration.
- Appliances.
- Standby electricity usage.
- Household habits.
- General energy efficiency.

### Requirements

- Keep recommendations short and understandable.
- Explain the reason behind each recommendation.
- Prioritize practical actions.
- Avoid exaggerated savings claims.
- Do not pretend to know which appliance consumes the most electricity without supporting data.
- Allow future personalization based on user-reported appliances and habits.

The first version may use deterministic, rule-based recommendations.

Artificial intelligence integration is not required for the MVP.

## 2.6 Settings

Settings should eventually support:

- User preferences.
- Savings goals.
- Currency and locale.
- Notification preferences.
- Theme preferences.
- Data management.

Do not implement unnecessary settings before their corresponding functionality exists.

---

# 3. MVP Scope

The first version must focus on:

1. Responsive dashboard.
2. Manual electricity bill registration.
3. Persistent bill history.
4. Basic consumption statistics.
5. Savings calculations.
6. Savings goals.
7. Rule-based energy-saving tips.
8. Basic settings.

### Not Required Initially

- Direct CFE integration.
- Automatic smart-meter integration.
- AI-powered recommendations.
- Payment processing.
- OCR bill scanning.
- Complex user management.
- Social features.
- Gamification.
- Real-time electricity monitoring.

These features may be considered later.

Do not implement them without explicit approval.

---

# 4. Technology Stack

## Core

- React Native
- Expo
- Expo Router
- TypeScript with strict mode
- React Native Web

## Styling

Use React Native StyleSheet with centralized design tokens as the initial styling approach.

Do not introduce NativeWind unless explicitly requested.

## State Management

- React state for local component state.
- Custom hooks for reusable stateful behavior.
- Zustand only when shared client state becomes necessary.
- TanStack Query when asynchronous server state is introduced.

Do not introduce global state management prematurely.

## Forms

- React Hook Form when form complexity justifies it.
- Zod for runtime validation.

## Charts

Use a maintained charting solution compatible with the project's Expo SDK and supported platforms.

Evaluate compatibility before installing dependencies.

## Persistence

Use a repository abstraction to separate application logic from storage.

For the initial MVP, prefer a suitable local persistence solution with support for the intended platforms.

A future backend may use Supabase.

Do not introduce Supabase authentication or cloud synchronization until required.

## Testing

- Jest.
- React Native Testing Library.
- Unit tests for important business calculations.

## Code Quality

- ESLint.
- Prettier.
- TypeScript strict checks.
- Git.
- GitHub Actions when CI is configured.

Use versions compatible with the installed Expo SDK.

Never invent package versions or assume compatibility without verification.

---

# 5. Architecture

Use a pragmatic feature-based architecture.

Avoid excessive Clean Architecture layers.

The objective is a codebase that is understandable to junior developers and maintainable by senior developers.

## Recommended Structure

```text
AhorraWatt/
├── app/
│   ├── _layout.tsx
│   └── index.tsx
│
├── src/
│   ├── features/
│   │   ├── dashboard/
│   │   ├── receipts/
│   │   ├── savings/
│   │   ├── statistics/
│   │   └── tips/
│   │
│   ├── components/
│   │   ├── ui/
│   │   └── layout/
│   │
│   ├── design-system/
│   │   ├── tokens/
│   │   └── themes/
│   │
│   ├── lib/
│   │   ├── storage/
│   │   └── utils/
│   │
│   ├── hooks/
│   ├── config/
│   └── types/
│
├── assets/
├── tests/
├── docs/
├── AGENTS.md
├── package.json
├── tsconfig.json
└── app.json
```

This is the target structure, not a requirement to create every directory immediately.

Create directories only when needed.

## Architectural Responsibilities

### app/

Contains Expo Router routes and navigation layouts.

Route files should remain lightweight.

Avoid placing complex business logic inside route files.

### features/

Contains product-specific functionality.

Each feature owns its relevant components, hooks, types, validation, and business logic.

Example:

```text
features/receipts/
├── components/
│   ├── ReceiptCard.tsx
│   └── ReceiptForm.tsx
├── hooks/
│   └── useReceipts.ts
├── services/
│   └── receiptRepository.ts
├── utils/
│   └── calculateConsumption.ts
├── schemas/
│   └── receipt.schema.ts
├── types/
│   └── receipt.types.ts
└── screens/
    └── ReceiptsScreen.tsx
```

Only create these files when their responsibilities are necessary.

### components/

Contains genuinely reusable presentation components.

Examples:

- Button.
- Card.
- Input.
- Modal.
- ScreenContainer.
- EmptyState.

Do not move feature-specific components here prematurely.

### design-system/

Contains visual foundations.

Examples:

- Colors.
- Typography.
- Spacing.
- Border radii.
- Shadows.
- Themes.
- Responsive breakpoints.

### lib/

Contains shared technical utilities and integrations.

Examples:

- Storage adapters.
- API clients.
- Date utilities.
- Formatting utilities.

Do not turn this directory into an unorganized collection of unrelated code.

---

# 6. Engineering Standards

## 6.1 Code Language

All code identifiers must be in English.

This includes:

- Variables.
- Functions.
- Components.
- Files.
- Types.
- Interfaces.
- Tests.

User-facing content should use Spanish appropriate for Mexico.

## 6.2 TypeScript

Use strict TypeScript.

Avoid:

- `any`.
- Unsafe type assertions.
- Unnecessary non-null assertions.
- Unnecessary type duplication.
- Excessively generic types.

Prefer type inference when types are obvious.

Use explicit types when they improve clarity or define contracts.

## 6.3 Naming

Names should be concise, descriptive, and consistent.

Good:

- `ReceiptForm`
- `calculateSavings`
- `useReceipts`
- `saveReceipt`
- `ConsumptionChart`

Bad:

- `DataManagerHelper`
- `handleUserClickOnSaveReceiptButton`
- `processDataStuff`
- `GenericBaseController`

Avoid unnecessary abbreviations.

## 6.4 Functions

Functions should have clear responsibilities.

Prefer straightforward implementations.

Avoid:

- Deep nesting.
- Hidden side effects.
- Excessive parameters.
- Giant functions.
- Artificially splitting simple logic.
- Unnecessary helper functions.

Do not impose arbitrary line-count limits.

## 6.5 Components

Components should be easy to read and maintain.

Prefer composition.

Avoid:

- Giant JSX expressions.
- Business logic embedded in complex JSX.
- Excessive prop drilling.
- Premature generic components.
- Unnecessary wrappers.

## 6.6 Hooks

Use hooks intentionally.

Do not use:

- `useEffect` for values that can be derived during rendering.
- `useMemo` for trivial calculations without a reason.
- `useCallback` everywhere by default.
- Global state for local UI interactions.

Follow React's rules of hooks.

## 6.7 Error Handling

Never silently ignore errors.

Avoid empty catch blocks.

Provide meaningful user-facing error messages.

Handle loading, success, empty, and error states where applicable.

Do not expose sensitive implementation details to users.

---

# 7. Strict AI Coding Rules

These instructions are mandatory for AI coding assistants.

## 7.1 No AI-Generated Boilerplate

Do not generate unnecessary code to make an implementation look more sophisticated.

Avoid:

- Unnecessary interfaces.
- Abstract classes.
- Factories without real use cases.
- Redundant wrappers.
- Empty services.
- Placeholder functions.
- Excessive configuration.
- Premature extensibility.

## 7.2 No Obvious Comments

Do not write comments that simply repeat what the code does.

Bad:

```ts
// Calculate the difference
const difference = previous - current;

// Return the difference
return difference;
```

Good:

```ts
const difference = previous - current;

return difference;
```

Comments are allowed when explaining:

- Non-obvious business rules.
- Technical limitations.
- External system behavior.
- Important architectural decisions.
- Unusual workarounds.

Prefer readable code over explanatory comments.

Do not generate decorative comment separators.

Do not add JSDoc to every function.

## 7.3 No Unnecessary Refactoring

When implementing a feature:

1. Inspect relevant existing code.
2. Understand current conventions.
3. Identify the smallest necessary change.
4. Implement the requested behavior.
5. Verify the result.

Do not rewrite unrelated files.

Do not rename unrelated components.

Do not reorganize the project without approval.

## 7.4 No Fake Implementations

Never present placeholder behavior as a finished feature.

Do not:

- Fake successful API responses.
- Invent endpoints.
- Pretend data was saved.
- Generate fake production statistics.
- Silently replace errors with demo data.
- Claim unsupported functionality works.

Mock data is permitted for explicitly identified UI prototypes and tests.

## 7.5 No Unnecessary Dependencies

Before installing a dependency:

- Determine whether existing tools solve the problem.
- Check Expo compatibility.
- Consider maintenance.
- Consider bundle size.
- Explain significant tradeoffs.

Do not install packages merely because they are popular.

## 7.6 No Overengineering

Do not introduce:

- Microservices.
- Complex dependency injection.
- Event buses.
- Enterprise-style factories.
- Unnecessary providers.
- Excessive architectural layers.
- Generic frameworks for simple functionality.

Choose the simplest maintainable solution.

## 7.7 No Unrequested Features

Implement only the requested functionality and necessary supporting changes.

Do not invent additional product requirements.

Ask for clarification when an unresolved decision materially changes the implementation.

For minor unspecified details, follow established project conventions.

---

# 8. Responsive Design Requirements

AhorraWatt must support mobile, tablet, and desktop web.

Responsive design means reorganizing the interface, not simply scaling it.

## Mobile

- Vertical layout.
- Bottom navigation.
- Single-column dashboard.
- Full-width cards.
- Comfortable touch targets.
- Scrollable content.
- Safe-area support.

## Tablet

- Adaptive multi-column layouts.
- Larger charts.
- Appropriate content spacing.
- Navigation adapted to available width.

## Desktop Web

- Horizontal dashboard.
- Sidebar navigation.
- Multiple content columns.
- Larger analytical visualizations.
- Appropriate maximum content width.
- Mouse and keyboard usability.

## Suggested Breakpoints

These are project-specific starting values, not Apple requirements.

- Mobile: below 600 logical pixels.
- Tablet: 600–1023 logical pixels.
- Desktop: 1024 logical pixels and above.

Use available window or container dimensions.

Do not rely exclusively on platform detection.

Avoid hardcoded device-specific screen sizes.

---

# 9. Design System

## Visual Identity

AhorraWatt should feel:

- Clean.
- Modern.
- Calm.
- Trustworthy.
- Friendly.
- Minimal.
- Premium.
- Accessible.

Use Apple Human Interface Guidelines as a reference for interaction quality, hierarchy, and consistency.

Do not blindly copy Apple's proprietary visual assets.

## Colors

Suggested starting palette:

- Primary green: `#238347`
- Dark green: `#176B37`
- Light green: `#E8F4E9`
- Background: `#F7F9F7`
- Surface: `#FFFFFF`
- Primary text: `#17231B`
- Secondary text: `#68756D`
- Accent yellow: `#F4BE35`
- Error: `#C43D3D`

These values are initial design proposals.

Centralize all colors in design tokens.

Avoid scattering hex values across components.

## Spacing

Use a consistent spacing scale.

Suggested values:

- 4
- 8
- 12
- 16
- 20
- 24
- 32
- 40

## Typography

Use a consistent typographic hierarchy.

Prioritize readability.

Support system font scaling where appropriate.

Avoid tiny text.

## Border Radii

Use reusable tokens for:

- Buttons.
- Cards.
- Inputs.
- Modals.

Avoid arbitrary radius values in every component.

## Shadows

Use subtle shadows.

Avoid exaggerated elevation effects.

## Animations

Animations should communicate:

- State changes.
- Progress.
- Successful actions.
- Navigation transitions.

Avoid unnecessary animations.

Respect reduced-motion accessibility preferences.

---

# 10. Electricity Domain Rules

Electricity consumption and electricity billing are not interchangeable.

## Consumption

Measured in kWh.

## Bill Amount

Measured in MXN.

## Financial Difference

Previous bill amount minus current bill amount.

## Consumption Difference

Previous consumption minus current consumption.

## Percentage Reduction

For a positive baseline:

```text
(previous - current) / previous * 100
```

Handle zero or invalid baselines explicitly.

## Billing Periods

Preserve the start and end dates of every bill.

Avoid comparing periods of significantly different lengths without appropriate context.

Do not assume daily consumption patterns from aggregate bill data.

## Recommendations

Do not claim that a specific appliance caused higher consumption unless supporting information exists.

Use careful language when estimating potential savings.

Do not promise a specific reduction in electricity bills.

---

# 11. Data Model

Initial conceptual model:

```ts
type ElectricityBill = {
  id: string;
  amount: number;
  consumptionKwh: number;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  updatedAt: string;
};
```

All dates should follow a consistent representation.

Use a suitable date-only format for billing period dates.

Define clear rules for timezone handling.

Validate persisted data when reading it.

Do not use floating-point arithmetic carelessly for financial calculations.

Consider storing monetary values as integer centavos if precise calculations require it.

---

# 12. Testing Standards

Prioritize tests for important business rules.

Test:

- Consumption differences.
- Savings percentages.
- Zero baselines.
- Negative inputs.
- Invalid billing periods.
- Receipt validation.
- Data persistence.
- Relevant UI interactions.

Do not create meaningless tests solely to increase test counts.

Prefer behavioral tests over implementation-detail tests.

---

# 13. Security and Privacy

Treat user electricity and financial information as private.

Requirements:

- Do not log sensitive data unnecessarily.
- Do not commit secrets.
- Do not hardcode private credentials.
- Validate external inputs.
- Use appropriate storage for sensitive information.
- Apply least-privilege access.
- Keep third-party integrations minimal.
- Do not expose service-role credentials in the client.
- Document data collection when applicable.

If authentication and cloud synchronization are introduced, define access-control policies before production deployment.

---

# 14. Documentation Standards

Maintain a concise README explaining:

- Project purpose.
- Requirements.
- Installation.
- Development commands.
- Testing commands.
- Platform support.
- Project structure.

Document important architectural decisions when necessary.

Do not generate excessive documentation.

Documentation should explain decisions and workflows, not repeat obvious code.

---

# 15. Codex Workflow

For every development task:

### Before Coding

1. Inspect the repository.
2. Read existing project conventions.
3. Identify relevant files.
4. Understand the requested behavior.
5. Check dependencies and platform constraints.

### During Coding

1. Follow existing patterns.
2. Make focused changes.
3. Keep code readable.
4. Avoid unrelated refactoring.
5. Avoid unnecessary comments.
6. Maintain strict types.
7. Handle meaningful edge cases.

### After Coding

1. Run TypeScript checks when available.
2. Run ESLint when available.
3. Run relevant tests.
4. Check platform compatibility where possible.
5. Report what changed.
6. Report anything not verified.

Never claim a test passed unless it actually ran successfully.

Do not claim the application was visually verified unless it was rendered and inspected.

---

# 16. Communication Style

Codex should communicate concisely.

Avoid:

- Excessive explanations.
- Repeating the user's request.
- Long introductions.
- Unnecessary praise.
- Explaining every line of code.
- Claiming code is production-ready without verification.

Prefer:

- Clear implementation summaries.
- Relevant technical decisions.
- Concise explanations of tradeoffs.
- Honest verification results.
- Explicit blockers.

The user communicates primarily in Spanish.

Respond in Spanish unless requested otherwise.

Keep code and identifiers in English.

---

# 17. Development Priorities

Implement AhorraWatt incrementally.

Recommended order:

1. Initialize Expo and TypeScript.
2. Establish project structure.
3. Create design tokens.
4. Implement responsive application layout.
5. Implement dashboard with clearly labeled demo data.
6. Build electricity bill registration.
7. Implement validation.
8. Add local persistence.
9. Build historical statistics.
10. Implement savings calculations and goals.
11. Add rule-based recommendations.
12. Add tests and polish.
13. Evaluate cloud synchronization.
14. Prepare Android, iOS, and Web builds.

Do not implement all phases simultaneously.

Complete and verify one functional vertical slice at a time.

---

# 18. Definition of Done

A feature is complete when:

- It fulfills its acceptance criteria.
- Its important inputs are validated.
- Errors are handled appropriately.
- It follows project conventions.
- It works on the relevant target platforms.
- Relevant tests pass.
- It does not introduce unnecessary complexity.
- It does not silently break existing functionality.
- It does not contain fake or incomplete behavior presented as finished.

If verification is incomplete, explicitly report the limitation.

---

# 19. Final Engineering Philosophy

AhorraWatt should be built as a maintainable product, not a demonstration of architectural complexity.

The code should be understandable to junior developers and reliable enough for experienced developers to extend.

Prioritize:

**Clarity > Cleverness**

**Maintainability > Abstraction**

**Correctness > Speed**

**Consistency > Personal Preference**

**User Experience > Visual Decoration**

**Simple Working Software > Unnecessary Engineering**

The goal is not to write code that looks impressive.

The goal is to build a reliable, beautiful, responsive application that people can understand and use.

---

# 20. Initial Codex Instructions

When starting work on this repository:

1. Read this AGENTS.md file.
2. Inspect the current project state.
3. Determine whether Expo is already initialized.
4. Do not overwrite existing work.
5. Use the installed Expo SDK's compatible dependencies.
6. Implement only the next requested development phase.
7. Keep the architecture minimal until features justify expansion.
8. Do not add unnecessary comments or boilerplate.
9. Do not make unrequested product decisions.
10. Verify all changes that can reasonably be verified.

**AhorraWatt must remain clean, scalable, understandable, and intentionally engineered.**